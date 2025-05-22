/**
 * Main application component that sets up routing and authentication
 * @module App
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import NotFound from './pages/NotFound';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { FaFileImport, FaChartLine, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ProductImportPage } from './pages/ProductImportPage';

/**
 * Root component that provides routing and authentication context
 * @component
 * @returns {JSX.Element} Application root component
 */
const App: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/">
              Controle de Vendas
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/import">
                  <FaFileImport className="me-2" />
                  Importar Produtos
                </Nav.Link>
                <Nav.Link as={Link} to="/reports">
                  <FaChartLine className="me-2" />
                  Relatórios
                </Nav.Link>
                <Nav.Link as={Link} to="/settings">
                  <FaCog className="me-2" />
                  Configurações
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Navigate to="/customers" />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Layout>
                  <Customers />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <PrivateRoute>
                <Layout>
                  <CustomerForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <CustomerForm />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <PrivateRoute>
                <Layout>
                  <AuditLogs />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="/import" element={<ProductImportPage />} />
          <Route path="/reports" element={<div>Relatórios</div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

const AppWithProviders: React.FC = () => (
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
);

export default AppWithProviders;
