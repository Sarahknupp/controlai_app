import exportService from '../../services/export.service';
import { saveAs } from 'file-saver';

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}));

describe('ExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('arrayToCSV', () => {
    it('should convert array of objects to CSV', () => {
      const data = [
        { id: 1, name: 'Test 1', value: 100 },
        { id: 2, name: 'Test 2', value: 200 }
      ];

      const result = (exportService as any).convertToCSV(data);
      expect(result).toBe('id,name,value\n1,Test 1,100\n2,Test 2,200');
    });

    it('should handle empty array', () => {
      const result = (exportService as any).convertToCSV([]);
      expect(result).toBe('');
    });

    it('should handle strings with commas', () => {
      const data = [
        { id: 1, name: 'Test, with comma', value: 100 }
      ];

      const result = (exportService as any).convertToCSV(data);
      expect(result).toBe('id,name,value\n1,"Test, with comma",100');
    });
  });

  describe('objectToCSV', () => {
    it('should convert object to CSV', () => {
      const data = {
        totalSent: 1000,
        totalFailed: 100,
        failureRate: 0.1
      };

      const result = (exportService as any).convertToCSV(data);
      expect(result).toBe('Key,Value\ntotalSent,1000\ntotalFailed,100\nfailureRate,0.1');
    });

    it('should handle nested objects', () => {
      const data = {
        metrics: {
          total: 1000,
          failed: 100
        }
      };

      const result = (exportService as any).convertToCSV(data);
      expect(result).toBe('Key,Value\nmetrics,{"total":1000,"failed":100}');
    });
  });

  describe('exportData', () => {
    it('should export JSON data', () => {
      const data = { test: 'data' };
      exportService.exportData({ format: 'json', data });

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/notification-metrics-\d{4}-\d{2}-\d{2}\.json$/)
      );
    });

    it('should export CSV data', () => {
      const data = [{ id: 1, name: 'Test' }];
      exportService.exportData({ format: 'csv', data });

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/notification-metrics-\d{4}-\d{2}-\d{2}\.csv$/)
      );
    });

    it('should use custom filename', () => {
      const data = { test: 'data' };
      exportService.exportData({ format: 'json', data, filename: 'custom-name' });

      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'custom-name.json'
      );
    });

    it('should handle export errors', () => {
      const data = undefined;
      expect(() => {
        exportService.exportData({ format: 'json', data });
      }).toThrow('Failed to export data');
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics data', () => {
      const metrics = {
        totalSent: 1000,
        totalFailed: 100
      };

      exportService.exportMetrics(metrics);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/notification-metrics-\d{4}-\d{2}-\d{2}\.json$/)
      );
    });

    it('should export metrics as CSV', () => {
      const metrics = {
        totalSent: 1000,
        totalFailed: 100
      };

      exportService.exportMetrics(metrics, 'csv');
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/notification-metrics-\d{4}-\d{2}-\d{2}\.csv$/)
      );
    });
  });

  describe('exportTrends', () => {
    it('should export trends data', () => {
      const trends = {
        daily: [{ date: '2024-03-20', rate: 0.1 }]
      };

      exportService.exportTrends(trends);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/notification-trends-\d{4}-\d{2}-\d{2}\.json$/)
      );
    });
  });

  describe('exportFailures', () => {
    it('should export failures data', () => {
      const failures = [
        { id: 1, error: 'Test error' }
      ];

      exportService.exportFailures(failures);
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        expect.stringMatching(/notification-failures-\d{4}-\d{2}-\d{2}\.json$/)
      );
    });
  });
}); 