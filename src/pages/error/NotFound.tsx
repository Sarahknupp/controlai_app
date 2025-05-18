/**
 * 404 Not Found error page component
 * @module pages/error/NotFound
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página de erro 404 - Não Encontrado
 * @component
 * @returns {JSX.Element} Página de erro 404
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-6xl font-extrabold text-gray-900">404</h2>
          <p className="mt-2 text-xl text-gray-600">Página não encontrada</p>
          <p className="mt-2 text-sm text-gray-500">
            A página que você está procurando não existe ou foi removida.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 