import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Package, Search, AlertTriangle, Filter, Plus, ArrowUp, ArrowDown, EditIcon, Trash2, Download, ShoppingCart, AlertCircle, BarChart2, ClipboardCheck } from 'lucide-react';
import { mockInventory, getShoppingList } from '../../data/mockData';
import { InventoryForm } from './InventoryForm';
import { ShoppingList } from './ShoppingList';
import { IncomingGoods } from './IncomingGoods';
import { StockReconciliation } from './StockReconciliation';
import { InventoryList } from './InventoryList';
import { InventoryItem } from './InventoryItem';
import { NewItem } from './NewItem';
import { Suppliers } from './Suppliers';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const navigate = useNavigate();
  
  // Filter inventory based on search term and status
  const filteredInventory = mockInventory.filter(
    (item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.internalCode && item.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        filterStatus === 'all' ? true :
        filterStatus === 'low' ? item.quantity <= item.minimumLevel :
        filterStatus === 'expiring' ? (item.expiryDate && new Date(item.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 7))) :
        filterStatus === 'reorder' ? item.needsRestock :
        true;
      
      return matchesSearch && matchesStatus;
    }
  );
  
  // Sort inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'quantity') {
      return sortDirection === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity;
    } else if (sortField === 'expiryDate') {
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return sortDirection === 'asc' ? 1 : -1;
      if (!b.expiryDate) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc'
        ? a.expiryDate.getTime() - b.expiryDate.getTime()
        : b.expiryDate.getTime() - a.expiryDate.getTime();
    } else if (sortField === 'internalCode') {
      if (!a.internalCode && !b.internalCode) return 0;
      if (!a.internalCode) return sortDirection === 'asc' ? 1 : -1;
      if (!b.internalCode) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc'
        ? a.internalCode.localeCompare(b.internalCode)
        : b.internalCode.localeCompare(a.internalCode);
    }
    return 0;
  });
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getLowStockStatus = (item: typeof mockInventory[0]) => {
    const ratio = item.quantity / item.minimumLevel;
    if (ratio <= 1) return 'critical';
    if (ratio <= 1.5) return 'warning';
    return 'good';
  };
  
  const isExpiringSoon = (date?: Date) => {
    if (!date) return false;
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return date.getTime() - now.getTime() < oneWeek;
  };

  const needsRestock = (item: typeof mockInventory[0]) => {
    return item.quantity <= (item.reorderPoint || item.minimumLevel);
  };

  // Generate shopping list
  const shoppingListItems = getShoppingList();
  
  return (
    <Routes>
      <Route index element={<InventoryList />} />
      <Route path="item/:id" element={<InventoryItem />} />
      <Route path="new" element={<NewItem />} />
      <Route path="suppliers" element={<Suppliers />} />
      <Route path="shopping-list" element={<ShoppingList />} />
      <Route path="/" element={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Gestão de Estoque</h1>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => navigate('/inventory/entry')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Package className="h-4 w-4 mr-1" />
                Entrada de Mercadoria
              </button>
              <button
                type="button"
                onClick={() => navigate('/inventory/shopping-list')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Lista de Compras {shoppingListItems.length > 0 && (
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {shoppingListItems.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/inventory/reconciliation')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <ClipboardCheck className="h-4 w-4 mr-1" />
                Conferência de Estoque
              </button>
              <button
                type="button"
                onClick={() => navigate('/inventory/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Item
              </button>
            </div>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Estoque Crítico</h3>
                <p className="text-xl font-semibold text-red-900">
                  {mockInventory.filter(item => item.quantity <= item.minimumLevel).length} itens
                </p>
                <p className="text-xs text-red-700">Abaixo do estoque mínimo</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Próximos da Validade</h3>
                <p className="text-xl font-semibold text-yellow-900">
                  {mockInventory.filter(item => item.expiryDate && isExpiringSoon(item.expiryDate)).length} itens
                </p>
                <p className="text-xs text-yellow-700">Vencem nos próximos 7 dias</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Reposição Necessária</h3>
                <p className="text-xl font-semibold text-blue-900">
                  {shoppingListItems.length} itens
                </p>
                <p className="text-xs text-blue-700">Atingiram ponto de reposição</p>
              </div>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-64">
                <label htmlFor="search" className="sr-only">Pesquisar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Pesquisar no estoque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label htmlFor="status" className="sr-only">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Todos os Itens</option>
                    <option value="low">Estoque Baixo</option>
                    <option value="expiring">Próximo da Validade</option>
                    <option value="reorder">Necessita Reposição</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    // Export functionality would go here
                    console.log('Export inventory data');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Report functionality would go here
                    console.log('Generate inventory report');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Relatório
                </button>
              </div>
              
              <div className="text-sm text-gray-500 ml-auto">
                Mostrando {filteredInventory.length} de {mockInventory.length} itens
              </div>
            </div>
          </div>
          
          {/* Inventory Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('internalCode')}
                    >
                      <div className="flex items-center">
                        Código
                        {sortField === 'internalCode' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Nome do Item
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center">
                        Quantidade
                        {sortField === 'quantity' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Custo
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('expiryDate')}
                    >
                      <div className="flex items-center">
                        Validade
                        {sortField === 'expiryDate' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ponto de Reposição
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedInventory.map((item) => {
                    const stockStatus = getLowStockStatus(item);
                    const expiring = isExpiringSoon(item.expiryDate);
                    const needsRestocking = needsRestock(item);
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.internalCode || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-amber-100 text-amber-800">
                              <Package className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                          <div className="text-xs text-gray-500">Min: {item.minimumLevel} {item.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stockStatus === 'critical' 
                              ? 'bg-red-100 text-red-800' 
                              : stockStatus === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {stockStatus === 'critical' 
                              ? 'Crítico' 
                              : stockStatus === 'warning'
                                ? 'Baixo'
                                : 'Em Estoque'}
                          </span>
                          {expiring && (
                            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Vencimento Próximo
                            </span>
                          )}
                          {needsRestocking && (
                            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Repor
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">R${item.costPerUnit.toFixed(2)}/{item.unit}</div>
                          <div className="text-xs text-gray-500">Total: R${(item.quantity * item.costPerUnit).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.expiryDate ? item.expiryDate.toLocaleDateString() : 'N/A'}
                          </div>
                          {item.expiryDate && (
                            <div className="text-xs text-gray-500">
                              {expiring 
                                ? `Vence em ${Math.ceil((item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias` 
                                : 'Válido'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.reorderPoint || '-'} {item.unit}</div>
                          {item.suggestedOrderQuantity && (
                            <div className="text-xs text-gray-500">
                              Sugestão: {item.suggestedOrderQuantity} {item.unit}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => navigate(`/inventory/edit/${item.id}`)}
                              className="text-amber-600 hover:text-amber-900"
                            >
                              <EditIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {sortedInventory.length === 0 && (
              <div className="text-center py-10">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item de estoque encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece adicionando um novo item ao estoque.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/inventory/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Adicionar Item
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      } />
      <Route path="/edit/:id" element={<InventoryForm />} />
      <Route path="/entry" element={<IncomingGoods />} />
      <Route path="/reconciliation" element={<StockReconciliation />} />
    </Routes>
  );
};

export default Inventory;
