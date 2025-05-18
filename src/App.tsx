/**
 * Main application component that sets up routing and authentication
 * @module App
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/error/ErrorBoundary';
import AppRoutes from './routes';

/**
 * Root component that provides routing and authentication context
 * @component
 * @returns {JSX.Element} Application root component
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
