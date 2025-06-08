import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from './logging';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { IUser } from '../types/user';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        active?: boolean;
      };
    }
  }
}

// Middleware to verify JWT token
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(new UnauthorizedError('Invalid token'));
    }
  }
};

// Middleware to check if user has required role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
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