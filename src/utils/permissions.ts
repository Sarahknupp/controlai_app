import { IUser, Permission } from '../types/auth';

export const hasPermission = (user: IUser, permission: Permission): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (user: IUser, permissions: Permission[]): boolean => {
  if (!user || !user.permissions) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

export const hasAllPermissions = (user: IUser, permissions: Permission[]): boolean => {
  if (!user || !user.permissions) return false;
  return permissions.every(permission => user.permissions.includes(permission));
}; 