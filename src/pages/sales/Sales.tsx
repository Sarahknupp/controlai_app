import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiPlus, FiFilter, FiDownload } from 'react-icons/fi';
import { PaymentStatus } from '../../types/sale';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/sales/StatusBadge';
import SaleFilters from '../../components/sales/SaleFilters';
import { useSales } from '../../hooks/useSales';
import NewSale from './NewSale';
import SaleDetails from './SaleDetails';

/**
 * Página principal do módulo de vendas
 * @component
 * @returns {JSX.Element} Rotas do módulo de vendas
 */
const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { sales, isLoading, error, fetchSales } = useSales();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    customer: ''
  });

  useEffect(() => {
    fetchSales(filters);
  }, [filters, currentPage]);

  const columns = [
    {
      header: 'Data',
      accessor: 'createdAt',
      cell: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    },
    {
      header: 'Cliente',
      accessor: 'customer.name'
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value: PaymentStatus) => <StatusBadge status={value} />
    },
    {
      header: 'Ações',
      accessor: '_id',
      cell: (value: string) => (
        <button
          onClick={() => navigate(`/sales/${value}`)}
          className="text-blue-600 hover:text-blue-800"
        >
          Ver detalhes
        </button>
      )
    }
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Vendas</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<FiFilter />}
                >
                  Filtros
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  icon={<FiDownload />}
                >
                  Exportar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/sales/new')}
                  icon={<FiPlus />}
                >
                  Nova Venda
                </Button>
              </div>
            </div>

            {showFilters && (
              <Card>
                <SaleFilters
                  filters={filters}
                  onFilter={setFilters}
                  onClose={() => setShowFilters(false)}
                />
              </Card>
            )}

            <Card>
              <Table
                columns={columns}
                data={sales}
                isLoading={isLoading}
                error={error}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={10} // TODO: Get from API
              />
            </Card>
          </div>
        }
      />
      <Route path="/new" element={<NewSale />} />
      <Route path="/:id" element={<SaleDetails />} />
    </Routes>
  );
};

export default Sales; 