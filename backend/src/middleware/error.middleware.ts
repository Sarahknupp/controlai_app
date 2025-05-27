import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { ForbiddenError } from '../errors/forbidden.error';
import { logger } from '../config/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers
    }
  });

  if (error instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: error.message
    });
  }

  if (error instanceof ForbiddenError) {
    return res.status(403).json({
      status: 'error',
      message: error.message
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: (error as any).errors
    });
  }

  // Handle MongoDB duplicate key errors
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate key error'
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Handle other errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const validateError = (error: Error) => {
  if (error instanceof UnauthorizedError) {
    return {
      status: 401,
      message: error.message
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      status: 403,
      message: error.message
    };
  }

  if (error.name === 'ValidationError') {
    return {
      status: 400,
      message: 'Validation failed',
      errors: (error as any).errors
    };
  }

  if (error.name === 'MongoError' && (error as any).code === 11000) {
    return {
      status: 409,
      message: 'Duplicate key error'
    };
  }

  if (error.name === 'JsonWebTokenError') {
    return {
      status: 401,
      message: 'Invalid token'
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      status: 401,
      message: 'Token expired'
    };
  }

  return {
    status: 500,
    message: 'Internal server error'
  };
}; 