import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from './logging';
import { IUser } from '../types/user';

// Auth options interface
interface AuthOptions {
  secret: string;
  expiresIn?: string;
  algorithm?: string;
  issuer?: string;
  audience?: string;
}

// Default auth options
const defaultOptions: AuthOptions = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '1h',
  algorithm: 'HS256',
  issuer: 'api',
  audience: 'users'
};

// Auth middleware factory
export const createAuthMiddleware = (options: AuthOptions = {}) => {
  const authOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'No token provided'
        });
      }

      // Extract token from header
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token format'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, authOptions.secret, {
        algorithms: [authOptions.algorithm as jwt.Algorithm],
        issuer: authOptions.issuer,
        audience: authOptions.audience
      });

      // Add user to request
      req.user = decoded;

      next();
    } catch (error) {
      logger.error('Auth error', { error: (error as Error).message });

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Token expired'
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token'
        });
      }

      next(error);
    }
  };
};

// Role middleware factory
export const createRoleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user as IUser;

      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!roles.includes(user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Auth helper functions
export const authHelpers = {
  // Generate token
  generateToken: (payload: any, options: AuthOptions = {}): string => {
    const authOptions = { ...defaultOptions, ...options };
    return jwt.sign(payload, authOptions.secret, {
      expiresIn: authOptions.expiresIn,
      algorithm: authOptions.algorithm as jwt.Algorithm,
      issuer: authOptions.issuer,
      audience: authOptions.audience
    });
  },

  // Verify token
  verifyToken: (token: string, options: AuthOptions = {}): any => {
    const authOptions = { ...defaultOptions, ...options };
    return jwt.verify(token, authOptions.secret, {
      algorithms: [authOptions.algorithm as jwt.Algorithm],
      issuer: authOptions.issuer,
      audience: authOptions.audience
    });
  },

  // Decode token
  decodeToken: (token: string): any => {
    return jwt.decode(token);
  },

  // Get token expiration
  getTokenExpiration: (token: string): Date | null => {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  }
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('No authorization header');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Optional authentication middleware
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

// Middleware to check if user is active
export const checkActive = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Not authenticated'));
  }

  if (!req.user.active) {
    return next(new ForbiddenError('Account is inactive'));
  }

  next();
};

// Middleware to check if user is accessing their own resource
export const checkOwnership = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Not authenticated'));
  }

  const resourceId = req.params.id || req.body.userId;
  if (req.user.id !== resourceId && req.user.role !== 'admin') {
    return next(new ForbiddenError('Access denied'));
  }

  next();
}; 