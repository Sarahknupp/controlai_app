import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user, permission);
  };

  return {
    hasPermission: checkPermission,
  };
}; 