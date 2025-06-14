import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';

// Role interface
interface Role {
  name: string;
  permissions: string[];
}

// Authorization options interface
interface AuthorizationOptions {
  roles?: Role[];
  permissions?: string[];
  checkAll?: boolean;
}

// Default authorization options
const defaultOptions: AuthorizationOptions = {
  roles: [],
  permissions: [],
  checkAll: false
};

// Authorization middleware factory
export const createAuthorizationMiddleware = (options: AuthorizationOptions = {}) => {
  const authOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      // Get user role
      const userRole = req.user.role;
      if (!userRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'User has no role'
        });
      }

      // Check if role is allowed
      if (authOptions.roles && authOptions.roles.length > 0) {
        const hasRole = authOptions.roles.some(role => role.name === userRole);
        if (!hasRole) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'User role not allowed'
          });
        }
      }

      // Check if user has required permissions
      if (authOptions.permissions && authOptions.permissions.length > 0) {
        const role = authOptions.roles?.find(r => r.name === userRole);
        if (!role) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'User role not found'
          });
        }

        const hasPermissions = authOptions.checkAll
          ? authOptions.permissions.every(permission => role.permissions.includes(permission))
          : authOptions.permissions.some(permission => role.permissions.includes(permission));

        if (!hasPermissions) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'User does not have required permissions'
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Authorization error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Authorization helper functions
export const authorizationHelpers = {
  // Check if user has role
  hasRole: (user: any, role: string): boolean => {
    return user.role === role;
  },

  // Check if user has permission
  hasPermission: (user: any, permission: string, roles: Role[]): boolean => {
    const role = roles.find(r => r.name === user.role);
    if (!role) {
      return false;
    }
    return role.permissions.includes(permission);
  },

  // Check if user has all permissions
  hasAllPermissions: (user: any, permissions: string[], roles: Role[]): boolean => {
    const role = roles.find(r => r.name === user.role);
    if (!role) {
      return false;
    }
    return permissions.every(permission => role.permissions.includes(permission));
  },

  // Check if user has any permission
  hasAnyPermission: (user: any, permissions: string[], roles: Role[]): boolean => {
    const role = roles.find(r => r.name === user.role);
    if (!role) {
      return false;
    }
    return permissions.some(permission => role.permissions.includes(permission));
  }
}; 