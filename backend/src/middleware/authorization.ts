import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
import { UserRole } from '../types/user';

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      logger.warn('Authorization failed: No user found in request');
      throw new ForbiddenError('Access denied');
    }

    if (!roles.includes(user.role)) {
      logger.warn('Authorization failed: User does not have required role', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: roles,
      });
      throw new ForbiddenError('Access denied: Insufficient permissions');
    }

    next();
  };
}; 