import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Cache options interface
interface CacheOptions {
  ttl: number; // Time to live in seconds
  key?: string; // Custom cache key
  excludePaths?: string[]; // Paths to exclude from caching
}

// Default cache options
const defaultOptions: CacheOptions = {
  ttl: 300, // 5 minutes
  excludePaths: ['/api/auth', '/api/health'],
};

// Generate cache key
const generateCacheKey = (req: Request, customKey?: string): string => {
  if (customKey) {
    return `cache:${customKey}`;
  }
  return `cache:${req.method}:${req.originalUrl}`;
};

// Check if path should be cached
const shouldCache = (req: Request, excludePaths?: string[]): boolean => {
  if (!excludePaths) return true;
  return !excludePaths.some(path => req.path.startsWith(path));
};

// Cache middleware factory
export const createCacheMiddleware = (options: Partial<CacheOptions> = {}) => {
  const cacheOptions = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if path should be cached
    if (!shouldCache(req, cacheOptions.excludePaths)) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = generateCacheKey(req, cacheOptions.key);

      // Try to get cached response
      const cachedResponse = await redis.get(cacheKey);

      if (cachedResponse) {
        // Return cached response
        const { data, headers } = JSON.parse(cachedResponse);
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
        return res.json(data);
      }

      // Capture response
      const originalJson = res.json;
      res.json = function (body: any): Response {
        // Cache response
        redis.setex(
          cacheKey,
          cacheOptions.ttl,
          JSON.stringify({
            data: body,
            headers: res.getHeaders(),
          })
        );

        // Restore original json function
        res.json = originalJson;
        return res.json(body);
      };

      next();
    } catch (error) {
      // Log error and continue without caching
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache middleware
export const clearCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pattern = req.query.pattern as string;
    if (pattern) {
      // Clear specific cache keys
      const keys = await redis.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      // Clear all cache
      await redis.flushdb();
    }
    next();
  } catch (error) {
    next(error);
  }
}; 