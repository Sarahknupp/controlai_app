// Helper functions for date-related operations in reports

/**
 * Formats a date range for display in reports
 * @param dateRange Type of date range
 * @param customStartDate Optional custom start date
 * @param customEndDate Optional custom end date
 * @returns Formatted date range text
 */
export const getDateRangeText = (
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'year',
  customStartDate?: Date,
  customEndDate?: Date
): string => {
  const today = new Date();
  
  if (customStartDate && customEndDate) {
    return `Período: ${formatDate(customStartDate)} a ${formatDate(customEndDate)}`;
  }
  
  switch (dateRange) {
    case 'day':
      return `Período: ${formatDate(today)}`;
    
    case 'week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      
      return `Período: ${formatDate(startOfWeek)} a ${formatDate(endOfWeek)}`;
    }
    
    case 'month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      return `Período: ${formatDate(startOfMonth)} a ${formatDate(endOfMonth)}`;
    }
    
    case 'quarter': {
      const currentQuarter = Math.floor(today.getMonth() / 3);
      const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1);
      const endOfQuarter = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
      
      return `Período: ${formatDate(startOfQuarter)} a ${formatDate(endOfQuarter)}`;
    }
    
    case 'year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      
      return `Período: ${formatDate(startOfYear)} a ${formatDate(endOfYear)}`;
    }
    
    default:
      return 'Período não especificado';
  }
};

/**
 * Format a date in local format
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};