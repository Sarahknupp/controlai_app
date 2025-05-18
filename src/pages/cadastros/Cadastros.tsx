import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowLeft } from 'lucide-react';
import { ClientesForm } from './ClientesForm';
import { FornecedoresForm } from './FornecedoresForm';
import { ClientesList } from './ClientesList';
import { FornecedoresList } from './FornecedoresList';

export const Cadastros: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Módulo de Cadastros</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition"
              onClick={() => navigate('/cadastros/clientes')}
            >
              <div className="bg-blue-600 px-4 py-5 sm:px-6 flex items-center">
                <div className="rounded-md bg-white bg-opacity-30 p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-white">Cadastro de Clientes</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-600">
                  Gerencie seus clientes, visualize histórico de compras, e mantenha suas informações de contato atualizadas.
                </p>
                <div className="mt-4 flex">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Pessoas Físicas
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Pessoas Jurídicas
                  </span>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition"
              onClick={() => navigate('/cadastros/fornecedores')}
            >
              <div className="bg-green-600 px-4 py-5 sm:px-6 flex items-center">
                <div className="rounded-md bg-white bg-opacity-30 p-3">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-white">Cadastro de Fornecedores</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-600">
                  Gerencie seus fornecedores, controle pedidos e mantenha um histórico de compras e cotações.
                </p>
                <div className="mt-4 flex">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Fornecedores Ativos
                  </span>
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Contratos de Fornecimento
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Módulo de Cadastros</h3>
            <div className="prose text-gray-600">
              <p>
                O módulo de cadastros permite gerenciar de forma completa os registros de clientes e fornecedores, 
                mantendo uma clara separação entre os tipos de entidade e seus dados específicos.
              </p>
              <p>
                <strong>Principais Funcionalidades:</strong>
              </p>
              <ul>
                <li>Cadastros de clientes (pessoa física e jurídica)</li>
                <li>Cadastros de fornecedores</li>
                <li>Registro de informações de contato</li>
                <li>Configuração de condições comerciais</li>
                <li>Gestão de documentos e arquivos</li>
                <li>Histórico de relacionamento</li>
              </ul>
            </div>
          </div>
        </div>
      } />
      <Route path="/clientes" element={<ClientesList />} />
      <Route path="/clientes/novo" element={<ClientesForm />} />
      <Route path="/clientes/editar/:id" element={<ClientesForm />} />
      <Route path="/fornecedores" element={<FornecedoresList />} />
      <Route path="/fornecedores/novo" element={<FornecedoresForm />} />
      <Route path="/fornecedores/editar/:id" element={<FornecedoresForm />} />
    </Routes>
  );
};