import { Request, Response, NextFunction } from 'express';
import { createCacheMiddleware, clearCache } from '../cache';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
    flushdb: jest.fn(),
  };
  return jest.fn(() => mockRedis);
});

describe('Cache Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      path: '/api/test',
      query: {},
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      getHeaders: jest.fn().mockReturnValue({ 'content-type': 'application/json' }),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
    mockRedis = new (Redis as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('createCacheMiddleware', () => {
    it('should skip caching for non-GET requests', async () => {
      mockRequest.method = 'POST';
      const middleware = createCacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should skip caching for excluded paths', async () => {
      const request = {
        ...mockRequest,
        path: '/api/auth/login',
      } as Request;
      const middleware = createCacheMiddleware();

      await middleware(request, mockResponse as Response, nextFunction);

      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return cached response if available', async () => {
      const cachedData = {
        data: { test: 'data' },
        headers: { 'content-type': 'application/json' },
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const middleware = createCacheMiddleware();
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('content-type', 'application/json');
      expect(mockResponse.json).toHaveBeenCalledWith(cachedData.data);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should cache response if not in cache', async () => {
      mockRedis.get.mockResolvedValue(null);

      const middleware = createCacheMiddleware();
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Call the modified json function
      const responseData = { test: 'data' };
      (mockResponse.json as jest.Mock)(responseData);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'cache:GET:/api/test',
        300,
        expect.stringContaining(JSON.stringify(responseData))
      );
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const middleware = createCacheMiddleware();
      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache keys when pattern is provided', async () => {
      mockRequest.query = { pattern: 'test' };
      mockRedis.keys.mockResolvedValue(['cache:test:1', 'cache:test:2']);

      await clearCache(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRedis.keys).toHaveBeenCalledWith('cache:test');
      expect(mockRedis.del).toHaveBeenCalledWith('cache:test:1', 'cache:test:2');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should clear all cache when no pattern is provided', async () => {
      await clearCache(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRedis.flushdb).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      mockRedis.flushdb.mockRejectedValue(new Error('Redis error'));

      await clearCache(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 