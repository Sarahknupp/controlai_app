import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

// Async handler middleware factory
export const createAsyncHandlerMiddleware = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      // Log error
      logger.error('Async handler error', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      next(error);
    }
  };
};

// Async handler helper functions
export const asyncHandlerHelpers = {
  // Wrap async handler
  wrapAsyncHandler: (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return createAsyncHandlerMiddleware(handler);
  },

  // Wrap async handlers
  wrapAsyncHandlers: (handlers: ((req: Request, res: Response, next: NextFunction) => Promise<any>)[]) => {
    return handlers.map(handler => createAsyncHandlerMiddleware(handler));
  }
}; 