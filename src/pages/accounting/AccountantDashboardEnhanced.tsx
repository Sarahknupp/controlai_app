import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  BarChart2, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Activity, 
  Clock, 
  ChevronRight,
  Database,
  Upload,
  BookOpen,
  FilePlus,
  Layers,
  RefreshCw
} from 'lucide-react';
import { mockAccountingReports } from '../../data/mockAccountingData';
import { getTaxObligationSummary, getDocumentSummary } from '../../data/mockAccountingData';
import { Button } from '../../components/ui/button';

export const AccountantDashboardEnhanced: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('month');
  const companyId = '1'; // Default company for demo
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'fiscal'>('overview');
  
  const taxObligationSummary = getTaxObligationSummary(companyId);
  const documentSummary = getDocumentSummary(companyId);
  
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
  
  // Mock financial data for charts
  const financialData = {
    assets: 450000,
    liabilities: 180000,
    equity: 270000,
    revenue: 80000,
    expenses: 65000,
    profit: 15000,
    lastMonthProfit: 12000,
    lastYearRevenue: 70000,
    lastYearExpenses: 60000,
    cashFlow: {
      operational: 25000,
      investment: -10000,
      financing: 5000
    },
    revenueByCategory: [
      { name: 'Vendas de Produtos', value: 65000 },
      { name: 'Serviços', value: 12000 },
      { name: 'Outras Receitas', value: 3000 },
    ],
    expenseByCategory: [
      { name: 'Custo dos Produtos', value: 35000 },
      { name: 'Despesas Administrativas', value: 15000 },
      { name: 'Despesas com Pessoal', value: 10000 },
      { name: 'Despesas Financeiras', value: 5000 },
    ],
  };
  
  // Find all reports for this company
  const companyReports = mockAccountingReports.filter(report => report.companyId === companyId);

  // Funções para ações específicas do contador
  const handleGenerateReport = (type: string) => {
    console.log(`Gerando relatório: ${type}`);
    // Simulação de geração de relatório
    toast.success(`Relatório de ${type} gerado com sucesso!`);
  };

  const handleExportData = (format: string) => {
    console.log(`Exportando dados em formato ${format}`);
    // Simulação de exportação
    toast.success(`Dados exportados em formato ${format}`);
  };

  const handleFiscalIntegration = () => {
    console.log('Iniciando integração fiscal');
    // Simulação de integração
    toast.success('Integração fiscal iniciada com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-gray-700" />
          Painel do Contador
        </h1>
        
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => handleExportData('excel')}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relatórios Contábeis
            </button>
            <button
              onClick={() => setActiveTab('fiscal')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'fiscal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Integração Fiscal
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="text-sm font-medium text-green-800">Documentos Emitidos</h4>
                </div>
                <div className="mt-2 flex justify-between items-baseline">
                  <div className="text-2xl font-semibold text-green-900">
                    {documentSummary.issuedDocuments}
                  </div>
                  <div className="text-sm text-green-600">
                    <div className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>5.2% mês</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <h4 className="text-sm font-medium text-amber-800">Obrigações Pendentes</h4>
                </div>
                <div className="mt-2 flex justify-between items-baseline">
                  <div className="text-2xl font-semibold text-amber-900">
                    {taxObligationSummary.pendingObligations}
                  </div>
                  <div className="text-sm text-amber-800">
                    {formatCurrency(taxObligationSummary.totalDue)}
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-md p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="text-sm font-medium text-red-800">Obrigações Atrasadas</h4>
                </div>
                <div className="mt-2 flex justify-between items-baseline">
                  <div className="text-2xl font-semibold text-red-900">
                    {taxObligationSummary.lateObligations}
                  </div>
                  <div className="text-sm text-red-600">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Ação Urgente</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-md p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="text-sm font-medium text-blue-800">Resultado Mensal</h4>
                </div>
                <div className="mt-2 flex justify-between items-baseline">
                  <div className="text-2xl font-semibold text-blue-900">
                    {formatCurrency(financialData.profit)}
                  </div>
                  <div className="text-sm text-blue-600">
                    <div className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>25% mês</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Overview */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Balance Sheet Summary */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-gray-500" />
                    Balanço Patrimonial
                  </h3>
                  <button
                    onClick={() => {}}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Ver detalhes
                  </button>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-100">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">ATIVO</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(financialData.assets)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">PASSIVO</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(financialData.liabilities)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">PATRIMÔNIO LÍQUIDO</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(financialData.equity)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">COMPOSIÇÃO DO ATIVO</span>
                        <span className="text-xs text-gray-500">100%</span>
                      </div>
                      <div className="w-full flex h-4 rounded-full overflow-hidden bg-gray-100">
                        <div className="bg-blue-600 h-full" style={{ width: '45%' }}></div>
                        <div className="bg-blue-400 h-full" style={{ width: '30%' }}></div>
                        <div className="bg-blue-300 h-full" style={{ width: '25%' }}></div>
                      </div>
                      <div className="mt-1 flex text-xs justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></div>
                          <span>Circulante 45%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
                          <span>Realizável a Longo Prazo 30%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-300 rounded-sm mr-1"></div>
                          <span>Permanente 25%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">COMPOSIÇÃO DO PASSIVO + PL</span>
                        <span className="text-xs text-gray-500">100%</span>
                      </div>
                      <div className="w-full flex h-4 rounded-full overflow-hidden bg-gray-100">
                        <div className="bg-red-500 h-full" style={{ width: '30%' }}></div>
                        <div className="bg-red-300 h-full" style={{ width: '10%' }}></div>
                        <div className="bg-green-500 h-full" style={{ width: '60%' }}></div>
                      </div>
                      <div className="mt-1 flex text-xs justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
                          <span>Circulante 30%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-300 rounded-sm mr-1"></div>
                          <span>Não Circulante 10%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
                          <span>Patrimônio Líquido 60%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Income Statement */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-gray-500" />
                    Demonstração de Resultado
                  </h3>
                  <button
                    onClick={() => {}}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Ver detalhes
                  </button>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-100">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">RECEITA</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(financialData.revenue)}</div>
                        <div className="text-xs text-green-600 flex justify-center items-center mt-1">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          {Math.round((financialData.revenue / financialData.lastYearRevenue - 1) * 100)}% ano
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">DESPESAS</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(financialData.expenses)}</div>
                        <div className="text-xs text-red-600 flex justify-center items-center mt-1">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          {Math.round((financialData.expenses / financialData.lastYearExpenses - 1) * 100)}% ano
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">LUCRO</div>
                        <div className="text-xl font-bold text-green-600">{formatCurrency(financialData.profit)}</div>
                        <div className="text-xs text-green-600 flex justify-center items-center mt-1">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          {Math.round((financialData.profit / financialData.lastMonthProfit - 1) * 100)}% mês
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">RECEITAS POR CATEGORIA</span>
                        <span className="text-xs text-gray-500">100%</span>
                      </div>
                      {financialData.revenueByCategory.map((category, index) => {
                        const percentage = Math.round((category.value / financialData.revenue) * 100);
                        const colors = ['bg-blue-600', 'bg-blue-500', 'bg-blue-400'];
                        
                        return (
                          <div key={index} className="mb-2">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-sm mr-1`}></div>
                                <span>{category.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">{formatCurrency(category.value)}</span>
                                <span>{percentage}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`${colors[index % colors.length]} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Relatórios Contábeis</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Button 
                onClick={() => handleGenerateReport('balanco')}
                className="flex flex-col items-center justify-center h-32 bg-blue-50 border-2 border-blue-100 text-blue-700 rounded-lg shadow-sm hover:bg-blue-100"
              >
                <BookOpen className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Balanço Patrimonial</span>
              </Button>

              <Button 
                onClick={() => handleGenerateReport('dre')}
                className="flex flex-col items-center justify-center h-32 bg-green-50 border-2 border-green-100 text-green-700 rounded-lg shadow-sm hover:bg-green-100"
              >
                <BarChart2 className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Demonstração de Resultado</span>
              </Button>

              <Button 
                onClick={() => handleGenerateReport('fluxo')}
                className="flex flex-col items-center justify-center h-32 bg-amber-50 border-2 border-amber-100 text-amber-700 rounded-lg shadow-sm hover:bg-amber-100"
              >
                <Activity className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Fluxo de Caixa</span>
              </Button>

              <Button 
                onClick={() => handleGenerateReport('balancete')}
                className="flex flex-col items-center justify-center h-32 bg-purple-50 border-2 border-purple-100 text-purple-700 rounded-lg shadow-sm hover:bg-purple-100"
              >
                <Layers className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Balancete</span>
              </Button>

              <Button 
                onClick={() => handleGenerateReport('diario')}
                className="flex flex-col items-center justify-center h-32 bg-indigo-50 border-2 border-indigo-100 text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-100"
              >
                <FileText className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Livro Diário</span>
              </Button>

              <Button 
                onClick={() => handleGenerateReport('razao')}
                className="flex flex-col items-center justify-center h-32 bg-red-50 border-2 border-red-100 text-red-700 rounded-lg shadow-sm hover:bg-red-100"
              >
                <FilePlus className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">Livro Razão</span>
              </Button>
            </div>
            
            <h3 className="text-md font-semibold text-gray-700 mb-4">Relatórios Recentes</h3>
            
            <div className="bg-white shadow overflow-hidden rounded-md">
              <ul className="divide-y divide-gray-200">
                {companyReports.length > 0 ? (
                  companyReports.map((report) => (
                    <li key={report.id} className="px-4 py-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                        <div className="text-xs text-gray-500">
                          Gerado em: {formatDate(report.generationDate)}
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'generated' 
                            ? 'bg-green-100 text-green-800' 
                            : report.status === 'generating' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status === 'generated' 
                            ? 'Concluído' 
                            : report.status === 'generating' 
                              ? 'Gerando' 
                              : 'Erro'}
                        </span>
                        
                        {report.status === 'generated' && report.filePath && (
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Download Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-4 text-gray-500">
                    Nenhum relatório gerado recentemente.
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData('csv')}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData('xlsx')}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportData('pdf')}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fiscal' && (
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Integração Fiscal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <div className="p-5 bg-purple-50 border-b border-purple-100 flex items-center">
                  <Database className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Importar XML</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4">
                    Importe notas fiscais em XML diretamente para o sistema.
                  </p>
                  <Button 
                    onClick={handleFiscalIntegration}
                    className="w-full flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Importar XMLs
                  </Button>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <div className="p-5 bg-blue-50 border-b border-blue-100 flex items-center">
                  <FilePlus className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Gerar SPED</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4">
                    Gere arquivos SPED Fiscal, Contribuições ou ECD.
                  </p>
                  <Button 
                    onClick={() => {}}
                    className="w-full flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Gerar SPED
                  </Button>
                </div>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <div className="p-5 bg-green-50 border-b border-green-100 flex items-center">
                  <RefreshCw className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Sincronizar Dados</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4">
                    Sincronize dados com o sistema da contabilidade.
                  </p>
                  <Button 
                    onClick={() => {}}
                    className="w-full flex items-center justify-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sincronizar
                  </Button>
                </div>
              </div>
            </div>
            
            <h3 className="text-md font-semibold text-gray-700 mb-4">Próximas Obrigações Fiscais</h3>
            
            <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obrigação
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
                  {taxObligationSummary.nextDueDates.map((obligation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{obligation.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(obligation.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(obligation.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-900">
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {taxObligationSummary.nextDueDates.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Não há obrigações fiscais para o período selecionado.
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {}}
                className="flex items-center"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Ver Calendário Fiscal
              </Button>
              
              <Button
                onClick={() => {}}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar Dados Fiscais
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Import toast para feedback
import toast from 'react-hot-toast';