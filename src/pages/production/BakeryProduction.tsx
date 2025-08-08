import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Clock, ArrowLeft, Plus, CheckCircle, AlertTriangle, Users, Filter, Search, Thermometer, AlertCircle } from 'lucide-react';
import { mockProductionOrders, mockBakeryItems, mockProductionAreas, mockTechnicalSheets } from '../../data/mockData';

const BakeryProduction: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'items' | 'technical'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get bakery orders
  const bakeryOrders = mockProductionOrders.filter(order =>
    order.assignedArea === 'bakery' ||
    (order.assignedArea === 'multiple' && order.items.some(item => item.area === 'bakery'))
  );
  
  // Filter orders
  const filteredOrders = bakeryOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.clientName && order.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Filter bakery items
  const filteredItems = mockBakeryItems.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.doughType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Filter technical sheets
  const filteredTechnicalSheets = mockTechnicalSheets.filter(sheet =>
    sheet.area === 'bakery' && (
      searchTerm === '' || 
      sheet.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.specificInstructions.some(inst => inst.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sheet.preparationSteps.some(step => step.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );
  
  // Bakery area data
  const bakeryArea = mockProductionAreas.find(area => area.name === 'Panificação');
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) {
      return `Atrasado por ${Math.abs(diffInHours)}h`;
    } else if (diffInHours === 0) {
      const diffInMinutes = Math.round((date.getTime() - now.getTime()) / (1000 * 60));
      return diffInMinutes <= 0 ? 'Agora' : `Em ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `Em ${diffInHours}h`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Em ${days}d`;
    }
  };
  
  // Format time in hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };
  
  // Get priority class
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/production')}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Utensils className="h-6 w-6 mr-2 text-amber-600" />
            Produção: Panificação
          </h1>
        </div>
        
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => navigate('/production/order/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Produção
          </button>
        </div>
      </div>
      
      {/* Bakery Area Overview */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Visão Geral da Panificação
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Monitoramento das atividades de panificação e fermentação
              </p>
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                bakeryArea && bakeryArea.currentUtilization > 75 
                  ? 'bg-red-100 text-red-800' 
                  : bakeryArea && bakeryArea.currentUtilization > 50
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {bakeryArea ? `${bakeryArea.currentUtilization}% de Utilização` : 'Carregando...'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Status
              </h3>
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ordens em Andamento:</span>
                  <span className="font-medium text-gray-900">{filteredOrders.filter(o => o.status === 'in-production').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ordens Pendentes:</span>
                  <span className="font-medium text-gray-900">{filteredOrders.filter(o => o.status === 'pending').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ordens Alta Prioridade:</span>
                  <span className="font-medium text-red-600">{filteredOrders.filter(o => o.priority === 'high').length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Produtos de Panificação:</span>
                  <span className="font-medium text-gray-900">{mockBakeryItems.length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-amber-600" />
                Equipamentos
              </h3>
              <div className="mt-3 space-y-2">
                {bakeryArea && bakeryArea.equipment.map(equip => (
                  <div key={equip.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`inline-flex h-2 w-2 rounded-full mr-2 ${
                        equip.status === 'active' 
                          ? 'bg-green-500' 
                          : equip.status === 'maintenance'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm">{equip.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      equip.status === 'active' 
                        ? 'text-green-700' 
                        : equip.status === 'maintenance'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }`}>
                      {equip.status === 'active' 
                        ? 'Ativo' 
                        : equip.status === 'maintenance'
                          ? 'Em Manutenção'
                          : 'Fora de Serviço'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Alertas
              </h3>
              <div className="mt-3 space-y-3">
                {filteredOrders.filter(order => 
                  order.priority === 'high' && 
                  order.status !== 'completed' && 
                  order.status !== 'delivered'
                ).slice(0, 2).map(order => (
                  <div key={order.id} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Ordem Prioritária: {order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        Prazo: {new Date(order.dueDate).toLocaleDateString('pt-BR')} {new Date(order.dueDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
                
                {bakeryArea && bakeryArea.equipment.filter(equip => equip.status !== 'active').map(equip => (
                  <div key={equip.id} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Equipamento Indisponível: {equip.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {equip.status === 'maintenance' ? 'Em Manutenção' : 'Fora de Serviço'}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.filter(order => 
                  new Date(order.dueDate) < new Date() && 
                  order.status !== 'completed' && 
                  order.status !== 'delivered'
                ).slice(0, 2).map(order => (
                  <div key={order.id} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Ordem Atrasada: {order.orderNumber}
                      </div>
                      <div className="text-xs text-red-600">
                        Deveria ter sido entregue há {Math.abs(Math.round((new Date(order.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)))} horas
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.filter(o => 
                  o.priority === 'high' || 
                  new Date(o.dueDate) < new Date() || 
                  (bakeryArea && bakeryArea.equipment.some(e => e.status !== 'active'))
                ).length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-4">
                    Nenhum alerta no momento
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ordens de Produção
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'items'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos de Panificação
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'technical'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fichas Técnicas
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder={
                    activeTab === 'orders' 
                      ? "Pesquisar ordens..." 
                      : activeTab === 'items'
                        ? "Pesquisar produtos..."
                        : "Pesquisar fichas técnicas..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {activeTab === 'orders' && (
              <div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Todos os Status</option>
                    <option value="pending">Pendentes</option>
                    <option value="in-production">Em Produção</option>
                    <option value="completed">Concluídos</option>
                    <option value="delivered">Entregues</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente/Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itens
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status/Prioridade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prazo
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-amber-600">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {order.totalEstimatedTime} min
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.clientName ? (
                        <div className="text-sm font-medium text-gray-900">{order.clientName}</div>
                      ) : (
                        <div className="text-sm text-gray-500">Produção Interna</div>
                      )}
                      <div className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.items.filter(item => item.area === 'bakery').map(item => (
                          <div key={item.id} className="mb-1 last:mb-0">
                            {item.productName} ({item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : order.status === 'in-production'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'delivered'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'pending' 
                          ? 'Pendente' 
                          : order.status === 'in-production'
                            ? 'Em Produção'
                            : order.status === 'completed'
                              ? 'Concluído'
                              : order.status === 'delivered'
                                ? 'Entregue'
                                : 'Cancelado'}
                      </span>
                      
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(order.priority)}`}>
                          {order.priority === 'high' 
                            ? 'Alta' 
                            : order.priority === 'medium'
                              ? 'Média'
                              : 'Baixa'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        new Date(order.dueDate) < new Date() 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {new Date(order.dueDate).toLocaleDateString('pt-BR')} {new Date(order.dueDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(new Date(order.dueDate))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => navigate(`/production/order/${order.id}`)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-10">
                <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma ordem de produção encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajuste os filtros ou crie uma nova ordem de produção.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Bakery Items Tab Content */}
        {activeTab === 'items' && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="p-3 bg-amber-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {item.doughType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500">Tempo de Fermentação</div>
                          <div className="text-sm font-medium">{formatTime(item.fermentationTime)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Temperatura Fermentação</div>
                          <div className="text-sm font-medium">{item.fermentationTemperature}°C</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Tempo de Forno</div>
                          <div className="text-sm font-medium">{item.ovenTime} min</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Temperatura do Forno</div>
                          <div className="text-sm font-medium">{item.ovenTemperature}°C</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-500">Tamanho do Lote</div>
                          <div className="text-sm font-medium">{item.batchSize} unidades</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Validade</div>
                          <div className="text-sm font-medium">{item.shelfLife} horas</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Ingredientes Principais</div>
                        <div className="text-sm">
                          {item.ingredients.slice(0, 3).map((ing, idx) => (
                            <span key={ing.id} className="inline-block mr-1">
                              {ing.name}{idx < Math.min(3, item.ingredients.length) - 1 ? ',' : ''} 
                            </span>
                          ))}
                          {item.ingredients.length > 3 && (
                            <span className="text-xs text-gray-500">+{item.ingredients.length - 3} mais</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200 flex justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Iniciar Produção
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Item Card */}
              <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium">Adicionar Novo Item</div>
                <div className="text-xs mt-1">Criar novo produto de panificação</div>
              </div>
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-10">
                <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajuste os filtros ou adicione um novo item.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Technical Sheets Tab Content */}
        {activeTab === 'technical' && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              {filteredTechnicalSheets.map(sheet => (
                <div key={sheet.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="p-3 bg-amber-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{sheet.productName}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Validade: {sheet.shelfLife}h
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      {/* Fermentation and Baking Info */}
                      {sheet.fermentationTime && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Fermentação e Forneamento</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Fermentação:</span>
                              <span className="ml-1 font-medium">{formatTime(sheet.fermentationTime)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Forneamento:</span>
                              <span className="ml-1 font-medium">{sheet.bakingTime} min a {sheet.temperatureControl?.min}°C</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Special Instructions */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Instruções Específicas</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          {sheet.specificInstructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Preparation Steps */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Passo a Passo</h4>
                        <div className="space-y-3">
                          {sheet.preparationSteps.slice(0, 3).map((step) => (
                            <div key={step.id} className="flex">
                              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 text-xs font-medium mr-2">
                                {step.order}
                              </div>
                              <div>
                                <p className="text-sm text-gray-800">{step.description}</p>
                                <div className="flex text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {step.estimatedTime} min
                                  {step.temperatureNeeded && (
                                    <div className="ml-3 flex items-center">
                                      <Thermometer className="h-3 w-3 mr-1" />
                                      {step.temperatureNeeded}°C
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {sheet.preparationSteps.length > 3 && (
                            <div className="text-xs text-amber-600 mt-1 text-center">
                              + {sheet.preparationSteps.length - 3} mais passos
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200 flex justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Ver Completo
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Iniciar Produção
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Technical Sheet Card */}
              <div className="border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium">Adicionar Nova Ficha Técnica</div>
                <div className="text-xs mt-1">Criar documentação de processos</div>
              </div>
            </div>
            
            {filteredTechnicalSheets.length === 0 && (
              <div className="text-center py-10">
                <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma ficha técnica encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajuste os filtros ou adicione uma nova ficha técnica.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default BakeryProduction;
