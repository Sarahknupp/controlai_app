import React, { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { 
  generateBalanceSheet, 
  generateIncomeStatement, 
  generateCashFlowStatement, 
  generateTrialBalance,
  exportPDF
} from '../../services/pdfService';

interface ReportExportButtonProps {
  reportId: string;
  reportName: string;
  format: 'pdf' | 'excel' | 'csv';
  parameters?: Record<string, any>;
  onExportStart?: () => void;
  onExportComplete?: (url: string) => void;
  onExportError?: (error: string) => void;
}

export const ReportExportButton: React.FC<ReportExportButtonProps> = ({
  reportId,
  reportName,
  format,
  parameters,
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    onExportStart?.();
    
    try {
      if (format !== 'pdf') {
        throw new Error(`Exportação em formato ${format.toUpperCase()} ainda não implementada.`);
      }
      
      // Get date range from parameters or use default
      const dateRange = parameters?.dateRange || 'month';
      
      let doc;
      let filename;
      
      // Generate the appropriate report based on reportId
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
          throw new Error('Tipo de relatório não suportado');
      }
      
      // Export the PDF
      exportPDF(doc, filename);
      
      toast.success(`Relatório exportado com sucesso em formato ${format.toUpperCase()}`);
      onExportComplete?.(filename);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao exportar relatório: ${errorMessage}`);
      onExportError?.(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className={format === 'pdf' ? 'text-red-700 hover:bg-red-50' :
                format === 'excel' ? 'text-green-700 hover:bg-green-50' :
                'text-blue-700 hover:bg-blue-50'}
    >
      {isExporting ? (
        <>
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          {format.toUpperCase()}
        </>
      )}
    </Button>
  );
};