import React from 'react';
import ProductivityDashboard from '../components/production/ProductivityDashboard';

const ProductivityPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Relatório de Produtividade
        </h1>
        <p className="mt-2 text-gray-600">
          Acompanhamento de métricas e indicadores de produção
        </p>
      </div>

      <ProductivityDashboard />
    </div>
  );
};

export default ProductivityPage; 