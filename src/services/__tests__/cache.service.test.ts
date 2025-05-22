import { cacheService } from '../cache.service';
import { getApiConfig } from '../../config/api';

jest.mock('../../config/api', () => ({
  getApiConfig: jest.fn().mockReturnValue({
    baseUrl: 'https://app-controlaivendas.repl.co/api'
  })
}));

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
    jest.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate a key from endpoint and params', () => {
      const endpoint = '/test';
      const params = { id: 1, filter: 'active' };
      const key = cacheService.generateKey(endpoint, params);

      expect(key).toBe(`${getApiConfig().baseUrl}${endpoint}?id=1&filter=active`);
    });

    it('should handle undefined parameters', () => {
      const endpoint = '/test';
      const key = cacheService.generateKey(endpoint);

      expect(key).toBe(`${getApiConfig().baseUrl}${endpoint}`);
    });

    it('should handle empty parameters', () => {
      const endpoint = '/test';
      const key = cacheService.generateKey(endpoint, {});

      expect(key).toBe(`${getApiConfig().baseUrl}${endpoint}`);
    });
  });

  describe('get', () => {
    it('should return cached data if available and not expired', () => {
      const key = '/test';
      const data = { test: 'data' };
      const ttl = 1000;

      cacheService.set(key, data, ttl);
      const result = cacheService.get(key);

      expect(result).toEqual(data);
    });

    it('should return null if cache is expired', () => {
      const key = '/test';
      const data = { test: 'data' };
      const ttl = 1;

      cacheService.set(key, data, ttl);
      jest.advanceTimersByTime(2000);
      const result = cacheService.get(key);

      expect(result).toBeNull();
    });

    it('should return null if key not found', () => {
      const result = cacheService.get('/nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data in cache with TTL', () => {
      const key = '/test';
      const data = { test: 'data' };
      const ttl = 1000;

      cacheService.set(key, data, ttl);
      const result = cacheService.get(key);

      expect(result).toEqual(data);
    });

    it('should overwrite existing cache entry', () => {
      const key = '/test';
      const data1 = { test: 'data1' };
      const data2 = { test: 'data2' };
      const ttl = 1000;

      cacheService.set(key, data1, ttl);
      cacheService.set(key, data2, ttl);
      const result = cacheService.get(key);

      expect(result).toEqual(data2);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      const key1 = '/test1';
      const key2 = '/test2';
      const data = { test: 'data' };
      const ttl = 1000;

      cacheService.set(key1, data, ttl);
      cacheService.set(key2, data, ttl);
      cacheService.clear();

      expect(cacheService.get(key1)).toBeNull();
      expect(cacheService.get(key2)).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove specific cache entry', () => {
      const key1 = '/test1';
      const key2 = '/test2';
      const data = { test: 'data' };
      const ttl = 1000;

      cacheService.set(key1, data, ttl);
      cacheService.set(key2, data, ttl);
      cacheService.remove(key1);

      expect(cacheService.get(key1)).toBeNull();
      expect(cacheService.get(key2)).toEqual(data);
    });
  });
}); 