import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { logger } from './logging';
import { Express } from 'express';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Cache options interface
interface CacheOptions {
  ttl?: number;
  key?: string;
  excludePaths?: string[];
}

// Cache middleware factory
export const createCacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 3600, // 1 hour
    key = 'cache',
    excludePaths = []
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = `${key}:${req.originalUrl}`;

      // Check cache
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        res.setHeader('content-type', 'application/json');
        res.setHeader('X-Cache', 'HIT');
        return res.json(data);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(body: any) {
        redis.setex(cacheKey, ttl, JSON.stringify(body))
          .catch(err => logger.error('Cache error', { error: err.message }));
        res.setHeader('X-Cache', 'MISS');
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache error', { error: (error as Error).message });
      next();
    }
  };
};

// Cache clear middleware
export const clearCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pattern = req.query.pattern as string;
    if (pattern) {
      const keys = await redis.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.flushdb();
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Cache helper functions
export const cacheHelpers = {
  // Get cache key
  getCacheKey: (prefix: string, key: string): string => {
    return `${prefix}:${key}`;
  },

  // Get cached data
  getCachedData: async (key: string): Promise<any> => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Set cached data
  setCachedData: async (key: string, data: any, ttl: number): Promise<void> => {
    await redis.setex(key, ttl, JSON.stringify(data));
  },

  // Delete cached data
  deleteCachedData: async (key: string): Promise<void> => {
    await redis.del(key);
  },

  // Clear cache by pattern
  clearCacheByPattern: async (pattern: string): Promise<void> => {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

export const applyCacheMiddleware = (app: Express): void => {
  try {
    // Cache control middleware
    app.use((req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Set cache headers
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
      res.setHeader('ETag', `"${Date.now()}"`);
      
      next();
    });

    logger.info('Cache middleware applied successfully');
  } catch (error) {
    logger.error('Error applying cache middleware:', error);
    throw error;
  }
}; 