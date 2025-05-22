import { Request, Response, NextFunction } from 'express';
import { monitoringMiddleware, errorMonitoringMiddleware, getMetrics, getMetricsSummary } from '../monitoring';
import { createLogger } from 'winston';
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
  },
  transports: {
    File: jest.fn(),
  },
}));

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

describe('Monitoring Middleware', () => {
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
      } as IUser,
    };
    mockResponse = {
      statusCode: 200,
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    mockLogger = (createLogger as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('monitoringMiddleware', () => {
    it('should capture request metrics', () => {
      monitoringMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Call the modified json function
      (mockResponse.json as jest.Mock)({ test: 'data' });

      expect(mockLogger.info).toHaveBeenCalledWith('Request metric', expect.objectContaining({
        method: 'GET',
        path: '/api/test',
        statusCode: 200,
        userId: 'user123',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
      }));
    });

    it('should restore original json function after use', () => {
      const originalJson = mockResponse.json;
      monitoringMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Call the modified json function
      (mockResponse.json as jest.Mock)({ test: 'data' });

      // Json function should be restored
      expect(mockResponse.json).toBe(originalJson);
    });

    it('should call next function', () => {
      monitoringMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('errorMonitoringMiddleware', () => {
    it('should capture error metrics', () => {
      const error = new Error('Test error');
      errorMonitoringMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger.error).toHaveBeenCalledWith('Error metric', expect.objectContaining({
        method: 'GET',
        path: '/api/test',
        statusCode: 200,
        userId: 'user123',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
        error: 'Test error',
      }));
    });

    it('should call next function with error', () => {
      const error = new Error('Test error');
      errorMonitoringMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics', () => {
      // Add some metrics
      monitoringMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      (mockResponse.json as jest.Mock)({ test: 'data' });

      const metrics = getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        method: 'GET',
        path: '/api/test',
        statusCode: 200,
        userId: 'user123',
        userAgent: 'test-agent',
        ip: '127.0.0.1',
      });
    });
  });

  describe('getMetricsSummary', () => {
    it('should return metrics summary', () => {
      // Add some metrics
      monitoringMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      (mockResponse.json as jest.Mock)({ test: 'data' });

      const summary = getMetricsSummary();
      expect(summary).toMatchObject({
        totalRequests: 1,
        requestsByMethod: { GET: 1 },
        requestsByPath: { '/api/test': 1 },
        requestsByStatusCode: { 200: 1 },
        errors: 0,
      });
      expect(summary.averageResponseTime).toBeGreaterThan(0);
    });

    it('should handle empty metrics', () => {
      const summary = getMetricsSummary();
      expect(summary).toMatchObject({
        totalRequests: 0,
        averageResponseTime: 0,
        requestsByMethod: {},
        requestsByPath: {},
        requestsByStatusCode: {},
        errors: 0,
      });
    });

    it('should include error count', () => {
      // Add error metric
      const error = new Error('Test error');
      errorMonitoringMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      const summary = getMetricsSummary();
      expect(summary.errors).toBe(1);
    });
  });
}); 