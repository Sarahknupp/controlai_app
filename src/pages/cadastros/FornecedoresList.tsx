import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, Download, Eye, Building2, Package } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';

export const FornecedoresList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Mock data for fornecedores
  const fornecedores = [
    { 
      id: '1', 
      razaoSocial: 'Distribuidora de Alimentos SA', 
      nomeFantasia: 'SuperFood',
      cnpj: '12.345.678/0001-90', 
      categoria: 'alimentos',
      cidade: 'São Paulo', 
      estado: 'SP', 
      telefone: '(11) 3456-7890', 
      email: 'contato@superfood.com',
      ultimaCompra: '15/10/2023',
      status: 'ativo'
    },
    { 
      id: '2', 
      razaoSocial: 'Equipamentos Industriais Ltda', 
      nomeFantasia: 'EquipMax',
      cnpj: '23.456.789/0001-01', 
      categoria: 'equipamentos',
      cidade: 'Curitiba', 
      estado: 'PR', 
      telefone: '(41) 3456-7890', 
      email: 'vendas@equipmax.com',
      ultimaCompra: '10/09/2023',
      status: 'ativo'
    },
    { 
      id: '3', 
      razaoSocial: 'Embalagens e Descartáveis Brasil', 
      nomeFantasia: 'EmbaPack',
      cnpj: '34.567.890/0001-12', 
      categoria: 'embalagens',
      cidade: 'Belo Horizonte', 
      estado: 'MG', 
      telefone: '(31) 3456-7890', 
      email: 'comercial@embapack.com',
      ultimaCompra: '05/10/2023',
      status: 'inativo'
    },
    { 
      id: '4', 
      razaoSocial: 'Importadora de Temperos Especiais Ltda', 
      nomeFantasia: 'SpiceWorld',
      cnpj: '45.678.901/0001-23', 
      categoria: 'alimentos',
      cidade: 'Salvador', 
      estado: 'BA', 
      telefone: '(71) 3456-7890', 
      email: 'atendimento@spiceworld.com',
      ultimaCompra: '01/09/2023',
      status: 'ativo'
    },
  ];
  
  // Filter fornecedores based on search term and filter type
  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = 
      fornecedor.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'alimentos' && fornecedor.categoria === 'alimentos') ||
      (filterType === 'equipamentos' && fornecedor.categoria === 'equipamentos') ||
      (filterType === 'embalagens' && fornecedor.categoria === 'embalagens') ||
      (filterType === 'ativo' && fornecedor.status === 'ativo') ||
      (filterType === 'inativo' && fornecedor.status === 'inativo');
      
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/cadastros')}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-green-600" />
            Cadastro de Fornecedores
          </h1>
        </div>
        
        <Button onClick={() => navigate('/cadastros/fornecedores/novo')}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Fornecedor
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Pesquisar fornecedores por nome, CNPJ ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Fornecedores</option>
              <option value="alimentos">Alimentos</option>
              <option value="equipamentos">Equipamentos</option>
              <option value="embalagens">Embalagens</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={() => {}} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Fornecedores Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div>{fornecedor.nomeFantasia}</div>
                    <div className="text-sm text-gray-500">{fornecedor.razaoSocial}</div>
                  </TableCell>
                  <TableCell>{fornecedor.cnpj}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fornecedor.categoria === 'alimentos' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : fornecedor.categoria === 'equipamentos'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}>
                      {fornecedor.categoria.charAt(0).toUpperCase() + fornecedor.categoria.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>{fornecedor.telefone}</div>
                    <div className="text-sm text-gray-500">{fornecedor.email}</div>
                  </TableCell>
                  <TableCell>
                    {fornecedor.cidade}/{fornecedor.estado}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      fornecedor.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/cadastros/fornecedores/editar/${fornecedor.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredFornecedores.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum fornecedor encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar seus filtros ou adicione um novo fornecedor.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/cadastros/fornecedores/novo')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Fornecedor
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};