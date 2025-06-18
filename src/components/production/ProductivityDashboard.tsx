// @ts-nocheck
import React, { useState } from 'react';
import { Table } from '../common/Table';
import Pagination from '../common/Pagination';
import { 
  mockProductivityReports, 
  mockProductionPlans, 
  getProductivityByArea 
} from '../../data/mockData';

interface ProductivityMetrics {
  area: string;
  itemsProduced: number;
  itemsWasted: number;
  efficiencyRate: number;
  avgCompletionTime: number;
}

const ProductivityDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get the latest productivity report
  const latestReport = mockProductivityReports[0];
  const areas = latestReport.areas;

  // Get active production plans
  const activePlans = mockProductionPlans.filter(plan => 
    plan.status === 'in-progress'
  );

  // Table columns configuration
  const columns = [
    {
      key: 'area',
      header: 'Área de Produção',
      cell: (item: ProductivityMetrics) => (
        <div className="font-medium">
          {item.area === 'kitchen' ? 'Cozinha' :
           item.area === 'confectionery' ? 'Confeitaria' :
           item.area === 'bakery' ? 'Padaria' : item.area}
        </div>
      ),
      sortable: true
    },
    {
      key: 'itemsProduced',
      header: 'Itens Produzidos',
      cell: (item: ProductivityMetrics) => item.itemsProduced,
      sortable: true
    },
    {
      key: 'efficiencyRate',
      header: 'Taxa de Eficiência',
      cell: (item: ProductivityMetrics) => (
        <div className={`
          font-medium
          ${item.efficiencyRate >= 90 ? 'text-green-600' :
            item.efficiencyRate >= 80 ? 'text-yellow-600' :
            'text-red-600'}
        `}>
          {item.efficiencyRate}%
        </div>
      ),
      sortable: true
    },
    {
      key: 'wasteRate',
      header: 'Taxa de Desperdício',
      cell: (item: ProductivityMetrics) => {
        const wasteRate = (item.itemsWasted / (item.itemsProduced + item.itemsWasted) * 100).toFixed(1);
        return (
          <div className={`
            font-medium
            ${Number(wasteRate) <= 5 ? 'text-green-600' :
              Number(wasteRate) <= 10 ? 'text-yellow-600' :
              'text-red-600'}
          `}>
            {wasteRate}%
          </div>
        );
      },
      sortable: true
    },
    {
      key: 'avgCompletionTime',
      header: 'Tempo Médio (min)',
      cell: (item: ProductivityMetrics) => item.avgCompletionTime,
      sortable: true
    },
    {
      key: 'activeProduction',
      header: 'Produção Ativa',
      cell: (item: ProductivityMetrics) => {
        const areaPlans = activePlans.filter(plan => plan.area === item.area);
        return (
          <div className="text-gray-600">
            {areaPlans.length} ordem(ns)
          </div>
        );
      }
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(areas.length / itemsPerPage);
  const paginatedData = areas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Taxa de Conclusão</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {latestReport.completionRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {latestReport.totalProduction} de {latestReport.totalPlanned} itens planejados
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Taxa de Desperdício</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {latestReport.wasteRate.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Média entre todas as áreas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Tempo Médio de Produção</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {latestReport.averageProductionTime} min
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Por ordem de produção
          </p>
        </div>
      </div>

      {/* Productivity Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Métricas por Área de Produção
          </h2>
          <Table
            columns={columns}
            data={paginatedData}
            keyExtractor={(item) => item.area}
          />
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={areas.length}
              itemsPerPage={itemsPerPage}
              showItemsPerPage={true}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard; 