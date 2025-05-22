import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createError } from '../utils/error';
import { TooManyRequestsError } from '../utils/errors';

// Store for tracking IP addresses and their request counts
const ipStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipStore.entries()) {
    if (now > data.resetTime) {
      ipStore.delete(ip);
    }
  }
}, 60000);

// Create rate limiter middleware
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // Limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message,
    },
    standardHeaders,
    legacyHeaders,
    handler: (req, res) => {
      throw new TooManyRequestsError(message);
    },
  });
};

// Create stricter rate limiter for authentication routes
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many login attempts, please try again later',
});

// Create rate limiter for API routes
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
});

// Create rate limiter for public routes
export const publicRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests, please try again later',
}); 