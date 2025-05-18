import React, { useState } from 'react';
import { FileDigit, Plus, Search, Filter, ArrowUpDown, Download, FileUp, Printer, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import { mockFiscalDocuments } from '../../data/mockAccountingData';

const NFeManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [sortField, setSortField] = useState<string>('issueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  
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
                        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (doc.accessKey && doc.accessKey.includes(searchTerm));
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
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
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Toggle document selection
  const toggleDocumentSelection = (id: string) => {
    if (selectedDocument === id) {
      setSelectedDocument(null);
    } else {
      setSelectedDocument(id);
    }
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FileDigit className="h-6 w-6 mr-2 text-gray-700" />
          Emissão e Gestão de NFe
        </h1>
        
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="day">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {}}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova NFe
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Total de NFes</div>
            <div className="mt-1 text-xl font-semibold text-gray-900">
              {mockFiscalDocuments.length}
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
            <FileDigit className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Emitidas</div>
            <div className="mt-1 text-xl font-semibold text-green-600">
              {mockFiscalDocuments.filter(doc => doc.status === 'issued').length}
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Pendentes</div>
            <div className="mt-1 text-xl font-semibold text-yellow-600">
              {mockFiscalDocuments.filter(doc => doc.status === 'pending').length}
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center bg-yellow-100 rounded-full">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">Canceladas</div>
            <div className="mt-1 text-xl font-semibold text-red-600">
              {mockFiscalDocuments.filter(doc => doc.status === 'cancelled' || doc.status === 'denied').length}
            </div>
          </div>
          <div className="h-10 w-10 flex items-center justify-center bg-red-100 rounded-full">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </div>
      
      {/* Documents Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Documentos Fiscais Eletrônicos
            </h3>
            
            <div className="mt-3 sm:mt-0 flex flex-wrap space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nº, chave ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="nfe">NFe</option>
                  <option value="nfce">NFCe</option>
                  <option value="cte">CTe</option>
                  <option value="mdfe">MDFe</option>
                  <option value="nfse">NFSe</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="issued">Emitidos</option>
                  <option value="pending">Pendentes</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="denied">Negados</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    Emissão
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
                <tr 
                  key={document.id} 
                  className={`hover:bg-gray-50 ${selectedDocument === document.id ? 'bg-blue-50' : ''}`}
                  onClick={() => toggleDocumentSelection(document.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {document.type.toUpperCase()} {document.number}
                    </div>
                    <div className="text-xs text-gray-500">Série: {document.serie}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(document.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{document.customerName}</div>
                    <div className="text-xs text-gray-500">{document.customerDocument}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(document.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(document.status)}`}>
                      {document.status === 'issued' 
                        ? 'Emitida' 
                        : document.status === 'pending'
                          ? 'Pendente'
                          : document.status === 'cancelled'
                            ? 'Cancelada'
                            : 'Negada'}
                    </span>
                    
                    {document.status === 'cancelled' && document.cancelProtocol && (
                      <div className="text-xs text-gray-500 mt-1">
                        Protocolo Cancelamento: {document.cancelProtocol.substring(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-green-600 hover:text-green-900" title="Baixar XML">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900" title="Visualizar DANFE">
                        <FileUp className="h-5 w-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Imprimir">
                        <Printer className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedDocuments.length === 0 && (
            <div className="text-center py-10">
              <FileDigit className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar sua pesquisa ou filtros.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                  Emitir Nova NFe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Document Details */}
      {selectedDocument && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Detalhes do Documento
            </h3>
          </div>
          
          {(() => {
            const document = mockFiscalDocuments.find(doc => doc.id === selectedDocument);
            
            if (!document) {
              return <div className="px-4 py-5 sm:p-6 text-center text-gray-500">Documento não encontrado</div>;
            }
            
            return (
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Tipo/Número/Série</div>
                    <div className="text-sm font-medium text-gray-900">
                      {document.type.toUpperCase()} {document.number}/{document.serie}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Chave de Acesso</div>
                    <div className="text-sm font-medium text-gray-900">
                      {document.accessKey || 'Não disponível'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">Protocolo de Autorização</div>
                    <div className="text-sm font-medium text-gray-900">
                      {document.protocol || 'Não disponível'}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-200 py-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Cliente</div>
                      <div className="text-sm font-medium text-gray-900">
                        {document.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {document.customerDocument}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Data de Emissão</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(document.issueDate)} {document.issueDate.toLocaleTimeString()}
                      </div>
                      {document.status === 'cancelled' && document.cancelledAt && (
                        <div className="text-sm text-red-600">
                          Cancelada em: {formatDate(document.cancelledAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Itens do Documento
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descrição
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qtd
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor Unitário
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {document.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.productCode}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Informações Fiscais
                    </h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-gray-500">Base ICMS:</div>
                          <div className="font-medium">{formatCurrency(document.items.reduce((sum, item) => sum + (item.icmsBaseValue || 0), 0))}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Valor ICMS:</div>
                          <div className="font-medium">{formatCurrency(document.items.reduce((sum, item) => sum + (item.icmsValue || 0), 0))}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Base PIS/COFINS:</div>
                          <div className="font-medium">{formatCurrency(document.items.reduce((sum, item) => sum + (item.pisBaseValue || 0), 0))}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">PIS/COFINS:</div>
                          <div className="font-medium">{formatCurrency(
                            document.items.reduce((sum, item) => sum + (item.pisValue || 0) + (item.cofinsValue || 0), 0)
                          )}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Totais
                    </h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Valor Produtos:</span>
                          <span className="font-medium">{formatCurrency(document.totalAmount - document.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Valor Impostos:</span>
                          <span className="font-medium">{formatCurrency(document.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-1 border-t border-gray-200">
                          <span>Valor Total:</span>
                          <span className="text-blue-600">{formatCurrency(document.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap justify-end space-x-3">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Download className="h-4 w-4 mr-1" />
                    XML
                  </button>
                  
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Printer className="h-4 w-4 mr-1" />
                    DANFe
                  </button>
                  
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <FileUp className="h-4 w-4 mr-1" />
                    Visualizar
                  </button>
                  
                  {document.status === 'issued' && (
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
export default NFeManagement;
