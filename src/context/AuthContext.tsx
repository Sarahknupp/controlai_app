/**
 * Authentication context and provider implementation
 * @module context/AuthContext
 * @description Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { mockUsers } from '../data/mockData';

/**
 * Authentication context type definition
 * @interface AuthContextType
 * @property {User | null} user - Currently authenticated user or null if not authenticated
 * @property {boolean} loading - Loading state during authentication checks
 * @property {(email: string, password: string) => Promise<boolean>} login - Function to authenticate user
 * @property {() => void} logout - Function to log out the current user
 * @property {boolean} isAuthenticated - Indicates whether the user is authenticated
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Authentication context instance
 * @constant {React.Context<AuthContextType>}
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for the AuthProvider component
 * @interface AuthProviderProps
 * @property {React.ReactNode} children - Child components that will have access to auth context
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provedor de contexto de autenticação
 * @component
 * @param {AuthProviderProps} props - Propriedades do componente
 * @returns {JSX.Element} Provedor de autenticação
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  /**
   * Check for existing session on component mount
   * @function
   * @inner
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('bakery_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  /**
   * Authenticates a user with email and password
   * @async
   * @function login
   * @inner
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<void>} Success status of the login attempt
   * @throws {Error} If authentication fails
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      // Use mock data instead of API call
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Credenciais inválidas');
      }

      setUser(foundUser);
      localStorage.setItem('bakery_user', JSON.stringify(foundUser));
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }, []);
  
  /**
   * Logs out the current user
   * @function logout
   * @inner
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('bakery_user');
  }, []);
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
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
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};