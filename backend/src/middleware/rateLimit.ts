import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';
import { errorHelpers } from './errorHandler';

// Rate limit options interface
interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

// Default rate limit options
const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests',
  keyGenerator: (req: Request) => req.ip,
  skip: (req: Request) => false
};

// Store for rate limit data
const store = new Map<string, { count: number; resetTime: number }>();

// Rate limit middleware factory
export const createRateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const rateLimitOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limit if skip function returns true
      if (rateLimitOptions.skip!(req)) {
        return next();
      }

      // Get key for rate limit
      const key = rateLimitOptions.keyGenerator!(req);

      // Get current time
      const now = Date.now();

      // Get rate limit data
      let data = store.get(key);

      // Initialize rate limit data if not exists
      if (!data) {
        data = {
          count: 0,
          resetTime: now + rateLimitOptions.windowMs!
        };
        store.set(key, data);
      }

      // Reset count if window has passed
      if (now > data.resetTime) {
        data.count = 0;
        data.resetTime = now + rateLimitOptions.windowMs!;
      }

      // Increment count
      data.count++;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimitOptions.max!);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitOptions.max! - data.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));

      // Check if rate limit exceeded
      if (data.count > rateLimitOptions.max!) {
        // Log rate limit exceeded
        logger.warn('Rate limit exceeded', {
          key,
          count: data.count,
          max: rateLimitOptions.max,
          windowMs: rateLimitOptions.windowMs
        });

        // Create rate limit error
        const error = errorHelpers.createError(
          rateLimitOptions.message!,
          429,
          'RATE_LIMIT_EXCEEDED',
          {
            key,
            count: data.count,
            max: rateLimitOptions.max,
            windowMs: rateLimitOptions.windowMs
          }
        );

        // Pass error to error handler
        return next(error);
      }

      next();
    } catch (error) {
      logger.error('Rate limit error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Rate limit helper functions
export const rateLimitHelpers = {
  // Get rate limit data
  getRateLimitData: (key: string): { count: number; resetTime: number } | undefined => {
    return store.get(key);
  },

  // Reset rate limit data
  resetRateLimitData: (key: string): void => {
    store.delete(key);
  },

  // Clear all rate limit data
  clearRateLimitData: (): void => {
    store.clear();
  }
}; 