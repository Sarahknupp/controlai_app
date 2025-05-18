import { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    headers: {
      Authorization?: string;
      'Content-Type': string;
    };
  }
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
} 