import React, { useState } from 'react';
import { Database, Upload, FileUp, Download, Filter, ChevronDown, ArrowUpDown, CheckCircle, XCircle, AlertCircle, Search, Plus, X, Check } from 'lucide-react';
import { mockFiscalDocuments, mockTaxObligations } from '../../data/mockAccountingData';

type FilterStatus = 'all' | 'pending' | 'completed' | 'cancelled' | 'issued' | 'denied' | 'paid' | 'late';
type SortDirection = 'asc' | 'desc';

export const FiscalIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'obligations' | 'import'>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<'' | 'validating' | 'importing' | 'complete'>('');
  const [sortField, setSortField] = useState<string>('issueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  // Filter documents
  const filteredDocuments = mockFiscalDocuments.filter(doc => {
    const matchesSearch = searchTerm === '' || 
                        doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortField === 'issueDate') {
      return sortDirection === 'asc'
        ? a.issueDate.getTime() - b.issueDate.getTime()
        : b.issueDate.getTime() - a.issueDate.getTime();
    } else if (sortField === 'number') {
      return sortDirection === 'asc'
        ? a.number.localeCompare(b.number)
        : b.number.localeCompare(a.number);
    } else if (sortField === 'customerName') {
      return sortDirection === 'asc'
        ? a.customerName.localeCompare(b.customerName)
        : b.customerName.localeCompare(a.customerName);
    } else if (sortField === 'totalAmount') {
      return sortDirection === 'asc'
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    }
    return 0;
  });
  
  // Sort tax obligations
  const sortedTaxObligations = [...mockTaxObligations].sort((a, b) => {
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
  
  // Filter obligations
  const filteredObligations = sortedTaxObligations.filter(obligation => {
    const matchesSearch = searchTerm === '' || 
                        obligation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        obligation.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || obligation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  /**
   * Handles sorting of documents
   * @function handleSort
   * @param {string} field - Field to sort by
   */
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleImportFiles = () => {
    setImportModalOpen(true);
    setUploadProgress(0);
    setProcessingStep('');
    
    // Simulate file upload and processing
    const timer = setInterval(() => {
      setUploadProgress(oldProgress => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setProcessingStep('validating');
          
          setTimeout(() => {
            setProcessingStep('importing');
            setTimeout(() => {
              setProcessingStep('complete');
            }, 1500);
          }, 1500);
          
          return 100;
        }
        return oldProgress + 5;
      });
    }, 150);
  };
  
  // Get status badge style
  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getObligationStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Database className="h-6 w-6 mr-2 text-gray-700" />
          Integração Fiscal
        </h1>
        
        <button
          onClick={handleImportFiles}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-4 w-4 mr-1" />
          Importar Arquivos
        </button>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('documents')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documentos Fiscais
            </button>
            <button
              onClick={() => setActiveTab('obligations')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'obligations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Obrigações Fiscais
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Importação Automática
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative rounded-md flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={
                  activeTab === 'documents' 
                    ? "Pesquisar documentos fiscais..." 
                    : activeTab === 'obligations'
                      ? "Pesquisar obrigações fiscais..."
                      : "Pesquisar importações..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as FilterStatus)}
              >
                <option value="all">Todos os Status</option>
                {activeTab === 'documents' ? (
                  <>
                    <option value="issued">Emitidos</option>
                    <option value="pending">Pendentes</option>
                    <option value="cancelled">Cancelados</option>
                    <option value="denied">Negados</option>
                  </>
                ) : (
                  <>
                    <option value="pending">Pendentes</option>
                    <option value="paid">Pagas</option>
                    <option value="late">Atrasadas</option>
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content based on active tab */}
        {activeTab === 'documents' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('number')}>
                    <div className="flex items-center">
                      Número/Série
                      {sortField === 'number' && (
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('issueDate')}>
                    <div className="flex items-center">
                      Data Emissão
                      {sortField === 'issueDate' && (
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('customerName')}>
                    <div className="flex items-center">
                      Cliente
                      {sortField === 'customerName' && (
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalAmount')}>
                    <div className="flex items-center">
                      Valor
                      {sortField === 'totalAmount' && (
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{document.number}</div>
                      <div className="text-xs text-gray-500">Série: {document.serie}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(document.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{document.customerName}</div>
                      <div className="text-xs text-gray-500">{document.customerDocument}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {document.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(document.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusBadge(document.status)}`}>
                        {document.status === 'issued' 
                          ? 'Emitido' 
                          : document.status === 'pending'
                            ? 'Pendente'
                            : document.status === 'cancelled'
                              ? 'Cancelado'
                              : 'Negado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Visualizar">
                          <FileUp className="h-5 w-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Download XML">
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sortedDocuments.length === 0 && (
              <div className="text-center py-10">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tente ajustar sua pesquisa ou filtros.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'obligations' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obrigação
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referência
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredObligations.map((obligation) => {
                  // Calculate days to due date
                  const today = new Date();
                  const dueDate = new Date(obligation.dueDate);
                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={obligation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{obligation.name}</div>
                        <div className="text-xs text-gray-500">{obligation.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          obligation.type === 'federal' 
                            ? 'bg-blue-100 text-blue-800' 
                            : obligation.type === 'state'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}>
                          {obligation.type === 'federal' 
                            ? 'Federal' 
                            : obligation.type === 'state'
                              ? 'Estadual'
                              : 'Municipal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {obligation.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(obligation.dueDate)}</div>
                        {obligation.status === 'pending' && (
                          <div className={`text-xs ${
                            diffDays <= 0 
                              ? 'text-red-600' 
                              : diffDays <= 5
                                ? 'text-amber-600'
                                : 'text-green-600'
                          }`}>
                            {diffDays < 0 
                              ? 'Vencido' 
                              : diffDays === 0
                                ? 'Vence hoje'
                                : `${diffDays} dias restantes`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(obligation.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getObligationStatusBadge(obligation.status)}`}>
                          {obligation.status === 'paid' 
                            ? 'Pago' 
                            : obligation.status === 'pending'
                              ? 'Pendente'
                              : 'Atrasado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {obligation.status !== 'paid' ? (
                            <>
                              <button className="text-green-600 hover:text-green-900" title="Marcar como Pago">
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900" title="Gerar Guia">
                                <FileUp className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <button className="text-blue-600 hover:text-blue-900" title="Ver Comprovante">
                              <FileUp className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredObligations.length === 0 && (
              <div className="text-center py-10">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma obrigação encontrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tente ajustar sua pesquisa ou filtros.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'import' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-lg font-medium text-gray-900">Importação Automática de Documentos Fiscais</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Importe XML de notas fiscais, documentos digitalizados via OCR e outros arquivos fiscais.
                </p>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="rounded-full bg-blue-100 p-3 mx-auto w-12 h-12 flex items-center justify-center mb-3">
                    <FileUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">XML de Documentos Fiscais</h3>
                  <p className="text-xs text-blue-700">
                    Importe arquivos XML de NFe, NFCe, CTe e outras notas fiscais
                  </p>
                  <button
                    className="mt-3 inline-flex items-center px-3 py-2 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Importar XML
                  </button>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="rounded-full bg-green-100 p-3 mx-auto w-12 h-12 flex items-center justify-center mb-3">
                    <Upload className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-green-900 mb-1">OCR para Documentos Físicos</h3>
                  <p className="text-xs text-green-700">
                    Digitalize notas fiscais em papel e extraia dados automaticamente
                  </p>
                  <button
                    className="mt-3 inline-flex items-center px-3 py-2 border border-green-300 text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Digitalizar Documento
                  </button>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="rounded-full bg-purple-100 p-3 mx-auto w-12 h-12 flex items-center justify-center mb-3">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-purple-900 mb-1">Importação em Lote</h3>
                  <p className="text-xs text-purple-700">
                    Importe múltiplos arquivos de uma só vez de maneira eficiente
                  </p>
                  <button
                    className="mt-3 inline-flex items-center px-3 py-2 border border-purple-300 text-sm leading-4 font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={handleImportFiles}
                  >
                    Importação em Lote
                  </button>
                </div>
              </div>
              
              <div className="mt-10 border-t border-gray-200 pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Histórico de Importações Recentes</h4>
                <div className="bg-white shadow overflow-hidden rounded-md">
                  <ul className="divide-y divide-gray-200">
                    <li className="px-4 py-4 flex items-center">
                      <div className="mr-4 flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Importação de XML (25 arquivos)
                        </p>
                        <p className="text-sm text-gray-500">
                          Concluído em 10/10/2023 às 15:32
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Concluído
                        </span>
                      </div>
                    </li>
                    <li className="px-4 py-4 flex items-center">
                      <div className="mr-4 flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Importação OCR (3 documentos)
                        </p>
                        <p className="text-sm text-gray-500">
                          Erro em 09/10/2023 às 11:45
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Erro
                        </span>
                      </div>
                    </li>
                    <li className="px-4 py-4 flex items-center">
                      <div className="mr-4 flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Importação em Lote (42 arquivos)
                        </p>
                        <p className="text-sm text-gray-500">
                          Concluído em 07/10/2023 às 09:15
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Concluído
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-10 border-t border-gray-200 pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">Configurações de Importação</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Configure os parâmetros para a importação automática de documentos fiscais.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="importDirectory" className="block text-sm font-medium text-gray-700">
                      Diretório de Importação
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="importDirectory"
                        id="importDirectory"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="/caminho/para/arquivos"
                        defaultValue="/dados/importacao/fiscal"
                      />
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                      >
                        Procurar
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-700">
                        Validação de Importação
                      </legend>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center">
                          <input
                            id="validateSchema"
                            name="validateSchema"
                            type="checkbox"
                            defaultChecked={true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="validateSchema" className="ml-2 block text-sm text-gray-700">
                            Validar esquema XML
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="validateDuplicates"
                            name="validateDuplicates"
                            type="checkbox"
                            defaultChecked={true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="validateDuplicates" className="ml-2 block text-sm text-gray-700">
                            Verificar documentos duplicados
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="validateTaxes"
                            name="validateTaxes"
                            type="checkbox"
                            defaultChecked={true}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="validateTaxes" className="ml-2 block text-sm text-gray-700">
                            Recalcular impostos automaticamente
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <Upload className="h-5 w-5 mr-2 text-gray-700" />
                      Importação de Documentos Fiscais
                    </h3>
                    
                    <div className="mt-6">
                      {!processingStep && (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Selecione os arquivos</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                              </label>
                              <p className="pl-1">ou arraste aqui</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              XML, PDF, imagens (até 20MB)
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {(uploadProgress > 0 || processingStep) && (
                        <div className="space-y-4">
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">Enviando arquivos...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {processingStep === 'validating' && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center text-sm font-medium text-amber-700">
                                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500 animate-pulse" />
                                  Validando documentos...
                                </div>
                                <div className="text-xs text-amber-500">
                                  1/3
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '33%' }}></div>
                              </div>
                            </div>
                          )}
                          
                          {processingStep === 'importing' && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center text-sm font-medium text-blue-700">
                                  <Database className="h-5 w-5 mr-2 text-blue-500 animate-pulse" />
                                  Importando para o sistema...
                                </div>
                                <div className="text-xs text-blue-500">
                                  2/3
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '66%' }}></div>
                              </div>
                            </div>
                          )}
                          
                          {processingStep === 'complete' && (
                            <div className="mt-4 text-center">
                              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">Importação Concluída</h3>
                              <div className="mt-2 border border-gray-200 rounded-md p-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-500">Total de arquivos:</span>
                                  <span className="font-medium">15</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                  <span className="text-gray-500">Documentos importados:</span>
                                  <span className="font-medium text-green-600">13</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                  <span className="text-gray-500">Com advertências:</span>
                                  <span className="font-medium text-amber-600">2</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                  <span className="text-gray-500">Com erros:</span>
                                  <span className="font-medium text-red-600">0</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {processingStep === 'complete' ? (
                  <button
                    type="button"
                    onClick={() => setImportModalOpen(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Concluir
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={processingStep !== ''}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      processingStep ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Iniciar Importação
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    processingStep && processingStep !== 'complete' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={Boolean(processingStep && processingStep !== 'complete')}
                >
                  <X className="h-4 w-4 mr-1" />
                  {processingStep === 'complete' ? 'Fechar' : 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalIntegration;
