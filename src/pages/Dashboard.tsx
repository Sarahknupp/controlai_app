import React from 'react';
import { CreditCard, Package, ShoppingBasket, AlertTriangle, TrendingUp, Calendar, Clock, ChefHat, Cake, Utensils } from 'lucide-react';
import { mockDailySales, mockProductSales, getLowStockItems, getExpiringSoonItems, getTodaysProduction, getTodaysRevenue, getTodaysSales, mockProductionOrders } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const lowStockItems = getLowStockItems();
  const expiringSoonItems = getExpiringSoonItems();
  const todayProduction = getTodaysProduction();
  const todaySales = getTodaysSales();
  const todayRevenue = getTodaysRevenue();
  
  // Production orders in progress
  const inProgressOrders = mockProductionOrders.filter(order => order.status === 'in-production');
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">{formatDate(new Date())}</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">Vendas de Hoje</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(todayRevenue)}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">{todaySales.length} transações</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <ShoppingBasket className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">Itens em Produção</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {todayProduction?.reduce((acc, plan) => acc + plan.products.reduce((sum, p) => sum + p.quantity, 0), 0) || 0}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              {todayProduction?.reduce((acc, plan) => acc + plan.products.reduce((sum, p) => sum + p.completed, 0), 0) || 0} concluídos
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">Estoque Baixo</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">{expiringSoonItems.length} próximos da validade</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">Ordens de Produção</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{inProgressOrders.length}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">Em andamento</span>
          </div>
        </div>
      </div>
      
      {/* Producation Status */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-600" />
              Status de Produção em Tempo Real
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kitchen Status */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-3">
                  <ChefHat className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Cozinha</h3>
                  <div className="ml-auto flex">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Utilização:</span>
                    <span className="font-medium text-gray-900">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Itens em produção:</span>
                      <span className="font-medium text-gray-900">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Urgentes:</span>
                      <span className="font-medium text-red-600">1</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-500">
                        Próximo item a ser concluído:
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium">Sopa de Legumes</span>
                        <span className="text-xs text-green-600">25 min</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Confectionery Status */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-3">
                  <Cake className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Confeitaria</h3>
                  <div className="ml-auto flex">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Utilização:</span>
                    <span className="font-medium text-gray-900">40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Itens em produção:</span>
                      <span className="font-medium text-gray-900">1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Urgentes:</span>
                      <span className="font-medium text-gray-500">0</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-500">
                        Próximo item a ser concluído:
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium">Bolo de Cenoura</span>
                        <span className="text-xs text-green-600">45 min</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bakery Status */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center mb-3">
                  <Utensils className="h-6 w-6 text-amber-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Panificação</h3>
                  <div className="ml-auto flex">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Alta Demanda
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Utilização:</span>
                    <span className="font-medium text-gray-900">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Itens em produção:</span>
                      <span className="font-medium text-gray-900">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Urgentes:</span>
                      <span className="font-medium text-red-600">2</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-500">
                        Próximo item a ser concluído:
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium">Pão Sourdough</span>
                        <span className="text-xs text-amber-600">2h 30min</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Weekly Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
                Vendas Semanais
              </h3>
              <div className="text-sm text-gray-500">Últimos 7 dias</div>
            </div>
          </div>
          <div className="p-5">
            <div className="h-64 flex items-end space-x-2">
              {mockDailySales.map((day) => {
                const height = Math.round((day.total / 900) * 100);
                return (
                  <div key={day.date} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-amber-500 rounded-t-sm transition-all duration-500 ease-in-out hover:bg-amber-600"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-2">{day.date.split('-')[2]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ShoppingBasket className="h-5 w-5 mr-2 text-amber-600" />
                Produtos Mais Vendidos
              </h3>
              <div className="text-sm text-gray-500">Por receita</div>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {mockProductSales.map((product) => (
                <div key={product.product} className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{product.product}</div>
                    <div className="text-sm text-gray-500">{product.sales} unidades</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts and Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Alertas
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item.id} className="p-5 flex">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Estoque Baixo: {item.name}</h4>
                  <p className="text-sm text-gray-500">
                    Atual: {item.quantity} {item.unit} (Min: {item.minimumLevel} {item.unit})
                  </p>
                </div>
              </div>
            ))}
            {inProgressOrders.filter(order => order.priority === 'high').slice(0, 2).map((order) => (
              <div key={order.id} className="p-5 flex">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Produção Prioritária: Ordem #{order.orderNumber}</h4>
                  <p className="text-sm text-gray-500">
                    Vence em: {new Date(order.dueDate).toLocaleDateString('pt-BR')} {new Date(order.dueDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            {expiringSoonItems.slice(0, 1).map((item) => (
              <div key={item.id} className="p-5 flex">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Validade Próxima: {item.name}</h4>
                  <p className="text-sm text-gray-500">
                    Vence em: {item.expiryDate?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Today's Production */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-600" />
              Produção de Hoje
            </h3>
          </div>
          {todayProduction && todayProduction.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {todayProduction.map((plan) => (
                <div key={plan.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {plan.area === 'kitchen' ? 'Cozinha' : 
                       plan.area === 'confectionery' ? 'Confeitaria' : 'Panificação'}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : plan.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status === 'completed' 
                        ? 'Concluído' 
                        : plan.status === 'in-progress'
                          ? 'Em Andamento'
                          : 'Planejado'}
                    </span>
                  </div>
                  {plan.products.map((product) => (
                    <div key={product.productId} className="mt-3">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{product.productName}</h4>
                        <div className="text-sm text-gray-500">
                          {product.completed}/{product.quantity}
                        </div>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${Math.round((product.completed / product.quantity) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {plan.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-medium text-gray-700">Observações:</h4>
                      <p className="text-sm text-gray-600 mt-1">{plan.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center text-gray-500">
              Nenhuma produção agendada para hoje
            </div>
          )}
        </div>
      </div>
    </div>
  );
};