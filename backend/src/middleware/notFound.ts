import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';
import { errorHelpers } from './errorHandler';

// Not found handler middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  // Log not found request
  logger.warn('Not found request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id
  });

  // Create not found error
  const error = errorHelpers.createNotFoundError('Resource not found', {
    method: req.method,
    url: req.originalUrl
  });

  // Pass error to error handler
  next(error);
}; 