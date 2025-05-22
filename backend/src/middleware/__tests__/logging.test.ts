import { Request, Response, NextFunction } from 'express';
import { createLogger } from 'winston';
import { requestLogger, errorLogger, performanceLogger } from '../logging';
import { IUser } from '../../types/user';

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
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

describe('Logging Middleware', () => {
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
      query: {},
      body: {},
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IUser,
    };
    mockResponse = {
      statusCode: 200,
      send: jest.fn(),
      on: jest.fn(),
    };
    nextFunction = jest.fn();
    mockLogger = (createLogger as jest.Mock)();
    jest.clearAllMocks();
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
        body: undefined,
        query: undefined,
      });
    });

    it('should log outgoing response', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);
      (mockResponse.send as jest.Mock)('response body');

      expect(mockLogger.info).toHaveBeenCalledWith('Outgoing response', {
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        responseTime: expect.any(String),
        userId: 'user123',
      });
    });

    it('should log request body for non-GET requests', () => {
      mockRequest.method = 'POST';
      mockRequest.body = { test: 'data' };

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'POST',
        url: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        userId: 'user123',
        body: { test: 'data' },
        query: undefined,
      });
    });

    it('should log query parameters when present', () => {
      mockRequest.query = { filter: 'test' };

      requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', {
        method: 'GET',
        url: '/api/test',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        userId: 'user123',
        body: undefined,
        query: { filter: 'test' },
      });
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
          body: undefined,
          query: undefined,
        },
      });
    });

    it('should call next with error', () => {
      const error = new Error('Test error');

      errorLogger(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('performanceLogger', () => {
    it('should log request performance', () => {
      performanceLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));

      // Simulate response finish
      const finishCallback = (mockResponse.on as jest.Mock).mock.calls[0][1];
      finishCallback();

      expect(mockLogger.info).toHaveBeenCalledWith('Request performance', {
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        duration: expect.any(String),
        userId: 'user123',
      });
    });

    it('should call next function', () => {
      performanceLogger(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
}); 