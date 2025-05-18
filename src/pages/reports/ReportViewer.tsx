import React, { useEffect, useState } from 'react';
import { BarChart2, PieChart, Download, Printer, BarChart } from 'lucide-react';
import { ReportExportButton } from '../../components/reports/ReportExportButton';
import { generateBalanceSheet, generateIncomeStatement, generateCashFlowStatement, generateTrialBalance, exportPDF } from '../../services/pdfService';
import toast from 'react-hot-toast';

interface ReportViewerProps {
  reportId: string;
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ reportId, dateRange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Function to generate and export a report
  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    if (format !== 'pdf') {
      toast.error(`Exportação em formato ${format.toUpperCase()} ainda não implementada.`);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      let doc;
      let filename;
      
      switch (reportId) {
        case 'balanco':
          doc = generateBalanceSheet(null, dateRange);
          filename = `balanco_patrimonial_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        case 'dre':
          doc = generateIncomeStatement(null, dateRange);
          filename = `demonstracao_resultado_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        case 'fluxo_caixa':
          doc = generateCashFlowStatement(null, dateRange);
          filename = `fluxo_caixa_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        case 'balancete':
          doc = generateTrialBalance(null, dateRange);
          filename = `balancete_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        default:
          toast.error('Tipo de relatório não suportado');
          setIsGenerating(false);
          return;
      }
      
      // Export the PDF
      exportPDF(doc, filename);
      toast.success(`Relatório exportado com sucesso como ${filename}`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar o relatório PDF');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderReport = () => {
    switch (reportId) {
      case 'balanco':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-amber-600" />
                  Balanço Patrimonial
                </h3>
                <div className="flex space-x-2">
                  <ReportExportButton 
                    reportId="balanco"
                    reportName="Balanço Patrimonial"
                    format="pdf"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                  <ReportExportButton 
                    reportId="balanco"
                    reportName="Balanço Patrimonial"
                    format="excel"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">ATIVO</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 1.030.000,00</div>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">PASSIVO</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 450.000,00</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">PATRIMÔNIO LÍQUIDO</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 580.000,00</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Composição do Ativo</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ativo Circulante</span>
                      <span className="font-medium">R$ 470.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Realizável a Longo Prazo</span>
                      <span className="font-medium">R$ 50.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "5%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Investimentos</span>
                      <span className="font-medium">R$ 100.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Imobilizado</span>
                      <span className="font-medium">R$ 380.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: "37%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Intangível</span>
                      <span className="font-medium">R$ 30.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-300 h-2.5 rounded-full" style={{ width: "3%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Composição do Passivo e PL</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Passivo Circulante</span>
                      <span className="font-medium">R$ 220.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-red-600 h-2.5 rounded-full" style={{ width: "21%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Passivo Não Circulante</span>
                      <span className="font-medium">R$ 230.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "22%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capital Social</span>
                      <span className="font-medium">R$ 300.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "29%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reservas</span>
                      <span className="font-medium">R$ 130.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "13%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lucros Acumulados</span>
                      <span className="font-medium">R$ 150.000,00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-green-400 h-2.5 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="text-amber-600 hover:text-amber-800 flex items-center"
                onClick={() => handleExportReport('pdf')}
                disabled={isGenerating}
              >
                {isGenerating ? 
                  'Gerando PDF...' :
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Baixar relatório completo (PDF)
                  </>
                }
              </button>
            </div>
          </div>
        );
        
      case 'dre':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-amber-600" />
                  Demonstração do Resultado do Exercício
                </h3>
                <div className="flex space-x-2">
                  <ReportExportButton 
                    reportId="dre"
                    reportName="Demonstração do Resultado"
                    format="pdf"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                  <ReportExportButton 
                    reportId="dre"
                    reportName="Demonstração do Resultado"
                    format="excel"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">RECEITA BRUTA</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 1.200.000,00</div>
                  <div className="text-sm text-green-600 mt-1">↑ 12% desde último período</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">LUCRO BRUTO</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 1.080.000,00</div>
                  <div className="text-sm text-green-600 mt-1">↑ 14% desde último período</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">LUCRO LÍQUIDO</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 165.000,00</div>
                  <div className="text-sm text-green-600 mt-1">↑ 9% desde último período</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Demonstração do Resultado</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-800 font-medium">RECEITA BRUTA DE VENDAS</span>
                    <span className="font-medium">R$ 1.200.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Deduções de Vendas</span>
                    <span className="text-gray-600">-R$ 120.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-800 font-medium">RECEITA LÍQUIDA</span>
                    <span className="font-medium">R$ 1.080.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-800 font-medium">LUCRO BRUTO</span>
                    <span className="font-medium">R$ 1.080.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Despesas de Pessoal</span>
                    <span className="text-gray-600">-R$ 320.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Despesas Administrativas</span>
                    <span className="text-gray-600">-R$ 180.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Despesas com Vendas</span>
                    <span className="text-gray-600">-R$ 220.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Depreciação</span>
                    <span className="text-gray-600">-R$ 60.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-800 font-medium">RESULTADO OPERACIONAL</span>
                    <span className="font-medium">R$ 300.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">Receitas Financeiras</span>
                    <span className="text-gray-600">R$ 35.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Despesas Financeiras</span>
                    <span className="text-gray-600">-R$ 85.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-800 font-medium">RESULTADO ANTES DOS IMPOSTOS</span>
                    <span className="font-medium">R$ 250.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Imposto de Renda</span>
                    <span className="text-gray-600">-R$ 62.500,00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 pl-4">
                    <span className="text-gray-600">(-) Contribuição Social</span>
                    <span className="text-gray-600">-R$ 22.500,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-amber-50 px-2 rounded font-medium text-amber-800">
                    <span>LUCRO LÍQUIDO DO EXERCÍCIO</span>
                    <span>R$ 165.000,00</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Margem de Lucro</h3>
                <div className="flex flex-col space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Margem Bruta</span>
                      <span className="text-sm font-medium text-gray-900">90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Margem Operacional</span>
                      <span className="text-sm font-medium text-gray-900">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Margem Líquida</span>
                      <span className="text-sm font-medium text-gray-900">13.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: "13.8%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Comparativo com Média do Setor</h4>
                  <div className="h-60 flex items-end space-x-16 justify-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-amber-500 w-24 h-48" style={{ height: `${13.8*2}%` }}></div>
                      <div className="mt-2 text-sm font-medium">Empresa</div>
                      <div className="text-xs text-gray-500">13.8%</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-400 w-24 h-48" style={{ height: "18%" }}></div>
                      <div className="mt-2 text-sm font-medium">Setor</div>
                      <div className="text-xs text-gray-500">9%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="text-amber-600 hover:text-amber-800 flex items-center"
                onClick={() => handleExportReport('pdf')}
                disabled={isGenerating}
              >
                {isGenerating ? 
                  'Gerando PDF...' :
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Baixar relatório completo (PDF)
                  </>
                }
              </button>
            </div>
          </div>
        );
        
      case 'fluxo_caixa':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-amber-600" />
                  Fluxo de Caixa
                </h3>
                <div className="flex space-x-2">
                  <ReportExportButton 
                    reportId="fluxo_caixa"
                    reportName="Fluxo de Caixa"
                    format="pdf"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                  <ReportExportButton 
                    reportId="fluxo_caixa"
                    reportName="Fluxo de Caixa"
                    format="excel"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">OPERACIONAL</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 80.000,00</div>
                  <div className="text-sm text-green-600 mt-1">↑ 5% desde último período</div>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">INVESTIMENTO</div>
                  <div className="text-2xl font-bold text-gray-900">-R$ 43.000,00</div>
                  <div className="text-sm text-red-600 mt-1">↑ 12% desde último período</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm font-medium text-gray-500">FINANCIAMENTO</div>
                  <div className="text-2xl font-bold text-gray-900">R$ 35.000,00</div>
                  <div className="text-sm text-blue-600 mt-1">↓ 10% desde último período</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Demonstração dos Fluxos de Caixa</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 border-b pb-2">FLUXOS DE CAIXA DAS ATIVIDADES OPERACIONAIS</h4>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium pl-2 mt-2">Entradas:</div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Recebimentos de Clientes</span>
                      <span>R$ 1.180.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Outros Recebimentos Operacionais</span>
                      <span>R$ 25.000,00</span>
                    </div>
                    
                    <div className="text-sm font-medium pl-2 mt-2">Saídas:</div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Pagamentos a Fornecedores</span>
                      <span>-R$ 620.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Pagamentos a Funcionários</span>
                      <span>-R$ 305.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Impostos Pagos</span>
                      <span>-R$ 130.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Outros Pagamentos Operacionais</span>
                      <span>-R$ 70.000,00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 mt-2 border-t">
                    <span className="font-medium">Fluxo de Caixa Líquido das Atividades Operacionais</span>
                    <span className="font-medium text-green-600">R$ 80.000,00</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 border-b pb-2">FLUXOS DE CAIXA DAS ATIVIDADES DE INVESTIMENTO</h4>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium pl-2 mt-2">Entradas:</div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Venda de Ativos</span>
                      <span>R$ 5.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Dividendos Recebidos</span>
                      <span>R$ 2.000,00</span>
                    </div>
                    
                    <div className="text-sm font-medium pl-2 mt-2">Saídas:</div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Compra de Imobilizado</span>
                      <span>-R$ 35.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Aquisição de Investimentos</span>
                      <span>-R$ 15.000,00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 mt-2 border-t">
                    <span className="font-medium">Fluxo de Caixa Líquido das Atividades de Investimento</span>
                    <span className="font-medium text-red-600">-R$ 43.000,00</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 border-b pb-2">FLUXOS DE CAIXA DAS ATIVIDADES DE FINANCIAMENTO</h4>
                  <div className="mt-2 space-y-1">
                    <div className="text-sm font-medium pl-2 mt-2">Entradas:</div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Empréstimos Obtidos</span>
                      <span>R$ 100.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Integralização de Capital</span>
                      <span>R$ 0,00</span>
                    </div>
                    
                    <div className="text-sm font-medium pl-2 mt-2">Saídas:</div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Pagamento de Empréstimos</span>
                      <span>-R$ 45.000,00</span>
                    </div>
                    <div className="flex justify-between items-center py-1 pl-6">
                      <span className="text-gray-600">Dividendos Pagos</span>
                      <span>-R$ 20.000,00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 mt-2 border-t">
                    <span className="font-medium">Fluxo de Caixa Líquido das Atividades de Financiamento</span>
                    <span className="font-medium text-blue-600">R$ 35.000,00</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">AUMENTO/REDUÇÃO LÍQUIDO DE CAIXA E EQUIVALENTES</span>
                    <span className="font-medium">R$ 72.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-amber-200 mt-2">
                    <span>Caixa e Equivalentes no Início do Período</span>
                    <span>R$ 128.000,00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Caixa e Equivalentes no Final do Período</span>
                    <span>R$ 200.000,00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="text-amber-600 hover:text-amber-800 flex items-center"
                onClick={() => handleExportReport('pdf')}
                disabled={isGenerating}
              >
                {isGenerating ? 
                  'Gerando PDF...' :
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Baixar relatório completo (PDF)
                  </>
                }
              </button>
            </div>
          </div>
        );
        
