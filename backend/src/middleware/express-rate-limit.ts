import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from './logging';

// Rate limit options interface
interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response, next: NextFunction, options: RateLimitOptions) => void;
  skip?: (req: Request, res: Response) => boolean;
}

// Default rate limit options
const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  keyGenerator: (req: Request) => req.ip,
  handler: (req: Request, res: Response, next: NextFunction, options: RateLimitOptions) => {
    // Log rate limit exceeded
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      max: options.max,
      windowMs: options.windowMs
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: options.message
    });
  },
  skip: (req: Request, res: Response) => {
    return false;
  }
};

// Rate limit middleware factory
export const createRateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const rateLimitOptions = { ...defaultOptions, ...options };

  return rateLimit(rateLimitOptions);
};

// Rate limit helper functions
export const rateLimitHelpers = {
  // Get rate limit window ms
  getRateLimitWindowMs: (): number => {
    return defaultOptions.windowMs!;
  },

  // Get rate limit max
  getRateLimitMax: (): number => {
    return defaultOptions.max!;
  },

  // Get rate limit message
  getRateLimitMessage: (): string => {
    return defaultOptions.message!;
  },

  // Get rate limit standard headers
  getRateLimitStandardHeaders: (): boolean => {
    return defaultOptions.standardHeaders!;
  },

  // Get rate limit legacy headers
  getRateLimitLegacyHeaders: (): boolean => {
    return defaultOptions.legacyHeaders!;
  },

  // Get rate limit skip failed requests
  getRateLimitSkipFailedRequests: (): boolean => {
    return defaultOptions.skipFailedRequests!;
  },

  // Get rate limit key generator
  getRateLimitKeyGenerator: (): (req: Request) => string => {
    return defaultOptions.keyGenerator!;
  },

  // Get rate limit handler
  getRateLimitHandler: (): (req: Request, res: Response, next: NextFunction, options: RateLimitOptions) => void => {
    return defaultOptions.handler!;
  },

  // Get rate limit skip
  getRateLimitSkip: (): (req: Request, res: Response) => boolean => {
    return defaultOptions.skip!;
  }
}; 