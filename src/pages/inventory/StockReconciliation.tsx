import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, CheckCircle, AlertTriangle, Search, Download, Calendar, User, ClipboardCheck, FileText } from 'lucide-react';
import { mockInventory } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';

export const StockReconciliation: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reconciliationDate, setReconciliationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [completedReconciliation, setCompletedReconciliation] = useState(false);
  
  // Create a state for inventory items with physical count
  const [reconciliationItems, setReconciliationItems] = useState<Array<{
    id: string;
    name: string;
    internalCode: string;
    unit: string;
    systemQuantity: number;
    physicalQuantity: number;
    difference: number;
    hasDiscrepancy: boolean;
    adjustmentReason?: string;
    location: string;
  }>>([]);

  // Initialize reconciliation items from mock inventory
  useEffect(() => {
    const items = mockInventory.map(item => ({
      id: item.id,
      name: item.name,
      internalCode: item.internalCode || '',
      unit: item.unit,
      systemQuantity: item.quantity,
      physicalQuantity: item.quantity, // Initially set to same as system
      difference: 0,
      hasDiscrepancy: false,
      location: item.location
    }));
    
    setReconciliationItems(items);
  }, []);

  // Filter inventory based on search term
  const filteredItems = reconciliationItems.filter(
    (item) => {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (item.internalCode && item.internalCode.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  );
  
  // Sort inventory
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'systemQuantity') {
      return sortDirection === 'asc'
        ? a.systemQuantity - b.systemQuantity
        : b.systemQuantity - a.systemQuantity;
    } else if (sortField === 'physicalQuantity') {
      return sortDirection === 'asc'
        ? a.physicalQuantity - b.physicalQuantity
        : b.physicalQuantity - a.physicalQuantity;
    } else if (sortField === 'difference') {
      return sortDirection === 'asc'
        ? a.difference - b.difference
        : b.difference - a.difference;
    } else if (sortField === 'internalCode') {
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

  const handlePhysicalQuantityChange = (id: string, value: number) => {
    setReconciliationItems(items => 
      items.map(item => {
        if (item.id === id) {
          const newPhysicalQty = Math.max(0, value); // Ensure non-negative
          const difference = newPhysicalQty - item.systemQuantity;
          return {
            ...item,
            physicalQuantity: newPhysicalQty,
            difference: difference,
            hasDiscrepancy: difference !== 0
          };
        }
        return item;
      })
    );
  };

  const handleReasonChange = (id: string, reason: string) => {
    setReconciliationItems(items =>
      items.map(item => 
        item.id === id ? { ...item, adjustmentReason: reason } : item
      )
    );
  };

  // Function to refresh all quantities to match system (reset)
  const handleResetCounts = () => {
    setReconciliationItems(items =>
      items.map(item => ({
        ...item,
        physicalQuantity: item.systemQuantity,
        difference: 0,
        hasDiscrepancy: false,
        adjustmentReason: undefined
      }))
    );
    toast.success('Contagens resetadas para valores do sistema');
  };

  // Function to complete the reconciliation
  const handleSubmitReconciliation = async () => {
    // Validate that all items with discrepancies have an adjustment reason
    const itemsWithDiscrepancyNoReason = reconciliationItems.filter(
      item => item.hasDiscrepancy && !item.adjustmentReason
    );

    if (itemsWithDiscrepancyNoReason.length > 0) {
      toast.error(`${itemsWithDiscrepancyNoReason.length} itens com divergência não possuem motivo de ajuste`);
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate updating the inventory quantities
      // In a real app, we would update the database

      toast.success('Conferência de estoque concluída e ajustes aplicados com sucesso!');
      setCompletedReconciliation(true);
    } catch (error) {
      toast.error('Erro ao salvar a conferência de estoque');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportReport = () => {
    toast.success('Relatório de conferência exportado com sucesso');
    // In a real application, this would trigger a file download
  };

  // Count statistics
  const totalItems = reconciliationItems.length;
  const itemsWithDiscrepancy = reconciliationItems.filter(item => item.hasDiscrepancy).length;
  const positiveDiscrepancies = reconciliationItems.filter(item => item.difference > 0).length;
  const negativeDiscrepancies = reconciliationItems.filter(item => item.difference < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/inventory')}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">Conferência de Estoque</h1>
        </div>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleResetCounts}
            disabled={isSubmitting || completedReconciliation}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Resetar Contagens
          </Button>
          
          <Button
            onClick={handleSubmitReconciliation}
            disabled={isSubmitting || completedReconciliation}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Salvando...' : 'Finalizar Conferência'}
          </Button>
        </div>
      </div>
      
      {/* Reconciliation Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label htmlFor="reconciliationDate" className="block text-sm font-medium text-gray-700">
                Data da Conferência
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="reconciliationDate"
                  name="reconciliationDate"
                  value={reconciliationDate}
                  onChange={(e) => setReconciliationDate(e.target.value)}
                  className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  disabled={completedReconciliation}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="shadow-sm focus:ring-amber-500 focus:border-amber-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Adicione observações sobre esta conferência"
                disabled={completedReconciliation}
              ></textarea>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo da Conferência</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total de Itens</div>
                <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Divergências</div>
                <div className="text-2xl font-bold text-amber-600">{itemsWithDiscrepancy}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sobras</div>
                <div className="text-2xl font-bold text-green-600">{positiveDiscrepancies}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Faltas</div>
                <div className="text-2xl font-bold text-red-600">{negativeDiscrepancies}</div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Responsável: {completedReconciliation ? 'Admin User' : 'Não finalizado'}
                </span>
              </div>
              <div className="flex items-center">
                <ClipboardCheck className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Status: {completedReconciliation ? 'Concluído' : 'Em andamento'}
                </span>
              </div>

              {completedReconciliation && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={handleExportReport}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Exportar Relatório
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="py-10 text-center">
            <RefreshCw className="mx-auto h-10 w-10 text-amber-600 animate-spin" />
            <p className="mt-2 text-gray-500">Carregando itens...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('internalCode')}
                  >
                    Código
                    {sortField === 'internalCode' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Produto
                    {sortField === 'name' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>
                    Localização
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('systemQuantity')}
                  >
                    Qde. Sistema
                    {sortField === 'systemQuantity' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('physicalQuantity')}
                  >
                    Qde. Física
                    {sortField === 'physicalQuantity' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('difference')}
                  >
                    Diferença
                    {sortField === 'difference' && (
                      <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>
                    Motivo do Ajuste
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.internalCode || '-'}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.systemQuantity} {item.unit}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.physicalQuantity}
                        onChange={(e) => handlePhysicalQuantityChange(item.id, parseFloat(e.target.value))}
                        className="w-24"
                        disabled={completedReconciliation}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${item.difference === 0 
                          ? 'bg-green-100 text-green-800' 
                          : item.difference > 0 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {item.difference > 0 ? '+' : ''}{item.difference} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.hasDiscrepancy && (
                        <Input
                          type="text"
                          placeholder="Motivo do ajuste"
                          value={item.adjustmentReason || ''}
                          onChange={(e) => handleReasonChange(item.id, e.target.value)}
                          className="w-full"
                          disabled={completedReconciliation}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {sortedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-center">
                        <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item encontrado</h3>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {completedReconciliation && (
        <div className="bg-green-50 p-4 border-l-4 border-green-500 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Conferência de estoque finalizada com sucesso! Os ajustes foram aplicados ao estoque.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!completedReconciliation && itemsWithDiscrepancy > 0 && (
        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-500 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Existem {itemsWithDiscrepancy} itens com divergência entre o estoque físico e o sistema.
                Para itens com divergência, por favor, informe o motivo do ajuste antes de finalizar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};