      case 'balancete':
        return (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-amber-600" />
                  Balancete de Verificação
                </h3>
                <div className="flex space-x-2">
                  <ReportExportButton 
                    reportId="balancete"
                    reportName="Balancete"
                    format="pdf"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                  <ReportExportButton 
                    reportId="balancete"
                    reportName="Balancete"
                    format="excel"
                    onExportStart={() => setIsGenerating(true)}
                    onExportComplete={() => setIsGenerating(false)}
                    onExportError={() => setIsGenerating(false)}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Resumo do Balancete</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Total de Débitos</div>
                    <div className="font-semibold text-gray-900">R$ 2.440.000,00</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total de Créditos</div>
                    <div className="font-semibold text-gray-900">R$ 2.440.000,00</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Débito (R$)</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Crédito (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    <tr className="bg-gray-100 font-medium">
                      <td className="px-6 py-2">1</td>
                      <td className="px-6 py-2">ATIVO</td>
                      <td className="px-6 py-2 text-right"></td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">1.1</td>
                      <td className="px-6 py-2 font-medium">ATIVO CIRCULANTE</td>
                      <td className="px-6 py-2 text-right"></td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">1.1.1</td>
                      <td className="px-6 py-2 pl-8">Caixa</td>
                      <td className="px-6 py-2 text-right">15.000,00</td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">1.1.2</td>
                      <td className="px-6 py-2 pl-8">Bancos</td>
                      <td className="px-6 py-2 text-right">85.000,00</td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    
                    {/* Truncated for brevity - full table would be available in PDF */}
                    <tr>
                      <td className="px-6 py-2">1.1.3</td>
                      <td className="px-6 py-2 pl-8">Aplicações Financeiras</td>
                      <td className="px-6 py-2 text-right">50.000,00</td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">1.1.4</td>
                      <td className="px-6 py-2 pl-8">Contas a Receber</td>
                      <td className="px-6 py-2 text-right">120.000,00</td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    
                    <tr className="bg-gray-100 font-medium">
                      <td className="px-6 py-2">2</td>
                      <td className="px-6 py-2">PASSIVO</td>
                      <td className="px-6 py-2 text-right"></td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">2.1</td>
                      <td className="px-6 py-2 font-medium">PASSIVO CIRCULANTE</td>
                      <td className="px-6 py-2 text-right"></td>
                      <td className="px-6 py-2 text-right"></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-2">2.1.1</td>
                      <td className="px-6 py-2 pl-8">Fornecedores</td>
                      <td className="px-6 py-2 text-right"></td>
                      <td className="px-6 py-2 text-right">95.000,00</td>
                    </tr>
                    
                    {/* More rows would be here */}
                    
                    <tr className="bg-gray-100 font-medium border-t-2 border-t-gray-400">
                      <td className="px-6 py-3" colSpan={2}>TOTAIS</td>
                      <td className="px-6 py-3 text-right font-bold">2.440.000,00</td>
                      <td className="px-6 py-3 text-right font-bold">2.440.000,00</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-green-600 font-medium" colSpan={4}>
                        Verificação de Débito = Crédito: CORRETO
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="text-amber-600 hover:text-amber-800 flex items-center"
                onClick={() => handleExportReport('pdf')}
                disabled={isGenerating}
              >
                {isGenerating ? 
                  'Gerando PDF...' :
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Baixar relatório completo (PDF)
                  </>
                }
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BarChart2 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Selecione um relatório</h3>
            <p className="mt-2 text-gray-500 text-center max-w-md">
              Por favor, selecione um relatório para visualizar ou configure um novo relatório personalizado.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      {renderReport()}
    </div>
  );
};