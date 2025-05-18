/**
 * Dashboard page component that displays user-specific information and widgets
 * @module pages/dashboard/Dashboard
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { Spinner } from '../../components/ui/spinner';
import { Card } from '../../components/ui/card';
import { Alert } from '../../components/ui/alert';

interface DashboardMetrics {
  dailySales: number;
  monthlyRevenue: number;
  activeProducts: number;
  lowStockProducts: number;
  activeCustomers: number;
  pendingOrders: number;
}

interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

/**
 * Main dashboard component showing user welcome message and overview widgets
 * @component
 * @returns {JSX.Element} Dashboard page component
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');

  // Fetch dashboard metrics
  const { data: metrics, isLoading: isLoadingMetrics, error: metricsError } = useQuery<DashboardMetrics>(
    ['dashboardMetrics'],
    async () => {
      const response = await api.get('/dashboard/metrics');
      return response.data;
    }
  );

  // Fetch sales data
  const { data: salesData, isLoading: isLoadingSales } = useQuery<SalesData[]>(
    ['salesData', dateRange],
    async () => {
      const response = await api.get(`/dashboard/sales?range=${dateRange}`);
      return response.data;
    }
  );

  // Handle date range change
  const handleDateRangeChange = useCallback((range: 'week' | 'month') => {
    setDateRange(range);
  }, []);

  if (isLoadingMetrics || isLoadingSales) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro ao carregar dados do dashboard</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.name}!
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleDateRangeChange('week')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => handleDateRangeChange('month')}
              className={`px-4 py-2 rounded-md ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center p-6">
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Diárias</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {formatCurrency(metrics?.dailySales || 0)}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center p-6">
              <div className="rounded-full bg-blue-100 p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {formatCurrency(metrics?.monthlyRevenue || 0)}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center p-6">
              <div className="rounded-full bg-purple-100 p-3">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {metrics?.activeProducts || 0}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center p-6">
              <div className="rounded-full bg-yellow-100 p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {metrics?.lowStockProducts || 0}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center p-6">
              <div className="rounded-full bg-indigo-100 p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {metrics?.activeCustomers || 0}
                </h3>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center p-6">
              <div className="rounded-full bg-red-100 p-3">
                <ShoppingCart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                <h3 className="text-xl font-semibold text-gray-900">
                  {metrics?.pendingOrders || 0}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Análise de Vendas</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  name="Vendas"
                  fill="#4F46E5"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Receita"
                  fill="#10B981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 