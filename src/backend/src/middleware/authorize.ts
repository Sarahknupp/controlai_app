/**
 * Authorization middleware
 * @module middleware/authorize
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { ApiError } from '../utils/ApiError';
import { UserRole, Permission } from '../types/auth';

/**
 * Creates middleware to check if user has required roles
 * @function authorize
 * @param {UserRole[]} roles - Array of required roles
 * @returns {Function} Express middleware function
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError('Não autorizado', 401));
      return;
    }

    const hasRole = allowedRoles.includes(req.user.cargo as UserRole);
    if (!hasRole) {
      next(new ApiError('Acesso negado', 403));
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário tem a permissão necessária
 * @param permissions - Array de permissões necessárias (deve ter todas)
 */
export const hasPermission = (requiredPermissions: Permission[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError('Não autorizado', 401));
      return;
    }

    const userPermissions = req.user.permissoes;
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      next(new ApiError('Acesso negado', 403));
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário tem pelo menos uma das permissões
 * @param permissions - Array de permissões (precisa ter pelo menos uma)
 */
export const hasAnyPermission = (requiredPermissions: Permission[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError('Não autorizado', 401));
      return;
    }

    const userPermissions = req.user.permissoes;
    const hasAnyRequiredPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAnyRequiredPermission) {
      next(new ApiError('Acesso negado', 403));
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário tem o cargo ou a permissão necessária
 * @param roles - Array de cargos permitidos
 * @param permissions - Array de permissões necessárias
 */
export const hasRoleOrPermission = (roles: UserRole[], permissions: Permission[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError('Não autorizado', 401));
      return;
    }

    const hasRole = roles.includes(req.user.cargo as UserRole);
    const userPermissions = req.user.permissoes;
    const hasPermission = permissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasRole && !hasPermission) {
      next(new ApiError('Acesso negado', 403));
      return;
    }

    next();
  };
}; 