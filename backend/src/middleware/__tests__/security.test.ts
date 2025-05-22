import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { applySecurityMiddleware } from '../security';

// Mock Express app
jest.mock('express', () => {
  const mockUse = jest.fn();
  const mockDisable = jest.fn();
  const mockSetHeader = jest.fn();
  const mockNext = jest.fn();

  return {
    Express: jest.fn(() => ({
      use: mockUse,
      disable: mockDisable,
    })),
    Request: jest.fn(),
    Response: jest.fn(() => ({
      setHeader: mockSetHeader,
    })),
    NextFunction: jest.fn(() => mockNext),
  };
});

// Mock helmet and cors
jest.mock('helmet', () => jest.fn());
jest.mock('cors', () => jest.fn());

describe('Security Middleware', () => {
  let mockApp: Express;
  let mockUse: jest.Mock;
  let mockDisable: jest.Mock;
  let mockSetHeader: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = new (require('express').Express)();
    mockUse = mockApp.use as jest.Mock;
    mockDisable = mockApp.disable as jest.Mock;
    mockSetHeader = (require('express').Response)().setHeader as jest.Mock;
  });

  it('should apply helmet security headers', () => {
    applySecurityMiddleware(mockApp);
    expect(helmet).toHaveBeenCalled();
  });

  it('should apply CORS middleware', () => {
    applySecurityMiddleware(mockApp);
    expect(cors).toHaveBeenCalled();
  });

  it('should disable X-Powered-By header', () => {
    applySecurityMiddleware(mockApp);
    expect(mockDisable).toHaveBeenCalledWith('x-powered-by');
  });

  it('should set additional security headers', () => {
    applySecurityMiddleware(mockApp);

    // Get the middleware function that sets headers
    const headerMiddleware = mockUse.mock.calls.find(
      call => typeof call[0] === 'function'
    )[0];

    // Create mock request and response
    const mockReq = {};
    const mockRes = {
      setHeader: jest.fn(),
    };
    const mockNext = jest.fn();

    // Call the middleware
    headerMiddleware(mockReq, mockRes, mockNext);

    // Check if all security headers are set
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    );
  });

  it('should call next function after setting headers', () => {
    applySecurityMiddleware(mockApp);

    // Get the middleware function that sets headers
    const headerMiddleware = mockUse.mock.calls.find(
      call => typeof call[0] === 'function'
    )[0];

    // Create mock request and response
    const mockReq = {};
    const mockRes = {
      setHeader: jest.fn(),
    };
    const mockNext = jest.fn();

    // Call the middleware
    headerMiddleware(mockReq, mockRes, mockNext);

    // Check if next was called
    expect(mockNext).toHaveBeenCalled();
  });
}); 