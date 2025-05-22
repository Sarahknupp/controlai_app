import { AxiosError } from 'axios';
import { message } from 'antd';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    const data = error.response?.data;

    // Show error message to user
    message.error(errorMessage);

    // Return standardized error
    return new ApiError(status, errorMessage, data);
  }

  // Handle non-Axios errors
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  message.error(errorMessage);
  return new ApiError(500, errorMessage);
}; 