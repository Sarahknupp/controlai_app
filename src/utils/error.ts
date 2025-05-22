import { message } from 'antd';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleError = (error: unknown): never => {
  if (error instanceof ApiError) {
    message.error(error.message);
    throw error;
  }

  if (error instanceof Error) {
    message.error(error.message);
    throw new ApiError(error.message);
  }

  message.error('Ocorreu um erro inesperado');
  throw new ApiError('Ocorreu um erro inesperado');
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado';
};

export const logError = (error: unknown, context?: string) => {
  const errorMessage = getErrorMessage(error);
  const timestamp = new Date().toISOString();
  const errorDetails = {
    message: errorMessage,
    context,
    timestamp,
    stack: error instanceof Error ? error.stack : undefined
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorDetails);
  }

  // TODO: Implement proper error logging service
  // This could be sent to a logging service like Sentry, LogRocket, etc.
}; 