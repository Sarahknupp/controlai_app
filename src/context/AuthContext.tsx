/**
 * Authentication context and provider implementation
 * @module context/AuthContext
 * @description Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { User } from '../types/user';
import { IUser, AuthContextType, UserSettings } from '../types/auth';

/**
 * Authentication context type definition
 * @interface AuthContextType
 * @property {User | null} user - Currently authenticated user or null if not authenticated
 * @property {boolean} loading - Loading state during authentication checks
 * @property {string | null} error - Error message if authentication fails
 * @property {(email: string, password: string) => Promise<void>} login - Function to authenticate user
 * @property {() => void} logout - Function to log out the current user
 * @property {boolean} isAuthenticated - Indicates whether the user is authenticated
 * @property {(data: Partial<User>) => Promise<void>} updateProfile - Function to update user profile
 * @property {(settings: User['settings']) => Promise<void>} updateSettings - Function to update user settings
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSettings: (settings: User['settings']) => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Authentication context instance
 * @constant {React.Context<AuthContextType>}
 */
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  updateSettings: async () => {},
  isAuthenticated: false,
});

/**
 * Props for the AuthProvider component
 * @interface AuthProviderProps
 * @property {React.ReactNode} children - Child components that will have access to auth context
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provedor de contexto de autenticação
 * @component
 * @param {AuthProviderProps} props - Propriedades do componente
 * @returns {JSX.Element} Provedor de autenticação
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (settings: User['settings']) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateSettings(settings);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error: any) {
      setError(error.message || 'Failed to update settings');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    updateSettings,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 * @returns {AuthContextType} Contexto de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};