/**
 * Dashboard component displaying key business metrics and widgets
 * @module components/Dashboard
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { DailySalesReport } from '../types/sale';
import { ProductivityReport } from '../types/production';
import { InventoryStatus } from '../types/inventory';

/**
 * Props for the SalesWidget component
 * @interface SalesWidgetProps
 * @property {DailySalesReport} salesData - Daily sales report data
 */
interface SalesWidgetProps {
  salesData: DailySalesReport;
}

/**
 * Widget displaying daily sales metrics
 * @component
 * @param {SalesWidgetProps} props - Component props
 * @returns {JSX.Element} Sales metrics widget
 */
const SalesWidget: React.FC<SalesWidgetProps> = ({ salesData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Vendas do Dia</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Total de Vendas</p>
          <p className="text-2xl font-bold">{salesData.totalSales}</p>
        </div>
        <div>
          <p className="text-gray-600">Receita Total</p>
          <p className="text-2xl font-bold">
            R$ {salesData.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Props for the ProductionWidget component
 * @interface ProductionWidgetProps
 * @property {ProductivityReport} productionData - Production metrics data
 */
interface ProductionWidgetProps {
  productionData: ProductivityReport;
}

/**
 * Widget displaying production metrics
 * @component
 * @param {ProductionWidgetProps} props - Component props
 * @returns {JSX.Element} Production metrics widget
 */
const ProductionWidget: React.FC<ProductionWidgetProps> = ({ productionData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Produção</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Taxa de Conclusão</p>
          <p className="text-2xl font-bold">
            {(productionData.completionRate * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-600">Taxa de Desperdício</p>
          <p className="text-2xl font-bold">
            {(productionData.wasteRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Props for the InventoryWidget component
 * @interface InventoryWidgetProps
 * @property {InventoryStatus} inventoryData - Inventory status data
 */
interface InventoryWidgetProps {
  inventoryData: InventoryStatus;
}

/**
 * Widget displaying inventory status
 * @component
 * @param {InventoryWidgetProps} props - Component props
 * @returns {JSX.Element} Inventory status widget
 */
const InventoryWidget: React.FC<InventoryWidgetProps> = ({ inventoryData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Estoque</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Itens Baixos</p>
          <p className="text-2xl font-bold text-yellow-500">
            {inventoryData.lowStockItems.length}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Itens Críticos</p>
          <p className="text-2xl font-bold text-red-500">
            {inventoryData.criticalStockItems.length}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main dashboard component displaying business metrics
 * @component
 * @returns {JSX.Element} Dashboard with metric widgets
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <div>
 *       <Dashboard />
 *     </div>
 *   );
 * }
 * ```
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // In a real app, these would be fetched from an API
  const mockSalesData: DailySalesReport = {
    date: new Date(),
    totalSales: 45,
    totalRevenue: 2750.5,
    totalTax: 275.05,
    totalDiscounts: 137.52,
    paymentBreakdown: {
      cash: { count: 20, total: 1200 },
      credit: { count: 15, total: 950 },
      debit: { count: 8, total: 480 },
      pix: { count: 2, total: 120.5 },
      transfer: { count: 0, total: 0 }
    },
    topProducts: [
      {
        productId: '1',
        productName: 'Pão Francês',
        quantity: 150,
        revenue: 450
      }
    ],
    hourlyBreakdown: {
      '08': { sales: 10, revenue: 300 },
      '09': { sales: 15, revenue: 450 }
    }
  };

  const mockProductionData: ProductivityReport = {
    periodStart: new Date(),
    periodEnd: new Date(),
    areas: [
      {
        area: 'Padaria',
        itemsProduced: 450,
        itemsWasted: 12,
        efficiencyRate: 0.95,
        avgCompletionTime: 45,
        topProducedItems: [
          {
            productId: '1',
            productName: 'Pão Francês',
            quantity: 200
          }
        ]
      }
    ],
    totalProduction: 450,
    totalPlanned: 500,
    completionRate: 0.9,
    wasteRate: 0.03,
    averageProductionTime: 45
  };

  const mockInventoryData: InventoryStatus = {
    totalItems: 150,
    lowStockItems: [
      { id: '1', name: 'Farinha', currentStock: 25, minStock: 50 }
    ],
    criticalStockItems: [
      { id: '2', name: 'Fermento', currentStock: 5, minStock: 20 }
    ],
    expiringItems: [
      { id: '3', name: 'Leite', expirationDate: new Date(), quantity: 10 }
    ]
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Bem-vindo, {user?.name || 'Usuário'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SalesWidget salesData={mockSalesData} />
        <ProductionWidget productionData={mockProductionData} />
        <InventoryWidget inventoryData={mockInventoryData} />
      </div>
    </div>
  );
};

export default Dashboard; 