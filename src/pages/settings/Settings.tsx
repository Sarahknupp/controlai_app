import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load sub-pages
const GeneralSettings = React.lazy(() => import('./GeneralSettings'));
const UserSettings = React.lazy(() => import('./UserSettings'));
const CompanySettings = React.lazy(() => import('./CompanySettings'));
const SecuritySettings = React.lazy(() => import('./SecuritySettings'));
const IntegrationSettings = React.lazy(() => import('./IntegrationSettings'));

/**
 * Página principal do módulo de configurações
 * @component
 * @returns {JSX.Element} Rotas do módulo de configurações
 */
const Settings: React.FC = () => {
  return (
    <Routes>
      <Route index element={<GeneralSettings />} />
      <Route path="users" element={<UserSettings />} />
      <Route path="company" element={<CompanySettings />} />
      <Route path="security" element={<SecuritySettings />} />
      <Route path="integrations" element={<IntegrationSettings />} />
    </Routes>
  );
};

export default Settings; 