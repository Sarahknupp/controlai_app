import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Calendar, CheckCircle, AlertCircle, AlertTriangle, BarChart2, ArrowUp, ArrowDown, DollarSign, Activity, Clock, ChevronRight, FileUp, RefreshCw } from 'lucide-react';
import { mockAccountingReports } from '../../data/mockAccountingData';
import { getTaxObligationSummary, getDocumentSummary } from '../../data/mockAccountingData';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import toast from 'react-hot-toast';

export const AccountantDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('month');
  const companyId = '1'; // Default company for demo
  
  const taxObligationSummary = getTaxObligationSummary(companyId);
  const documentSummary = getDocumentSummary(companyId);
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState<{
    type: string;
    title: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('current_month');
  
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

  // Handle report generation
  const handleGenerateReport = (type: string, title: string) => {
    setCurrentReport({ type, title });
    setShowReportDialog(true);
  };

  // Handle report form submission
  const handleSubmitReport = () => {
    if (!currentReport) return;
    
    setIsGenerating(true);
    
    // Simulate API call to generate report
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`Relatório ${currentReport.title} gerado com sucesso!`);
      setShowReportDialog(false);
      
      // Simulate file download
      if (Math.random() > 0.5) {
        // PDF download
        const a = document.createElement('a');
        a.href = '#';
        a.download = `${currentReport.type}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
      } else {
        // Excel download
        const a = document.createElement('a');
        a.href = '#';
        a.download = `${currentReport.type}_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
      }
    }, 2000);
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
          
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </button>
          
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </button>
        </div>
      </div>
      
      {/* Compliance Status */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Status de Conformidade Fiscal
          </h3>
        </div>
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
        </div>
      </div>
      
      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet Summary */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-gray-500" />
              Balanço Patrimonial
            </h3>
            <button
              onClick={() => handleGenerateReport('balanco', 'Balanço Patrimonial')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Gerar Relatório
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
              onClick={() => handleGenerateReport('dre', 'Demonstração do Resultado do Exercício')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Gerar Relatório
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
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-500">DESPESAS POR CATEGORIA</span>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
                {financialData.expenseByCategory.map((category, index) => {
                  const percentage = Math.round((category.value / financialData.expenses) * 100);
                  const colors = ['bg-red-600', 'bg-red-500', 'bg-red-400', 'bg-red-300'];
                  
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
      
      {/* Cash Flow & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-gray-500" />
              Fluxo de Caixa
            </h3>
            <button
              onClick={() => handleGenerateReport('fluxo_caixa', 'Fluxo de Caixa')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Gerar Relatório
            </button>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-xs text-gray-500">OPERACIONAL</div>
                <div className={`text-lg font-semibold ${financialData.cashFlow.operational >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialData.cashFlow.operational)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">INVESTIMENTO</div>
                <div className={`text-lg font-semibold ${financialData.cashFlow.investment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialData.cashFlow.investment)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">FINANCIAMENTO</div>
                <div className={`text-lg font-semibold ${financialData.cashFlow.financing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialData.cashFlow.financing)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Saldo de Caixa Total</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(
                    financialData.cashFlow.operational + 
                    financialData.cashFlow.investment + 
                    financialData.cashFlow.financing
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Variação dos últimos 30 dias
              </div>
              
              {/* Simplified cash flow chart */}
              <div className="mt-3 h-20 flex items-end space-x-1">
                {[
                  15000, 18000, 14000, 17000, 20000, 19000, 22000, 21000, 
                  19000, 18000, 17000, 16000, 17000, 19000, 20000
                ].map((amount, index) => {
                  const height = Math.round((amount / 22000) * 100);
                  const colors = [
                    'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 
                    'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700'
                  ];
                  return (
                    <div 
                      key={index} 
                      className={`${colors[index % colors.length]} rounded-t`}
                      style={{ height: `${height}%`, width: `${100 / 15}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Balancete Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500" />
              Balancete
            </h3>
            <button
              onClick={() => handleGenerateReport('balancete', 'Balancete')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Gerar Relatório
            </button>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Resumo do Balancete</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Total de Débitos</div>
                    <div className="font-semibold">R$ 543.290,45</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total de Créditos</div>
                    <div className="font-semibold">R$ 543.290,45</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contas com Maior Movimentação</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Caixa e Equivalentes</span>
                      <span className="font-medium">R$ 125.345,78</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Estoques</span>
                      <span className="font-medium">R$ 87.932,15</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Fornecedores</span>
                      <span className="font-medium">R$ 56.789,23</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Report buttons grid */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="text-sm h-auto py-2"
                  onClick={() => handleGenerateReport('balanco', 'Balanço Patrimonial')}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Balanço Patrimonial
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-sm h-auto py-2"
                  onClick={() => handleGenerateReport('dre', 'DRE')}
                >
                  <BarChart2 className="h-4 w-4 mr-1" />
                  DRE
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-sm h-auto py-2"
                  onClick={() => handleGenerateReport('fluxo_caixa', 'Fluxo de Caixa')}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Fluxo de Caixa
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-sm h-auto py-2"
                  onClick={() => handleGenerateReport('balancete', 'Balancete')}
                >
                  <FileUp className="h-4 w-4 mr-1" />
                  Balancete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Gerar {currentReport?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="reportPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                Período do Relatório
              </label>
              <select
                id="reportPeriod"
                name="reportPeriod"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              >
                <option value="current_month">Mês Atual</option>
                <option value="previous_month">Mês Anterior</option>
                <option value="current_quarter">Trimestre Atual</option>
                <option value="previous_quarter">Trimestre Anterior</option>
                <option value="current_year">Ano Atual</option>
                <option value="previous_year">Ano Anterior</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>
            
            {reportPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Formato
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <input 
                    id="format-pdf"
                    name="format"
                    type="radio"
                    value="pdf"
                    defaultChecked
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                  />
                  <label htmlFor="format-pdf" className="ml-2 block text-sm text-gray-700">
                    PDF
                  </label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="format-excel"
                    name="format"
                    type="radio"
                    value="excel"
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                  />
                  <label htmlFor="format-excel" className="ml-2 block text-sm text-gray-700">
                    Excel
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="include-header"
                  name="include-header"
                  type="checkbox"
                  defaultChecked
                  className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="include-header" className="font-medium text-gray-700">
                  Incluir cabeçalho com dados da empresa
                </label>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="include-signature"
                  name="include-signature"
                  type="checkbox"
                  defaultChecked
                  className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="include-signature" className="font-medium text-gray-700">
                  Incluir assinatura digital do contador
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowReportDialog(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AccountantDashboard;
