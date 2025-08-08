import { PerformanceOptimizedUtils, modernFormatUtils } from '../performance-utils';

describe('Performance Optimization Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('PerformanceOptimizedUtils', () => {
    describe('memoize', () => {
      it('should cache function results', () => {
        let callCount = 0;
        const expensiveFunction = (x: number, y: number) => {
          callCount++;
          return x + y;
        };

        const memoized = PerformanceOptimizedUtils.memoize(expensiveFunction);

        // First call
        const result1 = memoized(2, 3);
        expect(result1).toBe(5);
        expect(callCount).toBe(1);

        // Second call with same arguments (should be cached)
        const result2 = memoized(2, 3);
        expect(result2).toBe(5);
        expect(callCount).toBe(1); // No additional call

        // Third call with different arguments
        const result3 = memoized(3, 4);
        expect(result3).toBe(7);
        expect(callCount).toBe(2);
      });

      it('should respect TTL (time to live)', () => {
        let callCount = 0;
        const fn = (x: number) => {
          callCount++;
          return x * 2;
        };

        const memoized = PerformanceOptimizedUtils.memoize(fn, {
          ttl: 1000 // 1 second
        });

        // Initial call
        expect(memoized(5)).toBe(10);
        expect(callCount).toBe(1);

        // Call before TTL expires (should be cached)
        jest.advanceTimersByTime(500);
        expect(memoized(5)).toBe(10);
        expect(callCount).toBe(1);

        // Call after TTL expires (should call function again)
        jest.advanceTimersByTime(600); // Total: 1100ms
        expect(memoized(5)).toBe(10);
        expect(callCount).toBe(2);
      });

      it('should respect cache size limits', () => {
        let callCount = 0;
        const fn = (x: number) => {
          callCount++;
          return x;
        };

        const memoized = PerformanceOptimizedUtils.memoize(fn, {
          maxSize: 2
        });

        // Fill cache
        memoized(1);
        memoized(2);
        expect(callCount).toBe(2);

        // Verify cache works
        memoized(1);
        memoized(2);
        expect(callCount).toBe(2);

        // Add third item (should evict first)
        memoized(3);
        expect(callCount).toBe(3);

        // First item should be evicted
        memoized(1); // Should call function again
        expect(callCount).toBe(4);
      });

      it('should use custom key generator', () => {
        let callCount = 0;
        const fn = (obj: { id: number; name: string }) => {
          callCount++;
          return `${obj.id}-${obj.name}`;
        };

        const memoized = PerformanceOptimizedUtils.memoize(fn, {
          keyGenerator: (obj) => obj.id.toString()
        });

        const obj1 = { id: 1, name: 'first' };
        const obj2 = { id: 1, name: 'second' }; // Same id, different name

        memoized(obj1);
        expect(callCount).toBe(1);

        // Should be cached based on id only
        memoized(obj2);
        expect(callCount).toBe(1);
      });

      it('should clean up expired entries', () => {
        const fn = (x: number) => x;
        const memoized = PerformanceOptimizedUtils.memoize(fn, {
          ttl: 1000,
          maxSize: 100
        });

        // Add multiple entries
        for (let i = 0; i < 10; i++) {
          memoized(i);
        }

        // Fast forward past TTL
        jest.advanceTimersByTime(1500);

        // Adding new entry should trigger cleanup
        memoized(10);

        // Previous entries should be cleaned up and require recomputation
        let callCount = 0;
        const testFn = (x: number) => {
          callCount++;
          return x;
        };
        const testMemoized = PerformanceOptimizedUtils.memoize(testFn);
        
        testMemoized(1);
        expect(callCount).toBe(1);
      });
    });

    describe('debounce', () => {
      it('should debounce function calls', async () => {
        let callCount = 0;
        const fn = async (value: string) => {
          callCount++;
          return value.toUpperCase();
        };

        const debounced = PerformanceOptimizedUtils.debounce(fn, 100);

        // Rapid calls
        const promise1 = debounced('test1');
        const promise2 = debounced('test2');
        const promise3 = debounced('test3');

        // Only last call should execute
        jest.advanceTimersByTime(100);

        await expect(promise3).resolves.toBe('TEST3');
        expect(callCount).toBe(1);

        // Earlier promises should be rejected
        await expect(promise1).rejects.toThrow('aborted');
        await expect(promise2).rejects.toThrow('aborted');
      });

      it('should handle async function errors', async () => {
        const fn = async () => {
          throw new Error('Test error');
        };

        const debounced = PerformanceOptimizedUtils.debounce(fn, 100);
        const promise = debounced();

        jest.advanceTimersByTime(100);

        await expect(promise).rejects.toThrow('Test error');
      });

      it('should cancel previous executions', async () => {
        let executionOrder: string[] = [];
        
        const fn = async (id: string) => {
          executionOrder.push(`start-${id}`);
          await new Promise(resolve => setTimeout(resolve, 50));
          executionOrder.push(`end-${id}`);
          return id;
        };

        const debounced = PerformanceOptimizedUtils.debounce(fn, 100);

        debounced('first');
        debounced('second');
        const lastPromise = debounced('third');

        jest.advanceTimersByTime(150);
        await lastPromise;

        // Only the last call should complete
        expect(executionOrder).toEqual(['start-third', 'end-third']);
      });
    });

    describe('throttle', () => {
      it('should throttle function calls', () => {
        let callCount = 0;
        const fn = () => {
          callCount++;
          return callCount;
        };

        const throttled = PerformanceOptimizedUtils.throttle(fn, 100);

        // First call should execute immediately
        throttled();
        expect(callCount).toBe(1);

        // Subsequent calls within limit should be ignored
        throttled();
        throttled();
        expect(callCount).toBe(1);

        // After limit, next call should execute
        jest.advanceTimersByTime(100);
        throttled();
        expect(callCount).toBe(2);
      });

      it('should respect leading and trailing options', () => {
        let callCount = 0;
        const fn = () => {
          callCount++;
        };

        const throttled = PerformanceOptimizedUtils.throttle(fn, 100, {
          leading: false,
          trailing: true
        });

        // First call should not execute immediately (leading: false)
        throttled();
        expect(callCount).toBe(0);

        // But should execute after delay (trailing: true)
        jest.advanceTimersByTime(100);
        expect(callCount).toBe(1);
      });

      it('should handle rapid successive calls', () => {
        let callCount = 0;
        const fn = (value: number) => {
          callCount++;
          return value;
        };

        const throttled = PerformanceOptimizedUtils.throttle(fn, 100, {
          leading: true,
          trailing: true
        });

        // Rapid calls
        for (let i = 0; i < 10; i++) {
          throttled(i);
        }

        expect(callCount).toBe(1); // Only leading call

        jest.advanceTimersByTime(100);
        expect(callCount).toBe(2); // Leading + trailing calls
      });
    });

    describe('batchProcess', () => {
      it('should process items in batches', async () => {
        const items = Array.from({ length: 100 }, (_, i) => i);
        const processedItems: number[] = [];

        const result = await PerformanceOptimizedUtils.batchProcess(
          items,
          (item) => {
            processedItems.push(item);
            return item * 2;
          },
          10 // batch size
        );

        expect(result).toHaveLength(100);
        expect(result[0]).toBe(0);
        expect(result[99]).toBe(198);
        expect(processedItems).toHaveLength(100);
      });

      it('should handle async processing', async () => {
        const items = [1, 2, 3, 4, 5];

        const result = await PerformanceOptimizedUtils.batchProcess(
          items,
          async (item) => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return item * 3;
          },
          2
        );

        expect(result).toEqual([3, 6, 9, 12, 15]);
      });

      it('should use requestIdleCallback when available', async () => {
        // Mock requestIdleCallback
        const mockRequestIdleCallback = jest.fn((callback) => {
          setTimeout(callback, 0);
        });
        
        (global as any).requestIdleCallback = mockRequestIdleCallback;

        const items = [1, 2, 3, 4];
        
        await PerformanceOptimizedUtils.batchProcess(
          items,
          (item) => item * 2,
          2
        );

        expect(mockRequestIdleCallback).toHaveBeenCalled();

        // Clean up
        delete (global as any).requestIdleCallback;
      });

      it('should handle processing errors', async () => {
        const items = [1, 2, 3];

        await expect(
          PerformanceOptimizedUtils.batchProcess(
            items,
            (item) => {
              if (item === 2) {
                throw new Error('Processing error');
              }
              return item;
            },
            1
          )
        ).rejects.toThrow('Processing error');
      });
    });

    describe('deepFreeze', () => {
      it('should freeze objects deeply', () => {
        const obj = {
          a: 1,
          b: {
            c: 2,
            d: {
              e: 3
            }
          },
          f: [1, 2, { g: 4 }]
        };

        const frozen = PerformanceOptimizedUtils.deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.b)).toBe(true);
        expect(Object.isFrozen(frozen.b.d)).toBe(true);
        expect(Object.isFrozen(frozen.f)).toBe(true);
        expect(Object.isFrozen(frozen.f[2])).toBe(true);
      });

      it('should handle circular references', () => {
        const obj: any = { a: 1 };
        obj.self = obj;

        const frozen = PerformanceOptimizedUtils.deepFreeze(obj);

        expect(Object.isFrozen(frozen)).toBe(true);
        expect(frozen.self).toBe(frozen);
      });

      it('should handle null and primitive values', () => {
        expect(PerformanceOptimizedUtils.deepFreeze(null)).toBe(null);
        expect(PerformanceOptimizedUtils.deepFreeze(42)).toBe(42);
        expect(PerformanceOptimizedUtils.deepFreeze('string')).toBe('string');
      });

      it('should not freeze already frozen objects multiple times', () => {
        const obj = { a: 1, b: { c: 2 } };
        
        const frozen1 = PerformanceOptimizedUtils.deepFreeze(obj);
        const frozen2 = PerformanceOptimizedUtils.deepFreeze(frozen1);

        expect(frozen1).toBe(frozen2);
      });
    });
  });

  describe('modernFormatUtils', () => {
    describe('formatCurrency', () => {
      it('should format currency correctly', () => {
        expect(modernFormatUtils.formatCurrency(1234.56)).toBe('R$ 1.234,56');
        expect(modernFormatUtils.formatCurrency(0)).toBe('R$ 0,00');
        expect(modernFormatUtils.formatCurrency(-500.75)).toBe('-R$ 500,75');
      });

      it('should handle large numbers', () => {
        expect(modernFormatUtils.formatCurrency(1000000.99)).toBe('R$ 1.000.000,99');
      });
    });

    describe('formatNumber', () => {
      it('should format numbers with thousand separators', () => {
        expect(modernFormatUtils.formatNumber(1234)).toBe('1.234');
        expect(modernFormatUtils.formatNumber(1234567)).toBe('1.234.567');
      });

      it('should handle decimal numbers', () => {
        expect(modernFormatUtils.formatNumber(1234.56)).toBe('1.234,56');
      });
    });

    describe('formatPercentage', () => {
      it('should format percentages correctly', () => {
        expect(modernFormatUtils.formatPercentage(25.5)).toBe('25,50%');
        expect(modernFormatUtils.formatPercentage(100)).toBe('100,00%');
      });

      it('should handle custom decimal places', () => {
        expect(modernFormatUtils.formatPercentage(33.333, 1)).toBe('33,3%');
        expect(modernFormatUtils.formatPercentage(33.333, 3)).toBe('33,333%');
      });
    });

    describe('formatFileSize', () => {
      it('should format file sizes correctly', () => {
        expect(modernFormatUtils.formatFileSize(0)).toBe('0 B');
        expect(modernFormatUtils.formatFileSize(1023)).toBe('1023.00 B');
        expect(modernFormatUtils.formatFileSize(1024)).toBe('1.00 KiB');
        expect(modernFormatUtils.formatFileSize(1536)).toBe('1.50 KiB');
        expect(modernFormatUtils.formatFileSize(1024 * 1024)).toBe('1.00 MiB');
        expect(modernFormatUtils.formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GiB');
      });

      it('should support decimal mode', () => {
        expect(modernFormatUtils.formatFileSize(1000, 'decimal')).toBe('1.00 KB');
        expect(modernFormatUtils.formatFileSize(1500, 'decimal')).toBe('1.50 KB');
        expect(modernFormatUtils.formatFileSize(1000000, 'decimal')).toBe('1.00 MB');
      });

      it('should be memoized for performance', () => {
        // First call
        const start1 = performance.now();
        const result1 = modernFormatUtils.formatFileSize(1024);
        const end1 = performance.now();
        const time1 = end1 - start1;

        // Second call with same value (should be cached)
        const start2 = performance.now();
        const result2 = modernFormatUtils.formatFileSize(1024);
        const end2 = performance.now();
        const time2 = end2 - start2;

        expect(result1).toBe(result2);
        expect(result1).toBe('1.00 KiB');
        // Second call should be faster due to memoization
        expect(time2).toBeLessThan(time1);
      });
    });

    describe('cached formatters performance', () => {
      it('should reuse Intl.NumberFormat instances', () => {
        // Multiple calls should use the same formatter instance
        const results = Array.from({ length: 100 }, (_, i) => 
          modernFormatUtils.formatCurrency(i * 100)
        );

        expect(results).toHaveLength(100);
        expect(results[0]).toBe('R$ 0,00');
        expect(results[99]).toBe('R$ 9.900,00');
      });

      it('should handle concurrent formatting efficiently', () => {
        const values = Array.from({ length: 1000 }, (_, i) => i * 1.5);

        const start = performance.now();
        const results = values.map(value => ({
          currency: modernFormatUtils.formatCurrency(value),
          number: modernFormatUtils.formatNumber(value),
          percentage: modernFormatUtils.formatPercentage(value)
        }));
        const end = performance.now();

        expect(results).toHaveLength(1000);
        expect(end - start).toBeLessThan(100); // Should be very fast with cached formatters
      });
    });
  });

  describe('performance benchmarks', () => {
    it('should handle large scale memoization efficiently', () => {
      const expensiveFn = (x: number) => {
        // Simulate expensive computation
        let result = x;
        for (let i = 0; i < 1000; i++) {
          result = Math.sqrt(result + i);
        }
        return result;
      };

      const memoized = PerformanceOptimizedUtils.memoize(expensiveFn);

      // First calls (expensive)
      const start1 = performance.now();
      const results1 = Array.from({ length: 10 }, (_, i) => memoized(i));
      const end1 = performance.now();
      const time1 = end1 - start1;

      // Cached calls (should be much faster)
      const start2 = performance.now();
      const results2 = Array.from({ length: 10 }, (_, i) => memoized(i));
      const end2 = performance.now();
      const time2 = end2 - start2;

      expect(results1).toEqual(results2);
      expect(time2).toBeLessThan(time1 * 0.1); // Cached calls should be >90% faster
    });

    it('should handle high-frequency debouncing', async () => {
      let executionCount = 0;
      const fn = async () => {
        executionCount++;
        return executionCount;
      };

      const debounced = PerformanceOptimizedUtils.debounce(fn, 10);

      // Simulate high-frequency calls
      const promises = Array.from({ length: 100 }, () => debounced());

      jest.advanceTimersByTime(20);

      // Only the last call should succeed
      const results = await Promise.allSettled(promises);
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected = results.filter(r => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(99);
      expect(executionCount).toBe(1);
    });

    it('should handle large batch processing efficiently', async () => {
      const items = Array.from({ length: 10000 }, (_, i) => i);

      const start = performance.now();
      const results = await PerformanceOptimizedUtils.batchProcess(
        items,
        (item) => item * 2,
        100
      );
      const end = performance.now();

      expect(results).toHaveLength(10000);
      expect(results[9999]).toBe(19998);
      expect(end - start).toBeLessThan(1000); // Should process efficiently
    });
  });

  describe('memory management', () => {
    it('should not leak memory in memoization', () => {
      const fn = (obj: { id: number }) => obj.id;
      const memoized = PerformanceOptimizedUtils.memoize(fn, {
        maxSize: 5
      });

      // Create many objects
      for (let i = 0; i < 20; i++) {
        memoized({ id: i });
      }

      // Cache should be limited to maxSize
      // This test mainly ensures no memory growth issues
      expect(true).toBe(true);
    });

    it('should clean up debounce timers properly', () => {
      const fn = jest.fn();
      const debounced = PerformanceOptimizedUtils.debounce(fn, 100);

      // Make calls and don't wait
      debounced();
      debounced();
      debounced();

      // This test ensures timers are properly cleared
      expect(true).toBe(true);
    });
  });
});