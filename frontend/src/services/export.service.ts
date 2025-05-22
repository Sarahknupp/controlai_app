import { saveAs } from 'file-saver';

export interface ExportOptions {
  format: 'csv' | 'json';
  filename?: string;
  data: any;
}

class ExportService {
  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      return this.arrayToCSV(data);
    } else if (typeof data === 'object') {
      return this.objectToCSV(data);
    }
    throw new Error('Unsupported data format for CSV export');
  }

  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private objectToCSV(data: Record<string, any>): string {
    const rows = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key},${JSON.stringify(value)}`;
      }
      return `${key},${value}`;
    });

    return ['Key,Value', ...rows].join('\n');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  exportData({ format, filename, data }: ExportOptions): void {
    const timestamp = this.formatDate(new Date());
    const defaultFilename = `notification-metrics-${timestamp}`;
    const finalFilename = filename || defaultFilename;

    try {
      let content: string;
      let mimeType: string;

      if (format === 'csv') {
        content = this.convertToCSV(data);
        mimeType = 'text/csv;charset=utf-8';
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      saveAs(blob, `${finalFilename}.${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  exportMetrics(metrics: any, format: 'csv' | 'json' = 'json'): void {
    this.exportData({
      format,
      data: metrics,
      filename: `notification-metrics-${this.formatDate(new Date())}`
    });
  }

  exportTrends(trends: any, format: 'csv' | 'json' = 'json'): void {
    this.exportData({
      format,
      data: trends,
      filename: `notification-trends-${this.formatDate(new Date())}`
    });
  }

  exportFailures(failures: any[], format: 'csv' | 'json' = 'json'): void {
    this.exportData({
      format,
      data: failures,
      filename: `notification-failures-${this.formatDate(new Date())}`
    });
  }
}

export default new ExportService(); 