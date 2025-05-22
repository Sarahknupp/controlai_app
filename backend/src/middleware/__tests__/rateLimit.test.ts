import { Request, Response, NextFunction } from 'express';
import { createRateLimiter, defaultRateLimiter, authRateLimiter } from '../rateLimit';

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    setHeaderMock = jest.fn();
    mockRequest = {
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '127.0.0.1',
      } as any,
    };
    mockResponse = {
      setHeader: setHeaderMock,
    };
    nextFunction = jest.fn();
  });

  describe('createRateLimiter', () => {
    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({
        windowMs: 1000,
        max: 2,
      });

      // First request
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '2');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');
      nextFunction.mockClear();
      setHeaderMock.mockClear();

      // Second request
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '2');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
    });

    it('should block requests exceeding limit', () => {
      const limiter = createRateLimiter({
        windowMs: 1000,
        max: 2,
      });

      // First two requests
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);

      // Third request (should be blocked)
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      const error = nextFunction.mock.calls[0][0];
      expect(error.status).toBe(429);
      expect(error.message).toBe('Too many requests, please try again later.');
      expect(setHeaderMock).toHaveBeenCalledWith('Retry-After', expect.any(String));
    });

    it('should reset counter after window expires', async () => {
      const limiter = createRateLimiter({
        windowMs: 100,
        max: 2,
      });

      // First two requests
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should allow new requests after window expires
      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');
    });

    it('should handle missing IP address', () => {
      const limiter = createRateLimiter({
        windowMs: 1000,
        max: 2,
      });

      mockRequest = {
        socket: undefined,
      };

      limiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', '2');
      expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');
    });
  });

  describe('defaultRateLimiter', () => {
    it('should allow 100 requests per 15 minutes', () => {
      for (let i = 0; i < 100; i++) {
        defaultRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith();
        nextFunction.mockClear();
      }

      // 101st request should be blocked
      defaultRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      const error = nextFunction.mock.calls[0][0];
      expect(error.status).toBe(429);
    });
  });

  describe('authRateLimiter', () => {
    it('should allow 5 requests per 15 minutes', () => {
      for (let i = 0; i < 5; i++) {
        authRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledWith();
        nextFunction.mockClear();
      }

      // 6th request should be blocked
      authRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      const error = nextFunction.mock.calls[0][0];
      expect(error.status).toBe(429);
      expect(error.message).toBe('Too many login attempts, please try again later.');
    });
  });
}); 