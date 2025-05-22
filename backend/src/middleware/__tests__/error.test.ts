import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../error';
import { AppError, createError } from '../../utils/error';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should handle AppError instances', () => {
    const error = createError(400, 'Bad Request', [{ field: 'name', message: 'Name is required' }]);

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad Request',
      errors: [{ field: 'name', message: 'Name is required' }],
    });
  });

  it('should handle validation errors', () => {
    const error = new Error('Validation Error');
    error.name = 'ValidationError';
    (error as any).errors = {
      name: { path: 'name', message: 'Name is required' },
      email: { path: 'email', message: 'Email is invalid' },
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation Error',
      errors: [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is invalid' },
      ],
    });
  });

  it('should handle duplicate key errors', () => {
    const error = new Error('Duplicate Key Error');
    error.name = 'MongoError';
    (error as any).code = 11000;
    (error as any).keyPattern = { email: 1 };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Duplicate Entry',
      errors: [{ field: 'email', message: 'A record with this email already exists' }],
    });
  });

  it('should handle JWT errors', () => {
    const error = new Error('Invalid Token');
    error.name = 'JsonWebTokenError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid Token',
    });
  });

  it('should handle token expired errors', () => {
    const error = new Error('Token Expired');
    error.name = 'TokenExpiredError';

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token Expired',
    });
  });

  it('should handle unknown errors', () => {
    const error = new Error('Unknown Error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
    });
  });

  it('should include stack trace in development environment', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Test Error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      stack: expect.any(String),
    }));

    // Reset environment
    process.env.NODE_ENV = 'test';
  });
}); 