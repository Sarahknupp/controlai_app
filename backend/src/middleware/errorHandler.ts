import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

// Error interface
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Error handler middleware
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Log error
  logger.error('Error occurred', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      details: err.details
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    }
  });

  // Set default status code
  const statusCode = err.statusCode || 500;

  // Set default error message
  const message = err.message || 'Internal Server Error';

  // Set default error code
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Set default error details
  const details = err.details || {};

  // Send error response
  res.status(statusCode).json({
    error: {
      code,
      message,
      details
    }
  });
};

// Error helper functions
export const errorHelpers = {
  // Create error
  createError: (message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details: any = {}): AppError => {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.code = code;
    error.details = details;
    return error;
  },

  // Create bad request error
  createBadRequestError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 400, 'BAD_REQUEST', details);
  },

  // Create unauthorized error
  createUnauthorizedError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 401, 'UNAUTHORIZED', details);
  },

  // Create forbidden error
  createForbiddenError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 403, 'FORBIDDEN', details);
  },

  // Create not found error
  createNotFoundError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 404, 'NOT_FOUND', details);
  },

  // Create conflict error
  createConflictError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 409, 'CONFLICT', details);
  },

  // Create validation error
  createValidationError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 422, 'VALIDATION_ERROR', details);
  },

  // Create internal server error
  createInternalServerError: (message: string, details: any = {}): AppError => {
    return errorHelpers.createError(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
};

// Not found handler middleware
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
}; 