import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load sub-pages
const SalesList = React.lazy(() => import('./SalesList'));
const NewSale = React.lazy(() => import('./NewSale'));
const SaleDetails = React.lazy(() => import('./SaleDetails'));

/**
 * Página principal do módulo de vendas
 * @component
 * @returns {JSX.Element} Rotas do módulo de vendas
 */
const Sales: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SalesList />} />
      <Route path="new" element={<NewSale />} />
      <Route path=":id" element={<SaleDetails />} />
    </Routes>
  );
};

export default Sales; 