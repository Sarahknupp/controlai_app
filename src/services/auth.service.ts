import { IUser, UserSettings } from '../types/auth';
import { handleError } from '../utils/error';

class AuthService {
  private baseUrl = '/api/auth';

  async login(email: string, password: string): Promise<IUser> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw handleError(error);
    }
  }

  async getCurrentUser(): Promise<IUser> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateProfile(profile: Partial<IUser>): Promise<IUser> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<IUser> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      throw handleError(error);
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      throw handleError(error);
    }
  }
}

export const authService = new AuthService(); 