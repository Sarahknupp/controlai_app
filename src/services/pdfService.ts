import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getDateRangeText } from '../utils/dateUtils';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Common settings for all financial reports
interface ReportOptions {
  title: string;
  dateRange: string;
  companyName?: string;
  companyLogo?: string;
  companyInfo?: {
    address?: string;
    phone?: string;
    email?: string;
    fiscal?: string;
  };
}

// Helper function to add header
const addReportHeader = (
  doc: jsPDF,
  options: ReportOptions
) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Company Logo (if provided)
  if (options.companyLogo) {
    try {
      doc.addImage(options.companyLogo, 'JPEG', 15, 15, 30, 30);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }
  
  // Company name - large and bold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(options.companyName || 'Empresa', options.companyLogo ? 55 : 15, 25);
  
  // Report title
  doc.setFontSize(16);
  doc.text(options.title, pageWidth / 2, 45, { align: 'center' });
  
  // Date range
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(options.dateRange, pageWidth / 2, 55, { align: 'center' });
  
  // Company info if provided
  if (options.companyInfo) {
    doc.setFontSize(10);
    let infoY = 25;
    if (options.companyInfo.address) {
      doc.text(options.companyInfo.address, pageWidth - 15, infoY, { align: 'right' });
      infoY += 5;
    }
    if (options.companyInfo.phone) {
      doc.text(`Tel: ${options.companyInfo.phone}`, pageWidth - 15, infoY, { align: 'right' });
      infoY += 5;
    }
    if (options.companyInfo.email) {
      doc.text(options.companyInfo.email, pageWidth - 15, infoY, { align: 'right' });
      infoY += 5;
    }
    if (options.companyInfo.fiscal) {
      doc.text(`CNPJ: ${options.companyInfo.fiscal}`, pageWidth - 15, infoY, { align: 'right' });
    }
  }
  
  // Add a separating line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 65, pageWidth - 15, 65);
  
  return 75; // Return the Y position where content should start
}

// Helper function to add footer
const addReportFooter = (
  doc: jsPDF
) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  const totalPages = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
    
    // Page number
    doc.setFontSize(10);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 15, pageHeight - 15, { align: 'right' });
    
    // Generated date
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);
    doc.text(`Gerado em: ${dateStr}`, 15, pageHeight - 15);
  }
}

