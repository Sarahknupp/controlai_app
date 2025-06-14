import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';
import { errorHelpers } from './errorHandler';

// Timeout options interface
interface TimeoutOptions {
  timeout?: number;
  message?: string;
}

// Default timeout options
const defaultOptions: TimeoutOptions = {
  timeout: 30000, // 30 seconds
  message: 'Request timeout'
};

// Timeout middleware factory
export const createTimeoutMiddleware = (options: TimeoutOptions = {}) => {
  const timeoutOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // Set timeout
    const timeout = setTimeout(() => {
      // Log timeout
      logger.warn('Request timeout', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
        timeout: timeoutOptions.timeout
      });

      // Create timeout error
      const error = errorHelpers.createError(
        timeoutOptions.message!,
        408,
        'REQUEST_TIMEOUT',
        {
          method: req.method,
          url: req.originalUrl,
          timeout: timeoutOptions.timeout
        }
      );

      // Pass error to error handler
      next(error);
    }, timeoutOptions.timeout);

    // Clear timeout on response
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Timeout helper functions
export const timeoutHelpers = {
  // Set request timeout
  setRequestTimeout: (req: Request, timeout: number): void => {
    req.setTimeout(timeout);
  },

  // Set response timeout
  setResponseTimeout: (res: Response, timeout: number): void => {
    res.setTimeout(timeout);
  },

  // Set socket timeout
  setSocketTimeout: (req: Request, timeout: number): void => {
    req.socket.setTimeout(timeout);
  }
}; 