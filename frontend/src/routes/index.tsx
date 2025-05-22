import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationDashboard from '../components/NotificationDashboard';
import UserManagement from '../components/UserManagement';
import TemplateManagement from '../components/TemplateManagement';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* ... existing routes ... */}
        
        {/* Admin routes */}
        <Route
          path="/admin/notifications"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <NotificationDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <UserManagement />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/templates"
          element={
            isAuthenticated && user?.role === 'ADMIN' ? (
              <TemplateManagement />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* ... existing routes ... */}
      </Routes>
    </Router>
  );
};

export default AppRoutes; 