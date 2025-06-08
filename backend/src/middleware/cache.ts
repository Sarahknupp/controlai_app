import Redis from 'ioredis';
import { logger } from './logging';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const createCacheMiddleware = (ttl: number = 300) => {
  return async (req: any, res: any, next: any) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for excluded paths
    const excludedPaths = ['/api/auth/login', '/api/auth/register'];
    if (excludedPaths.includes(req.originalUrl)) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        res.setHeader('content-type', 'application/json');
        return res.json(data);
      }

      // Override json function
      const originalJson = res.json;
      res.json = function(body: any) {
        redis.setex(key, ttl, JSON.stringify(body))
          .catch(err => logger.error('Cache error', { error: err.message }));
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      logger.error('Cache error', { error: err.message });
      next();
    }
  };
};

export const clearCache = async (req: any, res: any, next: any) => {
  try {
    const pattern = req.query.pattern ? `cache:${req.query.pattern}` : 'cache:*';
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    } else {
      await redis.flushdb();
    }

    next();
  } catch (err) {
    next(err);
  }
}; 