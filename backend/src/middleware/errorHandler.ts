import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error
  if (err.isOperational) {
    logger.warn('Operational error', { error: err.message, stack: err.stack });
  } else {
    logger.error('Programming error', { error: err.message, stack: err.stack });
  }

  // Handle specific error types
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.details
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid Token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token Expired'
    });
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      message: 'Duplicate Entry'
    });
  }

  // Handle unknown errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response: any = {
    success: false,
    message
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}; 