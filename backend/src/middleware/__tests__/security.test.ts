import { Express, Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { applySecurityMiddleware } from '../security';
import request from 'supertest';
import express from 'express';
import { loginLimiter } from '../auth.middleware';

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
  let app: Application;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = new (require('express').Express)();
    mockUse = mockApp.use as jest.Mock;
    mockDisable = mockApp.disable as jest.Mock;
    mockSetHeader = (require('express').Response)().setHeader as jest.Mock;
    app = express();
    applySecurityMiddleware(app as unknown as Express);
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

  it('should set security headers', async () => {
    const response = await request(app).get('/');
    
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(response.headers['permissions-policy']).toBeDefined();
    expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, proxy-revalidate');
    expect(response.headers['pragma']).toBe('no-cache');
    expect(response.headers['expires']).toBe('0');
  });

  it('should apply rate limiting', async () => {
    const testApp = express();
    testApp.use(loginLimiter);
    testApp.get('/login', (req, res) => res.send('OK'));

    // Fazer 6 requisições (limite é 5)
    for (let i = 0; i < 6; i++) {
      await request(testApp).get('/login');
    }

    const response = await request(testApp).get('/login');
    expect(response.status).toBe(429);
    expect(response.body.message).toBe('Too many login attempts, please try again later');
  });

  it('should handle CORS correctly', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
  });

  it('should prevent clickjacking', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });

  it('should prevent MIME type sniffing', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should set strict CSP headers', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-security-policy']).toBeDefined();
    const csp = response.headers['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it('should handle invalid origins', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://malicious-site.com');

    expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
  });

  it('should set API version header', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-api-version']).toBeDefined();
  });
}); 