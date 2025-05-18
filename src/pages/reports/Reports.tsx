import React, { useState } from 'react';
import { BarChart2, Calendar, TrendingUp, FileText, Download, Printer, Filter, RefreshCw, Search, Clock, Eye, Plus } from 'lucide-react';
import { mockDailySales, mockProductSales } from '../../data/mockData';
import { reportTypes } from './ReportsConfig';
import { ReportViewer } from './ReportViewer';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ReportScheduleForm } from './ReportScheduleForm';
import { ReportParameters } from '../../types/reports';
import toast from 'react-hot-toast';
import { ReportConfig } from './ReportsConfig';
import { 
  generateBalanceSheet, 
  generateIncomeStatement,
  generateCashFlowStatement,
  generateTrialBalance,
  exportPDF 
} from '../../services/pdfService';
import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
import ProductivityPage from './ProductivityPage';

// Lazy load sub-pages
const SalesReport = lazy(() => import('./SalesReport'));
const InventoryReport = lazy(() => import('./InventoryReport'));
const ProductionReport = lazy(() => import('./ProductionReport'));
const FinancialReport = lazy(() => import('./FinancialReport'));
const CustomReport = lazy(() => import('./CustomReport'));

const Reports: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showConfigPage, setShowConfigPage] = useState(false);
  
  // Helper to format dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Generate dummy data for demo charts
  const salesData = mockDailySales;
  const productData = mockProductSales;
  
  // Find highest values for scaling
  const maxSales = Math.max(...salesData.map(d => d.total));
  const maxRevenue = Math.max(...productData.map(p => p.revenue));
  
  // Filter report types by category and search term
  const filteredReports = reportTypes.filter(report => {
    const matchesCategory = activeCategory === 'all' || report.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
                         report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const generateReport = (reportId: string) => {
    setIsLoading(true);
    setSelectedReportId(reportId);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowReportViewer(true);
    }, 1500);
  };
  
  const scheduleReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowScheduleForm(true);
  };
  
  const handleSaveSchedule = (parameters: ReportParameters) => {
    // In a real app, this would be an API call
    console.log('Schedule saved:', { reportId: selectedReportId, parameters });
    toast.success('Relatório agendado com sucesso!');
    setShowScheduleForm(false);
  };
  
  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    setIsLoading(true);
    
    try {
      if (format !== 'pdf') {
        toast.error(`Exportação em formato ${format.toUpperCase()} em desenvolvimento.`);
        setIsLoading(false);
        return;
      }
      
      let doc;
      let filename;
      
      switch (selectedReportId) {
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
          setIsLoading(false);
          return;
      }
      
      // Export the PDF
      exportPDF(doc, filename);
      toast.success(`Relatório exportado com sucesso como ${filename}`);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar o relatório PDF');
    } finally {
      setIsLoading(false);
    }
  };
  
  const printReport = () => {
    toast.success('Enviando relatório para impressão...');
    setTimeout(() => {
      window.print();
    }, 1000);
  };
  
  if (showConfigPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Configuração de Relatórios</h1>
          <Button
            variant="outline"
            onClick={() => setShowConfigPage(false)}
          >
            Voltar para Relatórios
          </Button>
        </div>
        
        <ReportConfig />
      </div>
    );
  }
  
  return (
    <Routes>
      <Route index element={<SalesReport />} />
      <Route path="inventory" element={<InventoryReport />} />
      <Route path="production" element={<ProductionReport />} />
      <Route path="productivity" element={<ProductivityPage />} />
      <Route path="financial" element={<FinancialReport />} />
      <Route path="custom" element={<CustomReport />} />
    </Routes>
  );
};

export default Reports;
