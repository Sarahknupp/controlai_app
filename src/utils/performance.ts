type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T> | undefined>;
};

type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T> | undefined>;
};

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastPromise: Promise<ReturnType<T>> | null = null;
  let resolvePromise: ((value: ReturnType<T>) => void) | null = null;

  const debouncedFn = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!lastPromise) {
      lastPromise = new Promise<ReturnType<T>>(resolve => {
        resolvePromise = resolve;
      });
    }

    timeoutId = setTimeout(async () => {
      if (lastArgs && resolvePromise) {
        try {
          const result = await func(...lastArgs);
          resolvePromise(result);
        } catch (error) {
          // Create a new promise for the next call
          lastPromise = new Promise<ReturnType<T>>(resolve => {
            resolvePromise = resolve;
          });
          throw error;
        }
      }
      timeoutId = null;
      lastArgs = null;
      lastPromise = null;
      resolvePromise = null;
    }, wait);

    return lastPromise;
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
      lastPromise = null;
      resolvePromise = null;
    }
  };

  debouncedFn.flush = async () => {
    if (timeoutId && lastArgs && resolvePromise) {
      clearTimeout(timeoutId);
      timeoutId = null;
      const args = lastArgs;
      const resolve = resolvePromise;
      lastArgs = null;
      lastPromise = null;
      resolvePromise = null;
      try {
        const result = await func(...args);
        resolve(result);
        return result;
      } catch (error) {
        throw error;
      }
    }
    return undefined;
  };

  return debouncedFn;
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ThrottledFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;
  let lastPromise: Promise<ReturnType<T>> | null = null;
  let resolvePromise: ((value: ReturnType<T>) => void) | null = null;

  const throttledFn = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);

    lastArgs = args;

    if (!lastPromise) {
      lastPromise = new Promise<ReturnType<T>>(resolve => {
        resolvePromise = resolve;
      });
    }

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      if (lastArgs && resolvePromise) {
        func(...lastArgs).then(resolvePromise);
        lastArgs = null;
      }
    } else if (!timeoutId) {
      timeoutId = setTimeout(async () => {
        lastCallTime = Date.now();
        timeoutId = null;
        if (lastArgs && resolvePromise) {
          try {
            const result = await func(...lastArgs);
            resolvePromise(result);
          } catch (error) {
            // Create a new promise for the next call
            lastPromise = new Promise<ReturnType<T>>(resolve => {
              resolvePromise = resolve;
            });
            throw error;
          }
          lastArgs = null;
          lastPromise = null;
          resolvePromise = null;
        }
      }, remaining);
    }

    return lastPromise;
  };

  throttledFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
      lastPromise = null;
      resolvePromise = null;
    }
  };

  throttledFn.flush = async () => {
    if (timeoutId && lastArgs && resolvePromise) {
      clearTimeout(timeoutId);
      timeoutId = null;
      const args = lastArgs;
      const resolve = resolvePromise;
      lastArgs = null;
      lastPromise = null;
      resolvePromise = null;
      try {
        const result = await func(...args);
        resolve(result);
        return result;
      } catch (error) {
        throw error;
      }
    }
    return undefined;
  };

  return throttledFn;
}

export function memoize<T extends (...args: any[]) => any>(
  func: T,
  options: {
    maxSize?: number;
    ttl?: number;
  } = {}
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  const { maxSize = 100, ttl } = options;

  return ((...args: Parameters<T>) => {
    let key: string;
    try {
      const stringified = JSON.stringify(args);
      key = stringified === undefined ? 'undefined' : stringified;
    } catch {
      key = 'undefined';
    }
    const now = Date.now();

    // Check cache
    const cached = cache.get(key);
    if (cached) {
      if (!ttl || now - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    // Calculate result
    const result = func(...args);

    // Update cache
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, { value: result, timestamp: now });
    return result;
  }) as T;
}

export function batch<T>(
  items: T[],
  batchSize: number,
  callback: (batch: T[]) => Promise<void>
): Promise<void> {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  return batches.reduce(
    (promise, batch) => promise.then(() => callback(batch)),
    Promise.resolve()
  );
}

export function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options;
  let attempts = 0;

  const attempt = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempts - 1)));
      return attempt();
    }
  };

  return attempt();
} 