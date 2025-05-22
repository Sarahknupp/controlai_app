/**
 * Custom hook for accessing authentication context
 * @module hooks/useAuth
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from '../types/user';
import { UserSettings } from '../types/auth';

/**
 * Return type for the useAuth hook
 * @interface UseAuthReturn
 * @property {User | null} user - Currently authenticated user or null if not authenticated
 * @property {boolean} loading - Loading state during authentication checks
 * @property {(email: string, password: string) => Promise<boolean>} login - Function to authenticate user
 * @property {() => void} logout - Function to log out the current user
 */
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  isAuthenticated: boolean;
}

/**
 * Hook that provides access to authentication state and methods
 * @function useAuth
 * @returns {UseAuthReturn} Authentication context value containing user data and auth methods
 * @throws {Error} If used outside of AuthProvider context
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * 
 * // Check if user is authenticated
 * if (user) {
 *   console.log('User is logged in:', user.name);
 * }
 * 
 * // Login
 * const handleLogin = async () => {
 *   const success = await login('user@example.com', 'password');
 *   if (success) {
 *     console.log('Login successful');
 *   }
 * };
 * 
 * // Logout
 * const handleLogout = () => {
 *   logout();
 *   console.log('User logged out');
 * };
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { user, login, logout, updateProfile, updateSettings } = context;

  return {
    user,
    login,
    logout,
    updateProfile,
    updateSettings,
    isAuthenticated: !!user,
  };
};