// Format currency for display in reports
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Generate Balance Sheet (Balanço Patrimonial)
export const generateBalanceSheet = (
  data: any,
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year',
  options?: Partial<ReportOptions>
) => {
  const doc = new jsPDF();
  
  // Sample data if not provided (for demo)
  const reportData = data || {
    assets: {
      current: [
        { name: 'Caixa', value: 15000.0 },
        { name: 'Bancos', value: 85000.0 },
        { name: 'Contas a Receber', value: 120000.0 },
        { name: 'Estoques', value: 230000.0 },
        { name: 'Outros Ativos Circulantes', value: 20000.0 }
      ],
      nonCurrent: [
        { name: 'Realizável a Longo Prazo', value: 50000.0 },
        { name: 'Investimentos', value: 100000.0 },
        { name: 'Imobilizado', value: 350000.0 },
        { name: 'Intangível', value: 30000.0 }
      ]
    },
    liabilities: {
      current: [
        { name: 'Fornecedores', value: 95000.0 },
        { name: 'Empréstimos', value: 35000.0 },
        { name: 'Impostos a Pagar', value: 45000.0 },
        { name: 'Salários a Pagar', value: 30000.0 },
        { name: 'Outros Passivos Circulantes', value: 15000.0 }
      ],
      nonCurrent: [
        { name: 'Empréstimos de Longo Prazo', value: 180000.0 },
        { name: 'Provisões', value: 30000.0 },
        { name: 'Outros Passivos Não Circulantes', value: 20000.0 }
      ],
      equity: [
        { name: 'Capital Social', value: 300000.0 },
        { name: 'Reservas', value: 130000.0 },
        { name: 'Lucros Acumulados', value: 150000.0 }
      ]
    }
  };
  
  // Calculate totals
  const currentAssetsTotal = reportData.assets.current.reduce((sum: number, item: any) => sum + item.value, 0);
  const nonCurrentAssetsTotal = reportData.assets.nonCurrent.reduce((sum: number, item: any) => sum + item.value, 0);
  const totalAssets = currentAssetsTotal + nonCurrentAssetsTotal;
  
  const currentLiabilitiesTotal = reportData.liabilities.current.reduce((sum: number, item: any) => sum + item.value, 0);
  const nonCurrentLiabilitiesTotal = reportData.liabilities.nonCurrent.reduce((sum: number, item: any) => sum + item.value, 0);
  const equityTotal = reportData.liabilities.equity.reduce((sum: number, item: any) => sum + item.value, 0);
  const totalLiabilitiesAndEquity = currentLiabilitiesTotal + nonCurrentLiabilitiesTotal + equityTotal;
  
  // Prepare header options
  const reportOptions: ReportOptions = {
    title: 'BALANÇO PATRIMONIAL',
    dateRange: getDateRangeText(dateRange),
    companyName: options?.companyName || 'Padaria e Confeitaria Modelo LTDA',
    companyLogo: options?.companyLogo,
    companyInfo: options?.companyInfo || {
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      phone: '(11) 3456-7890',
      email: 'contato@padariamodelo.com.br',
      fiscal: '12.345.678/0001-99'
    }
  };
  
  // Add header
  const startY = addReportHeader(doc, reportOptions);
  
  // Assets section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ATIVO', 15, startY);
  
  // Define column widths
  const col1Width = 140;
  const col2Width = 40;
  
  // Current assets
  let currentY = startY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ATIVO CIRCULANTE', 20, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Add current assets items
  reportData.assets.current.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Current assets total
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Total do Ativo Circulante', 25, currentY);
  doc.text(formatCurrency(currentAssetsTotal), 15 + col1Width, currentY, { align: 'right' });
  
  // Non-current assets
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('ATIVO NÃO CIRCULANTE', 20, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  
  // Add non-current assets items
  reportData.assets.nonCurrent.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Non-current assets total
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Total do Ativo Não Circulante', 25, currentY);
  doc.text(formatCurrency(nonCurrentAssetsTotal), 15 + col1Width, currentY, { align: 'right' });
  
  // Grand total assets
  currentY += 10;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, currentY - 5, col1Width + col2Width, 8, 'F');
  doc.text('TOTAL DO ATIVO', 20, currentY);
  doc.text(formatCurrency(totalAssets), 15 + col1Width, currentY, { align: 'right' });
  
  // Check if we need a new page for liabilities
  if (currentY > doc.internal.pageSize.height - 120) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 20;
  }
  
  // Liabilities and Equity section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PASSIVO E PATRIMÔNIO LÍQUIDO', 15, currentY);
  
  // Current liabilities
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PASSIVO CIRCULANTE', 20, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Add current liabilities items
  reportData.liabilities.current.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Current liabilities total
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Total do Passivo Circulante', 25, currentY);
  doc.text(formatCurrency(currentLiabilitiesTotal), 15 + col1Width, currentY, { align: 'right' });
  
  // Non-current liabilities
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('PASSIVO NÃO CIRCULANTE', 20, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  
  // Add non-current liabilities items
  reportData.liabilities.nonCurrent.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Non-current liabilities total
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Total do Passivo Não Circulante', 25, currentY);
  doc.text(formatCurrency(nonCurrentLiabilitiesTotal), 15 + col1Width, currentY, { align: 'right' });
  
  // Equity
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('PATRIMÔNIO LÍQUIDO', 20, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  
  // Add equity items
  reportData.liabilities.equity.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Equity total
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Total do Patrimônio Líquido', 25, currentY);
  doc.text(formatCurrency(equityTotal), 15 + col1Width, currentY, { align: 'right' });
  
  // Grand total liabilities and equity
  currentY += 10;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, currentY - 5, col1Width + col2Width, 8, 'F');
  doc.text('TOTAL DO PASSIVO E PATRIMÔNIO LÍQUIDO', 20, currentY);
  doc.text(formatCurrency(totalLiabilitiesAndEquity), 15 + col1Width, currentY, { align: 'right' });
  
  // Add footer with page numbers
  addReportFooter(doc);
  
  // Add balance verification
  currentY += 15;
  const balanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.001;
  doc.setFontSize(10);
  
  // Corrected syntax for setTextColor with conditional RGB values
  if (balanced) {
    doc.setTextColor(0, 128, 0); // Green for balanced
  } else {
    doc.setTextColor(255, 0, 0); // Red for unbalanced
  }
  
  doc.text(
    `Verificação: Ativo ${formatCurrency(totalAssets)} ${balanced ? '=' : '≠'} Passivo + PL ${formatCurrency(totalLiabilitiesAndEquity)}`,
    15,
    currentY
  );
  doc.setTextColor(0, 0, 0); // Reset to black
  
  return doc;
};

