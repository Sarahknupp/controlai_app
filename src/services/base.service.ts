import { getApiConfig } from '../config/api';
import { loggingService } from './logging.service';
import { cacheService } from './cache.service';
import { requestInterceptor } from './interceptors';
import { debounce } from '../utils/performance';

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  useCache?: boolean;
  debounce?: boolean;
  cacheKey?: string;
}

export default class BaseService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = getApiConfig().baseUrl;
  }

  public async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const { method = 'GET', headers = {}, body, params, useCache = false } = options;

    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Check cache for GET requests
    if (method === 'GET' && useCache) {
      const cachedData = cacheService.get(url.toString());
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      // Prepare request
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      // Intercept request
      const interceptedRequest = await requestInterceptor.handleRequest(
        new Request(url.toString(), requestOptions)
      );

      // Make request
      const response = await fetch(interceptedRequest);
      const interceptedResponse = await requestInterceptor.handleResponse(response);

      if (!interceptedResponse.ok) {
        const error = await interceptedResponse.json().catch(() => ({
          message: 'Erro na requisição'
        }));
        throw new Error(error.message);
      }

      const data = await interceptedResponse.json();

      // Cache response for GET requests
      if (method === 'GET' && useCache) {
        cacheService.set(url.toString(), data);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        loggingService.error(
          'Erro na requisição',
          'BaseService',
          { endpoint, method },
          error
        );
      }
      throw error;
    }
  }

  public async get(endpoint: string, params?: Record<string, any>, options: RequestOptions = {}): Promise<any> {
    const { debounce: debounceTime } = options;
    
    if (debounceTime) {
      return debounce(
        () => this.request(endpoint, { method: 'GET', params, ...options }),
        debounceTime
      );
    }

    return this.request(endpoint, { method: 'GET', params, ...options });
  }

  public async post(endpoint: string, data: any, options: RequestOptions = {}): Promise<any> {
    return this.request(endpoint, { method: 'POST', body: data, ...options });
  }

  public async put(endpoint: string, data: any, options: RequestOptions = {}): Promise<any> {
    return this.request(endpoint, { method: 'PUT', body: data, ...options });
  }

  public async delete(endpoint: string, options: RequestOptions = {}): Promise<any> {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  public async download(endpoint: string, filename: string, options: RequestOptions = {}): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: options.headers
      });

      const interceptedResponse = await requestInterceptor.handleResponse(response);

      if (!interceptedResponse.ok) {
        const error = new Error('Erro ao baixar arquivo');
        loggingService.error(
          'Erro ao baixar arquivo',
          'BaseService',
          { endpoint, filename },
          error
        );
        throw error;
      }

      const blob = await interceptedResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      loggingService.info('Arquivo baixado com sucesso', 'BaseService', { endpoint, filename });
    } catch (error) {
      if (error instanceof Error) {
        loggingService.error(
          'Erro ao baixar arquivo',
          'BaseService',
          { endpoint, filename },
          error
        );
      }
      throw error;
    }
  }
} 