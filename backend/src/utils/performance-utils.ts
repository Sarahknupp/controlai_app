/**
 * Modern performance optimization utilities
 */

export class PerformanceOptimizedUtils {
  // Modern LRU Cache with better memory management
  private static createLRUCache<K, V>(maxSize: number) {
    return new Map<K, V>();
  }

  // Memoization with TTL and memory limits
  static memoize<Args extends any[], Return>(
    fn: (...args: Args) => Return,
    options: {
      maxSize?: number;
      ttl?: number; // Time to live in ms
      keyGenerator?: (...args: Args) => string;
    } = {}
  ): (...args: Args) => Return {
    const { 
      maxSize = 1000, 
      ttl = 5 * 60 * 1000, // 5 minutes
      keyGenerator = (...args) => JSON.stringify(args)
    } = options;

    const cache = new Map<string, { value: Return; timestamp: number }>();

    return (...args: Args): Return => {
      const key = keyGenerator(...args);
      const cached = cache.get(key);
      
      // Check TTL
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }

      // Compute new value
      const value = fn(...args);
      
      // Clean expired entries and manage size
      const now = Date.now();
      for (const [k, v] of cache.entries()) {
        if (now - v.timestamp >= ttl) {
          cache.delete(k);
        }
      }

      // Ensure max size
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }

      cache.set(key, { value, timestamp: now });
      return value;
    };
  }

  // Modern debounce with AbortController
  static debounce<Args extends any[]>(
    fn: (...args: Args) => Promise<any> | any,
    delay: number
  ): (...args: Args) => Promise<any> {
    let timeoutId: NodeJS.Timeout;
    let controller: AbortController;

    return async (...args: Args) => {
      // Cancel previous execution
      if (controller) {
        controller.abort();
      }
      clearTimeout(timeoutId);

      controller = new AbortController();

      return new Promise((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            if (controller.signal.aborted) {
              reject(new Error('Debounced function was aborted'));
              return;
            }
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delay);

        // Handle abortion
        controller.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Debounced function was aborted'));
        });
      });
    };
  }

  // Modern throttle with frame-based execution
  static throttle<Args extends any[]>(
    fn: (...args: Args) => any,
    limit: number,
    options: { leading?: boolean; trailing?: boolean } = {}
  ): (...args: Args) => void {
    const { leading = true, trailing = true } = options;
    let inThrottle: boolean;
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;

    return (...args: Args) => {
      if (!inThrottle) {
        if (leading) fn(...args);
        lastRan = Date.now();
        inThrottle = true;
      } else {
        if (trailing) {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(() => {
            if (Date.now() - lastRan >= limit) {
              fn(...args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      }
    };
  }

  // Modern batch processing with requestIdleCallback
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => R | Promise<R>,
    batchSize = 50
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await new Promise<void>(resolve => {
        const processBatch = async () => {
          const batchResults = await Promise.all(
            batch.map(item => processor(item))
          );
          results.push(...batchResults);
          resolve();
        };

        // Use requestIdleCallback for better performance
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => processBatch());
        } else {
          setTimeout(() => processBatch(), 0);
        }
      });
    }

    return results;
  }

  // Memory-efficient object freezing
  static deepFreeze<T>(obj: T): Readonly<T> {
    const frozenObjects = new WeakSet();
    
    const freeze = (target: any): any => {
      if (frozenObjects.has(target) || typeof target !== 'object' || target === null) {
        return target;
      }

      frozenObjects.add(target);
      Object.freeze(target);

      Object.values(target).forEach(value => {
        if (typeof value === 'object' && value !== null) {
          freeze(value);
        }
      });

      return target;
    };

    return freeze(obj);
  }
}

// Modern format utilities with caching
export const modernFormatUtils = {
  // Cached formatters for better performance
  currencyFormatter: new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }),

  numberFormatter: new Intl.NumberFormat('pt-BR'),

  percentFormatter: new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2
  }),

  // Modern file size formatter with binary/decimal modes
  formatFileSize: PerformanceOptimizedUtils.memoize((
    bytes: number,
    mode: 'binary' | 'decimal' = 'binary'
  ): string => {
    if (bytes === 0) return '0 B';

    const base = mode === 'binary' ? 1024 : 1000;
    const units = mode === 'binary' 
      ? ['B', 'KiB', 'MiB', 'GiB', 'TiB'] 
      : ['B', 'KB', 'MB', 'GB', 'TB'];

    const exponent = Math.floor(Math.log(bytes) / Math.log(base));
    const value = bytes / Math.pow(base, exponent);

    return `${value.toFixed(2)} ${units[exponent]}`;
  }),

  // Optimized currency formatting
  formatCurrency: (value: number): string => {
    return modernFormatUtils.currencyFormatter.format(value);
  },

  // Optimized number formatting
  formatNumber: (value: number): string => {
    return modernFormatUtils.numberFormatter.format(value);
  },

  // Optimized percentage formatting
  formatPercentage: (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  }
};