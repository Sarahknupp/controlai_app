import { Request, Response, NextFunction } from 'express';
import { requestLogger, errorLogger } from '../logger';
import { createLogger } from 'winston';

// Mock winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

describe('Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  let mockLogger: any;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
      user: {
        id: 'user123',
      } as any,
    };
    mockResponse = {
      statusCode: 200,
      send: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    mockLogger = (createLogger as jest.Mock)();
  });

  describe('requestLogger', () => {
    it('should log incoming request', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        userId: 'user123',
      });
    });

    it('should log outgoing response', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Call the modified send function
      (mockResponse.send as jest.Mock)('test response');

      expect(mockLogger.info).toHaveBeenCalledWith('Outgoing response', {
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        responseTime: expect.stringMatching(/\d+ms/),
        userId: 'user123',
      });
    });

    it('should handle request without user', () => {
      mockRequest.user = undefined;

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        userId: undefined,
      });
    });

    it('should restore original send function after use', () => {
      const originalSend = mockResponse.send;
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      // Call the modified send function
      (mockResponse.send as jest.Mock)('test response');

      // Send function should be restored
      expect(mockResponse.send).toBe(originalSend);
    });
  });

  describe('errorLogger', () => {
    it('should log error details', () => {
      const error = new Error('Test error');
      error.stack = 'test stack';

      errorLogger(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: {
          name: 'Error',
          message: 'Test error',
          stack: 'test stack',
        },
        request: {
          method: 'GET',
          url: '/api/test',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          userId: 'user123',
        },
      });
    });

    it('should handle error without stack trace', () => {
      const error = new Error('Test error');
      delete error.stack;

      errorLogger(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: {
          name: 'Error',
          message: 'Test error',
          stack: undefined,
        },
        request: {
          method: 'GET',
          url: '/api/test',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          userId: 'user123',
        },
      });
    });

    it('should handle request without user', () => {
      const error = new Error('Test error');
      mockRequest.user = undefined;

      errorLogger(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: {
          name: 'Error',
          message: 'Test error',
          stack: undefined,
        },
        request: {
          method: 'GET',
          url: '/api/test',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          userId: undefined,
        },
      });
    });
  });
}); 