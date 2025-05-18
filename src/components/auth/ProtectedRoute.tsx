/**
 * Protected route component that handles authentication and role-based access control
 * @module components/auth/ProtectedRoute
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Props for the ProtectedRoute component
 * @interface ProtectedRouteProps
 * @property {React.ReactNode} children - Child components to render when access is granted
 * @property {UserRole[]} [allowedRoles] - List of roles that have access to this route
 */
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Componente para proteger rotas que requerem autenticação
 * @component
 * @param {ProtectedRouteProps} props - Propriedades do componente
 * @returns {JSX.Element} Rota protegida ou redirecionamento para login
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  allowedRoles 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};