import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../errorHandler';
import { ApiError, BadRequestError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { createLogger } from 'winston';
import { IUser } from '../../types/user';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Mock winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
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

describe('Error Handler Middleware', () => {
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
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    mockLogger = (createLogger as jest.Mock)();
    jest.clearAllMocks();
  });

  it('should handle API errors', () => {
    const error = new BadRequestError('Invalid input', [
      { field: 'name', message: 'Name is required' },
    ]);

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid input',
      errors: [{ field: 'name', message: 'Name is required' }],
    });
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid token',
    });
  });

  it('should handle token expiration errors', () => {
    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Token expired',
    });
  });

  it('should handle validation errors', () => {
    const error = new Error('Validation error');
    error.name = 'ValidationError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Validation error',
      errors: [
        {
          field: 'ValidationError',
          message: 'Validation error',
        },
      ],
    });
  });

  it('should handle database unique constraint errors', () => {
    const error = new Error('Duplicate entry');
    error.name = 'SequelizeUniqueConstraintError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Resource already exists',
    });
  });

  it('should handle database validation errors', () => {
    const error = new Error('Database validation error');
    error.name = 'SequelizeValidationError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Validation error',
      errors: [
        {
          field: 'SequelizeValidationError',
          message: 'Database validation error',
        },
      ],
    });
  });

  it('should handle unknown errors in development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Unknown error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Unknown error',
      stack: error.stack,
    });
  });

  it('should handle unknown errors in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Unknown error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error',
    });
  });

  it('should log errors', () => {
    const error = new Error('Test error');
    error.stack = 'test stack';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

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
}); 