import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { logger } from './logging';

// Morgan options interface
interface MorganOptions {
  format?: string;
  options?: any;
  skip?: (req: Request, res: Response) => boolean;
}

// Default morgan options
const defaultOptions: MorganOptions = {
  format: 'combined',
  options: {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      }
    }
  },
  skip: (req: Request, res: Response) => {
    return false;
  }
};

// Morgan middleware factory
export const createMorganMiddleware = (options: MorganOptions = {}) => {
  const morganOptions = { ...defaultOptions, ...options };

  return morgan(morganOptions.format!, morganOptions.options);
};

// Morgan helper functions
export const morganHelpers = {
  // Get morgan format
  getMorganFormat: (): string => {
    return defaultOptions.format!;
  },

  // Get morgan options
  getMorganOptions: (): any => {
    return defaultOptions.options;
  },

  // Check if request should be skipped
  shouldSkipRequest: (req: Request, res: Response): boolean => {
    return defaultOptions.skip!(req, res);
  }
}; 