// Generate Income Statement (Demonstração do Resultado do Exercício - DRE)
export const generateIncomeStatement = (
  data: any,
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year',
  options?: Partial<ReportOptions>
) => {
  const doc = new jsPDF();
  
  // Sample data if not provided (for demo)
  const reportData = data || {
    revenue: [
      { name: 'Receita Bruta de Vendas', value: 1200000.0 },
      { name: 'Deduções de Vendas', value: -120000.0 },
    ],
    grossProfit: 1080000.0,
    operatingExpenses: [
      { name: 'Despesas de Pessoal', value: -320000.0 },
      { name: 'Despesas Administrativas', value: -180000.0 },
      { name: 'Despesas com Vendas', value: -220000.0 },
      { name: 'Depreciação', value: -60000.0 },
    ],
    operatingIncome: 300000.0,
    financialResults: [
      { name: 'Receitas Financeiras', value: 35000.0 },
      { name: 'Despesas Financeiras', value: -85000.0 },
    ],
    incomeBeforeTax: 250000.0,
    taxes: [
      { name: 'Imposto de Renda', value: -62500.0 },
      { name: 'Contribuição Social', value: -22500.0 },
    ],
    netIncome: 165000.0
  };
  
  // Prepare header options
  const reportOptions: ReportOptions = {
    title: 'DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO',
    dateRange: getDateRangeText(dateRange),
    companyName: options?.companyName || 'Padaria e Confeitaria Modelo LTDA',
    companyLogo: options?.companyLogo,
    companyInfo: options?.companyInfo || {
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      phone: '(11) 3456-7890',
      email: 'contato@padariamodelo.com.br',
      fiscal: '12.345.678/0001-99'
    }
  };
  
  // Add header
  const startY = addReportHeader(doc, reportOptions);
  
  // Define column widths
  const col1Width = 140;
  const col2Width = 40;
  
  let currentY = startY + 5;
  
  // Revenue section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RECEITA', 15, currentY);
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Revenue items
  reportData.revenue.forEach((item: any) => {
    doc.text(item.name, 20, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Gross profit
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('LUCRO BRUTO', 15, currentY);
  doc.text(formatCurrency(reportData.grossProfit), 15 + col1Width, currentY, { align: 'right' });
  
  // Operating expenses section
  currentY += 10;
  doc.text('DESPESAS OPERACIONAIS', 15, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  
  // Operating expenses items
  reportData.operatingExpenses.forEach((item: any) => {
    doc.text(item.name, 20, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Operating income
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('RESULTADO OPERACIONAL', 15, currentY);
  doc.text(formatCurrency(reportData.operatingIncome), 15 + col1Width, currentY, { align: 'right' });
  
  // Financial results section
  currentY += 10;
  doc.text('RESULTADO FINANCEIRO', 15, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  
  // Financial items
  reportData.financialResults.forEach((item: any) => {
    doc.text(item.name, 20, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Income before tax
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('RESULTADO ANTES DOS IMPOSTOS', 15, currentY);
  doc.text(formatCurrency(reportData.incomeBeforeTax), 15 + col1Width, currentY, { align: 'right' });
  
  // Taxes section
  currentY += 10;
  doc.text('IMPOSTOS', 15, currentY);
  
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  
  // Tax items
  reportData.taxes.forEach((item: any) => {
    doc.text(item.name, 20, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Net income
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(15, currentY - 5, col1Width + col2Width, 8, 'F');
  doc.text('LUCRO LÍQUIDO DO EXERCÍCIO', 15, currentY);
  doc.text(formatCurrency(reportData.netIncome), 15 + col1Width, currentY, { align: 'right' });
  
  // Add notes section
  currentY += 20;
  if (currentY > doc.internal.pageSize.height - 60) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Notas:', 15, currentY);
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('As demonstrações financeiras foram elaboradas de acordo com as práticas contábeis adotadas no Brasil.', 15, currentY);
  
  // Add performance indicators
  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Indicadores de Desempenho:', 15, currentY);
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  
  const grossMargin = (reportData.grossProfit / reportData.revenue[0].value) * 100;
  const operatingMargin = (reportData.operatingIncome / reportData.revenue[0].value) * 100;
  const netMargin = (reportData.netIncome / reportData.revenue[0].value) * 100;
  
  currentY += 5;
  doc.text(`Margem Bruta: ${grossMargin.toFixed(2)}%`, 20, currentY);
  currentY += 5;
  doc.text(`Margem Operacional: ${operatingMargin.toFixed(2)}%`, 20, currentY);
  currentY += 5;
  doc.text(`Margem Líquida: ${netMargin.toFixed(2)}%`, 20, currentY);
  
  // Add footer with page numbers
  addReportFooter(doc);
  
  return doc;
};

// Generate Cash Flow Statement (Demonstração dos Fluxos de Caixa - DFC)
export const generateCashFlowStatement = (
  data: any,
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year',
  options?: Partial<ReportOptions>
) => {
  const doc = new jsPDF();
  
  // Sample data if not provided (for demo)
  const reportData = data || {
    operatingActivities: {
      inflows: [
        { name: 'Recebimentos de Clientes', value: 1180000.0 },
        { name: 'Outros Recebimentos Operacionais', value: 25000.0 }
      ],
      outflows: [
        { name: 'Pagamentos a Fornecedores', value: -620000.0 },
        { name: 'Pagamentos a Funcionários', value: -305000.0 },
        { name: 'Impostos Pagos', value: -130000.0 },
        { name: 'Outros Pagamentos Operacionais', value: -70000.0 }
      ],
      netOperatingCashFlow: 80000.0
    },
    investingActivities: {
      inflows: [
        { name: 'Venda de Ativos', value: 5000.0 },
        { name: 'Dividendos Recebidos', value: 2000.0 }
      ],
      outflows: [
        { name: 'Compra de Imobilizado', value: -35000.0 },
        { name: 'Aquisição de Investimentos', value: -15000.0 }
      ],
      netInvestingCashFlow: -43000.0
    },
    financingActivities: {
      inflows: [
        { name: 'Empréstimos Obtidos', value: 100000.0 },
        { name: 'Integralização de Capital', value: 0.0 }
      ],
      outflows: [
        { name: 'Pagamento de Empréstimos', value: -45000.0 },
        { name: 'Dividendos Pagos', value: -20000.0 }
      ],
      netFinancingCashFlow: 35000.0
    },
    netCashFlow: 72000.0,
    openingCashBalance: 128000.0,
    closingCashBalance: 200000.0
  };
  
  // Prepare header options
  const reportOptions: ReportOptions = {
    title: 'DEMONSTRAÇÃO DOS FLUXOS DE CAIXA',
    dateRange: getDateRangeText(dateRange),
    companyName: options?.companyName || 'Padaria e Confeitaria Modelo LTDA',
    companyLogo: options?.companyLogo,
    companyInfo: options?.companyInfo || {
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      phone: '(11) 3456-7890',
      email: 'contato@padariamodelo.com.br',
      fiscal: '12.345.678/0001-99'
    }
  };
  
  // Add header
  const startY = addReportHeader(doc, reportOptions);
  
  // Define column widths
  const col1Width = 140;
  const col2Width = 40;
  
  let currentY = startY + 5;
  
  // Operating activities
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FLUXOS DE CAIXA DAS ATIVIDADES OPERACIONAIS', 15, currentY);
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Inflows
  doc.text('Entradas:', 20, currentY);
  currentY += 6;
  
  // Render inflows
  reportData.operatingActivities.inflows.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Outflows
  currentY += 2;
  doc.text('Saídas:', 20, currentY);
  currentY += 6;
  
  // Render outflows
  reportData.operatingActivities.outflows.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Net operating cash flow
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Fluxo de Caixa Líquido das Atividades Operacionais', 15, currentY);
  doc.text(formatCurrency(reportData.operatingActivities.netOperatingCashFlow), 15 + col1Width, currentY, { align: 'right' });
  
  // Investing activities
  currentY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FLUXOS DE CAIXA DAS ATIVIDADES DE INVESTIMENTO', 15, currentY);
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Inflows
  doc.text('Entradas:', 20, currentY);
  currentY += 6;
  
  // Render inflows
  reportData.investingActivities.inflows.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Outflows
  currentY += 2;
  doc.text('Saídas:', 20, currentY);
  currentY += 6;
  
  // Render outflows
  reportData.investingActivities.outflows.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Net investing cash flow
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Fluxo de Caixa Líquido das Atividades de Investimento', 15, currentY);
  doc.text(formatCurrency(reportData.investingActivities.netInvestingCashFlow), 15 + col1Width, currentY, { align: 'right' });
  
  // Financing activities
  currentY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FLUXOS DE CAIXA DAS ATIVIDADES DE FINANCIAMENTO', 15, currentY);
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Inflows
  doc.text('Entradas:', 20, currentY);
  currentY += 6;
  
  // Render inflows
  reportData.financingActivities.inflows.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Outflows
  currentY += 2;
  doc.text('Saídas:', 20, currentY);
  currentY += 6;
  
  // Render outflows
  reportData.financingActivities.outflows.forEach((item: any) => {
    doc.text(item.name, 25, currentY);
    doc.text(formatCurrency(item.value), 15 + col1Width, currentY, { align: 'right' });
    currentY += 6;
  });
  
  // Net financing cash flow
  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Fluxo de Caixa Líquido das Atividades de Financiamento', 15, currentY);
  doc.text(formatCurrency(reportData.financingActivities.netFinancingCashFlow), 15 + col1Width, currentY, { align: 'right' });
  
  // Net cash flow
  currentY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(15, currentY - 5, col1Width + col2Width, 8, 'F');
  doc.text('AUMENTO/REDUÇÃO LÍQUIDO DE CAIXA E EQUIVALENTES', 15, currentY);
  doc.text(formatCurrency(reportData.netCashFlow), 15 + col1Width, currentY, { align: 'right' });
  
  // Cash balances
  currentY += 12;
  doc.setFont('helvetica', 'normal');
  doc.text('Caixa e Equivalentes no Início do Período', 20, currentY);
  doc.text(formatCurrency(reportData.openingCashBalance), 15 + col1Width, currentY, { align: 'right' });
  
  currentY += 6;
  doc.text('Caixa e Equivalentes no Final do Período', 20, currentY);
  doc.text(formatCurrency(reportData.closingCashBalance), 15 + col1Width, currentY, { align: 'right' });
  
  // Verification
  currentY += 12;
  const calculated = reportData.openingCashBalance + reportData.netCashFlow;
  const difference = Math.abs(calculated - reportData.closingCashBalance);
  const balanced = difference < 0.001;
  
  doc.setFontSize(10);
  // Corrected syntax for setTextColor with conditional
  if (balanced) {
    doc.setTextColor(0, 128, 0); // Green for balanced
  } else {
    doc.setTextColor(255, 0, 0); // Red for unbalanced
  }
  
  doc.text(
    `Verificação: ${formatCurrency(reportData.openingCashBalance)} + ${formatCurrency(reportData.netCashFlow)} ${balanced ? '=' : '≠'} ${formatCurrency(reportData.closingCashBalance)}`,
    15,
    currentY
  );
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Add footer
  addReportFooter(doc);
  
  return doc;
};

// Generate Trial Balance (Balancete)
export const generateTrialBalance = (
  data: any,
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year',
  options?: Partial<ReportOptions>
) => {
  const doc = new jsPDF();
  
  // Sample data if not provided (for demo)
  const reportData = data || {
    accounts: [
      { code: '1', name: 'ATIVO', debit: 0, credit: 0, isHeader: true },
      { code: '1.1', name: 'ATIVO CIRCULANTE', debit: 0, credit: 0, isSubheader: true },
      { code: '1.1.1', name: 'Caixa', debit: 15000, credit: 0 },
      { code: '1.1.2', name: 'Bancos', debit: 85000, credit: 0 },
      { code: '1.1.3', name: 'Aplicações Financeiras', debit: 50000, credit: 0 },
      { code: '1.1.4', name: 'Contas a Receber', debit: 120000, credit: 0 },
      { code: '1.1.5', name: 'Estoques', debit: 230000, credit: 0 },
      { code: '1.2', name: 'ATIVO NÃO CIRCULANTE', debit: 0, credit: 0, isSubheader: true },
      { code: '1.2.1', name: 'Realizável a Longo Prazo', debit: 50000, credit: 0 },
      { code: '1.2.2', name: 'Investimentos', debit: 100000, credit: 0 },
      { code: '1.2.3', name: 'Imobilizado', debit: 350000, credit: 0 },
      { code: '1.2.4', name: 'Intangível', debit: 30000, credit: 0 },
      
      { code: '2', name: 'PASSIVO', debit: 0, credit: 0, isHeader: true },
      { code: '2.1', name: 'PASSIVO CIRCULANTE', debit: 0, credit: 0, isSubheader: true },
      { code: '2.1.1', name: 'Fornecedores', debit: 0, credit: 95000 },
      { code: '2.1.2', name: 'Empréstimos', debit: 0, credit: 35000 },
      { code: '2.1.3', name: 'Impostos a Pagar', debit: 0, credit: 45000 },
      { code: '2.1.4', name: 'Salários a Pagar', debit: 0, credit: 30000 },
      { code: '2.2', name: 'PASSIVO NÃO CIRCULANTE', debit: 0, credit: 0, isSubheader: true },
      { code: '2.2.1', name: 'Empréstimos de Longo Prazo', debit: 0, credit: 180000 },
      { code: '2.2.2', name: 'Provisões', debit: 0, credit: 30000 },
      
      { code: '3', name: 'PATRIMÔNIO LÍQUIDO', debit: 0, credit: 0, isHeader: true },
      { code: '3.1', name: 'Capital Social', debit: 0, credit: 300000 },
      { code: '3.2', name: 'Reservas', debit: 0, credit: 130000 },
      { code: '3.3', name: 'Lucros Acumulados', debit: 0, credit: 150000 },
      
      { code: '4', name: 'RECEITAS', debit: 0, credit: 0, isHeader: true },
      { code: '4.1', name: 'Receitas de Vendas', debit: 0, credit: 980000 },
      { code: '4.2', name: 'Receitas Financeiras', debit: 0, credit: 35000 },
      
      { code: '5', name: 'CUSTOS', debit: 0, credit: 0, isHeader: true },
      { code: '5.1', name: 'Custo das Mercadorias Vendidas', debit: 520000, credit: 0 },
      
      { code: '6', name: 'DESPESAS', debit: 0, credit: 0, isHeader: true },
      { code: '6.1', name: 'Despesas com Pessoal', debit: 320000, credit: 0 },
      { code: '6.2', name: 'Despesas Administrativas', debit: 180000, credit: 0 },
      { code: '6.3', name: 'Despesas com Vendas', debit: 220000, credit: 0 },
      { code: '6.4', name: 'Despesas Financeiras', debit: 85000, credit: 0 },
      { code: '6.5', name: 'Despesas Tributárias', debit: 85000, credit: 0 }
    ]
  };
  
  // Calculate totals
  let totalDebit = 0;
  let totalCredit = 0;
  reportData.accounts.forEach((account: any) => {
    if (!account.isHeader && !account.isSubheader) {
      totalDebit += account.debit;
      totalCredit += account.credit;
    }
  });
  
  // Prepare header options
  const reportOptions: ReportOptions = {
    title: 'BALANCETE DE VERIFICAÇÃO',
    dateRange: getDateRangeText(dateRange),
    companyName: options?.companyName || 'Padaria e Confeitaria Modelo LTDA',
    companyLogo: options?.companyLogo,
    companyInfo: options?.companyInfo || {
      address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
      phone: '(11) 3456-7890',
      email: 'contato@padariamodelo.com.br',
      fiscal: '12.345.678/0001-99'
    }
  };
  
  // Add header
  const startY = addReportHeader(doc, reportOptions);
  
  // Define columns for autotable
  const tableColumns = [
    { header: 'Código', dataKey: 'code' },
    { header: 'Descrição', dataKey: 'name' },
    { header: 'Débito (R$)', dataKey: 'debit' },
    { header: 'Crédito (R$)', dataKey: 'credit' }
  ];
  
  // Prepare table data
  const tableData = reportData.accounts.map((account: any) => {
    const style = account.isHeader 
      ? { fontStyle: 'bold', fillColor: [240, 240, 240] } 
      : account.isSubheader 
        ? { fontStyle: 'bold' } 
        : {};
    
    return {
      code: account.code,
      name: account.isHeader 
        ? account.name 
        : account.isSubheader 
          ? `   ${account.name}`
          : `      ${account.name}`,
      debit: account.debit ? formatCurrency(account.debit).replace('R$', '') : '',
      credit: account.credit ? formatCurrency(account.credit).replace('R$', '') : '',
      styles: style
    };
  });
  
  // Add the table
  doc.autoTable({
    startY: startY + 5,
    head: [tableColumns.map(col => col.header)],
    body: tableData.map((row: any) => [row.code, row.name, row.debit, row.credit]),
    theme: 'grid',
    headStyles: {
      fillColor: [245, 158, 11], // amber-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'left' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    didParseCell: (data: any) => {
      const rowIndex = data.row.index;
      const account = tableData[rowIndex];
      
      if (account && account.styles) {
        if (account.styles.fontStyle === 'bold') {
          data.cell.styles.fontStyle = 'bold';
        }
        if (account.styles.fillColor) {
          data.cell.styles.fillColor = account.styles.fillColor;
        }
      }
    }
  });
  
  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || startY + 200;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(15, finalY + 5, 180, 8, 'F');
  doc.text('TOTAIS', 20, finalY + 10);
  doc.text(formatCurrency(totalDebit).replace('R$', ''), 130, finalY + 10, { align: 'right' });
  doc.text(formatCurrency(totalCredit).replace('R$', ''), 175, finalY + 10, { align: 'right' });
  
  // Add balance verification
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  
  // Corrected syntax for setTextColor with conditional
  if (isBalanced) {
    doc.setTextColor(0, 128, 0); // Green for balanced
  } else {
    doc.setTextColor(255, 0, 0); // Red for unbalanced
  }
  
  doc.text(
    `Verificação de Débito = Crédito: ${isBalanced ? 'CORRETO' : 'INCONSISTENTE'}`,
    15,
    finalY + 20
  );
  
  if (!isBalanced) {
    doc.text(`Diferença: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`, 15, finalY + 25);
  }
  
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Add footer
  addReportFooter(doc);
  
  return doc;
};

// Export a PDF document
export const exportPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};