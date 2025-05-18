/**
 * Financial data types and interfaces
 * @module types/financial
 */

export interface FinancialData {
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
  profit: number;
  lastMonthProfit: number;
  lastYearRevenue: number;
  lastYearExpenses: number;
  cashFlow: {
    operational: number;
    investment: number;
    financing: number;
  };
  revenueByCategory: {
    name: string;
    value: number;
  }[];
  expenseByCategory: {
    name: string;
    value: number;
  }[];
}

export interface FinancialReport {
  id: string;
  companyId: string;
  type: 'balanco' | 'dre' | 'dfc' | 'notas';
  period: 'current_month' | 'last_month' | 'current_year';
  generatedAt: Date;
  fileUrl: string;
  status: 'pending' | 'completed' | 'error';
  error?: string;
}

export interface RevenueMetrics {
  total: number;
  byCategory: {
    name: string;
    value: number;
    percentage: number;
  }[];
  monthOverMonth: number;
  yearOverYear: number;
}

export interface ExpenseMetrics {
  total: number;
  byCategory: {
    name: string;
    value: number;
    percentage: number;
  }[];
  monthOverMonth: number;
  yearOverYear: number;
}

export interface CashFlowMetrics {
  operational: {
    inflow: number;
    outflow: number;
    net: number;
  };
  investment: {
    inflow: number;
    outflow: number;
    net: number;
  };
  financing: {
    inflow: number;
    outflow: number;
    net: number;
  };
  totalNet: number;
  monthOverMonth: number;
}

export interface BalanceSheetMetrics {
  assets: {
    current: number;
    nonCurrent: number;
    total: number;
  };
  liabilities: {
    current: number;
    nonCurrent: number;
    total: number;
  };
  equity: {
    capital: number;
    reserves: number;
    retainedEarnings: number;
    total: number;
  };
  ratios: {
    currentRatio: number;
    quickRatio: number;
    debtToEquity: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
}

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
}

export interface BudgetItem {
  id: string;
  category: string;
  subcategory?: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

export interface Budget {
  id: string;
  companyId: string;
  period: string;
  items: BudgetItem[];
  status: 'draft' | 'approved' | 'closed';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialTransaction {
  id: string;
  companyId: string;
  type: 'revenue' | 'expense' | 'transfer';
  category: string;
  subcategory?: string;
  amount: number;
  date: Date;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: string;
  document?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountBalance {
  id: string;
  companyId: string;
  accountId: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'investment';
  currentBalance: number;
  availableBalance: number;
  lastUpdated: Date;
}

export interface FinancialPeriod {
  id: string;
  companyId: string;
  startDate: Date;
  endDate: Date;
  status: 'open' | 'closed' | 'adjusting';
  closedBy?: string;
  closedAt?: Date;
  reopenedBy?: string;
  reopenedAt?: Date;
  notes?: string;
} 