import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { createLogger, format, transports } from 'winston';

// Create error logger
const errorLogger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log' }),
  ],
});

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  errorLogger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    },
  });

  // Handle API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      errors: error.errors,
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(422).json({
      status: 'error',
      message: 'Validation error',
      errors: [
        {
          field: error.name,
          message: error.message,
        },
      ],
    });
  }

  // Handle database errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
    });
  }

  if (error.name === 'SequelizeValidationError') {
    return res.status(422).json({
      status: 'error',
      message: 'Validation error',
      errors: [
        {
          field: error.name,
          message: error.message,
        },
      ],
    });
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    status: 'error',
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
  });
}; 