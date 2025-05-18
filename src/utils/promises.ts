/**
 * Utility functions for handling promises in a type-safe way
 */

/**
 * Creates a promise that resolves after the specified number of milliseconds
 * @param ms Number of milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wraps a promise with a timeout
 * @param promise Promise to wrap
 * @param ms Timeout in milliseconds
 * @param errorMessage Optional error message
 * @returns Promise that rejects if the timeout is reached
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  errorMessage = 'Operation timed out'
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeout]);
};

/**
 * Retries a promise-returning function with exponential backoff
 * @param fn Function that returns a promise
 * @param retries Number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns Promise that resolves with the result or rejects after all retries
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await delay(baseDelay * Math.pow(2, i));
      }
    }
  }

  throw lastError;
}; 