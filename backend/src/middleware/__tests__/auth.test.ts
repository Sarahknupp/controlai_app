import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, checkActive, checkOwnership } from '../auth';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { IUser } from '../../types/user';

// Mock User model
jest.mock('../../models/User');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;
  const mockUser: IUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const token = jwt.sign(mockUser, process.env.JWT_SECRET!);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(mockUser.id);
    });

    it('should reject request without token', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request with expired token', () => {
      const token = jwt.sign(mockUser, process.env.JWT_SECRET!, { expiresIn: '0s' });
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('authorize', () => {
    it('should allow access for authorized role', () => {
      mockRequest.user = mockUser;
      const middleware = authorize('user');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should reject access for unauthorized role', () => {
      mockRequest.user = mockUser;
      const middleware = authorize('admin');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should reject access for unauthenticated user', () => {
      const middleware = authorize('user');

      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('checkActive', () => {
    it('should allow access for active user', () => {
      mockRequest.user = mockUser;
      checkActive(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should reject access for inactive user', () => {
      mockRequest.user = { ...mockUser, active: false };
      checkActive(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should reject access for unauthenticated user', () => {
      checkActive(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('checkOwnership', () => {
    it('should allow access for resource owner', () => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: mockUser.id };
      checkOwnership(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should allow access for admin', () => {
      mockRequest.user = { ...mockUser, role: 'admin' };
      mockRequest.params = { id: 'other-user-id' };
      checkOwnership(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should reject access for non-owner', () => {
      mockRequest.user = mockUser;
      mockRequest.params = { id: 'other-user-id' };
      checkOwnership(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should reject access for unauthenticated user', () => {
      mockRequest.params = { id: 'user-id' };
      checkOwnership(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
}); 