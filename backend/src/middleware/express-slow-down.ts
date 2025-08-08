import { Request, Response, NextFunction } from 'express';
import slowDown from 'express-slow-down';
import { logger } from './logging';

// Slow down options interface
interface SlowDownOptions {
  windowMs?: number;
  delayAfter?: number;
  delayMs?: number;
  maxDelayMs?: number;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request, res: Response) => boolean;
}

// Default slow down options
const defaultOptions: SlowDownOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // start delaying after 100 requests
  delayMs: 500, // delay 500ms for each request
  maxDelayMs: 2000, // maximum delay of 2000ms
  skipFailedRequests: false,
  keyGenerator: (req: Request) => req.ip,
  skip: (req: Request, res: Response) => {
    return false;
  }
};

// Slow down middleware factory
export const createSlowDownMiddleware = (options: SlowDownOptions = {}) => {
  const slowDownOptions = { ...defaultOptions, ...options };

  return slowDown(slowDownOptions);
};

// Slow down helper functions
export const slowDownHelpers = {
  // Get slow down window ms
  getSlowDownWindowMs: (): number => {
    return defaultOptions.windowMs!;
  },

  // Get slow down delay after
  getSlowDownDelayAfter: (): number => {
    return defaultOptions.delayAfter!;
  },

  // Get slow down delay ms
  getSlowDownDelayMs: (): number => {
    return defaultOptions.delayMs!;
  },

  // Get slow down max delay ms
  getSlowDownMaxDelayMs: (): number => {
    return defaultOptions.maxDelayMs!;
  },

  // Get slow down skip failed requests
  getSlowDownSkipFailedRequests: (): boolean => {
    return defaultOptions.skipFailedRequests!;
  },

  // Get slow down key generator
  getSlowDownKeyGenerator: (): (req: Request) => string => {
    return defaultOptions.keyGenerator!;
  },

  // Get slow down skip
  getSlowDownSkip: (): (req: Request, res: Response) => boolean => {
    return defaultOptions.skip!;
  }
}; 