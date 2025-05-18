import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load pages
const Login = React.lazy(() => import('../pages/auth/Login'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const Sales = React.lazy(() => import('../pages/sales/Sales'));
const Inventory = React.lazy(() => import('../pages/inventory/Inventory'));
const Production = React.lazy(() => import('../pages/production/Production'));
const Reports = React.lazy(() => import('../pages/reports/Reports'));
const Settings = React.lazy(() => import('../pages/settings/Settings'));
const NotFound = React.lazy(() => import('../pages/error/NotFound'));

/**
 * Configuração principal de rotas da aplicação
 * @component
 * @returns {JSX.Element} Rotas da aplicação
 */
const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sales/*"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory/*"
              element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/production/*"
              element={
                <ProtectedRoute>
                  <Production />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/*"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings/*"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes; 