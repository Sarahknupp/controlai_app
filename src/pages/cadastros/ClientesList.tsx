import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, Download, Eye, Users } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';

export const ClientesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Mock data for clientes
  const clientes = [
    { 
      id: '1', 
      nome: 'Maria da Silva', 
      tipo: 'fisica', 
      documento: '123.456.789-00', 
      cidade: 'São Paulo', 
      estado: 'SP', 
      telefone: '(11) 98765-4321', 
      email: 'maria@email.com',
      ultimaCompra: '15/10/2023',
      status: 'ativo'
    },
    { 
      id: '2', 
      nome: 'João Comércio Ltda', 
      tipo: 'juridica', 
      documento: '12.345.678/0001-90', 
      cidade: 'Rio de Janeiro', 
      estado: 'RJ', 
      telefone: '(21) 98765-4321', 
      email: 'contato@joaocomercio.com',
      ultimaCompra: '10/10/2023',
      status: 'ativo'
    },
    { 
      id: '3', 
      nome: 'Ana Paula Mendes', 
      tipo: 'fisica', 
      documento: '987.654.321-00', 
      cidade: 'Belo Horizonte', 
      estado: 'MG', 
      telefone: '(31) 98765-4321', 
      email: 'ana@email.com',
      ultimaCompra: '05/10/2023',
      status: 'inativo'
    },
    { 
      id: '4', 
      nome: 'Empresa ABC S/A', 
      tipo: 'juridica', 
      documento: '98.765.432/0001-10', 
      cidade: 'Curitiba', 
      estado: 'PR', 
      telefone: '(41) 98765-4321', 
      email: 'contato@empresaabc.com',
      ultimaCompra: '01/09/2023',
      status: 'ativo'
    },
  ];
  
  // Filter clients based on search term and filter type
  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'fisica' && cliente.tipo === 'fisica') ||
      (filterType === 'juridica' && cliente.tipo === 'juridica') ||
      (filterType === 'ativo' && cliente.status === 'ativo') ||
      (filterType === 'inativo' && cliente.status === 'inativo');
      
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
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Cadastro de Clientes
          </h1>
        </div>
        
        <Button onClick={() => navigate('/cadastros/clientes/novo')}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Cliente
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Pesquisar clientes por nome, documento ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Clientes</option>
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
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
      
      {/* Clients Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cliente.tipo === 'fisica' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cliente.tipo === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </TableCell>
                  <TableCell>{cliente.documento}</TableCell>
                  <TableCell>
                    <div>{cliente.telefone}</div>
                    <div className="text-sm text-gray-500">{cliente.email}</div>
                  </TableCell>
                  <TableCell>
                    {cliente.cidade}/{cliente.estado}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cliente.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/cadastros/clientes/editar/${cliente.id}`)}>
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
          
          {filteredClientes.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar seus filtros ou adicione um novo cliente.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/cadastros/clientes/novo')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo Cliente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};