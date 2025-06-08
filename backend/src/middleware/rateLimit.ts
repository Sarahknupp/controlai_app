import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimiter({ windowMs, max, message, statusCode }: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Initialize or reset if window has passed
    if (!store[key] || store[key].resetTime < windowStart) {
      store[key] = {
        count: 0,
        resetTime: now
      };
    }

    // Increment counter
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > max) {
      logger.warn('Rate limit exceeded', { ip: key, count: store[key].count });
      return res.status(statusCode || 429).json({
        error: message || 'Too many requests',
        retryAfter: Math.ceil((store[key].resetTime + windowMs - now) / 1000)
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));

    next();
  };
}

// Default rate limiter (100 requests per 15 minutes)
export const defaultRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });

// Auth rate limiter (5 requests per 15 minutes)
export const authRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });

// Create stricter rate limiter for authentication routes
export const authRateLimiterStrict = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

// Create rate limiter for API routes
export const apiRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });

// Create rate limiter for public routes
export const publicRateLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 1000 }); 