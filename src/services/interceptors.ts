import { getApiConfig } from '../config/api';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000
};

class RequestInterceptor {
  private static instance: RequestInterceptor;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {}

  static getInstance(): RequestInterceptor {
    if (!RequestInterceptor.instance) {
      RequestInterceptor.instance = new RequestInterceptor();
    }
    return RequestInterceptor.instance;
  }

  private async refreshToken(): Promise<string> {
    try {
      const response = await fetch(`${getApiConfig().baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refreshToken')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.token;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw error;
    }
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  async handleRequest(request: Request): Promise<Request> {
    const config = getApiConfig();
    const token = localStorage.getItem('token');

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    return request;
  }

  async handleResponse(response: Response, retryConfig: RetryConfig = defaultRetryConfig): Promise<Response> {
    if (response.ok) {
      return response;
    }

    if (response.status === 401) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();
          this.onTokenRefreshed(newToken);
          this.isRefreshing = false;

          // Retry the original request with the new token
          const retryRequest = new Request(response.url, {
            headers: {
              ...Object.fromEntries(response.headers),
              'Authorization': `Bearer ${newToken}`
            }
          });

          return fetch(retryRequest);
        } catch (error) {
          this.isRefreshing = false;
          throw error;
        }
      } else {
        // If token refresh is in progress, wait for it
        return new Promise(resolve => {
          this.addRefreshSubscriber(token => {
            const retryRequest = new Request(response.url, {
              headers: {
                ...Object.fromEntries(response.headers),
                'Authorization': `Bearer ${token}`
              }
            });
            resolve(fetch(retryRequest));
          });
        });
      }
    }

    // Handle other errors with retry logic
    if (response.status >= 500 && retryConfig.maxRetries > 0) {
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));
      return this.handleResponse(response, {
        maxRetries: retryConfig.maxRetries - 1,
        retryDelay: retryConfig.retryDelay * 2
      });
    }

    return response;
  }
}

export const requestInterceptor = RequestInterceptor.getInstance(); 