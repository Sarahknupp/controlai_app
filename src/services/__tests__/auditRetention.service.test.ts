import axios from 'axios';
import { auditRetentionService } from '../auditRetention.service';
import { handleApiError } from '../../utils/errorHandler';
import { auditConfig } from '../../config/audit.config';

// Mock dependencies
jest.mock('axios');
jest.mock('../../utils/errorHandler');
jest.mock('../../config/audit.config', () => ({
  auditConfig: {
    retention: {
      maxAge: 90,
      maxSize: 1000
    },
    storage: {
      compression: true,
      format: 'zip'
    }
  }
}));

describe('AuditRetentionService', () => {
  const mockBaseUrl = 'http://localhost:3000/audit-logs/retention';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VITE_API_URL = 'http://localhost:3000';
  });

  describe('getRetentionStats', () => {
    it('should fetch retention statistics', async () => {
      const mockStats = {
        totalLogs: 1000,
        totalSize: 500,
        oldestLog: '2024-01-01T00:00:00Z',
        newestLog: '2024-01-31T23:59:59Z',
        logsToDelete: 100,
        sizeToDelete: 50
      };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await auditRetentionService.getRetentionStats();

      expect(result).toEqual(mockStats);
      expect(axios.get).toHaveBeenCalledWith(`${mockBaseUrl}/stats`);
    });

    it('should handle error when fetching retention stats', async () => {
      const mockError = new Error('Failed to fetch stats');
      (axios.get as jest.Mock).mockRejectedValue(mockError);

      await expect(auditRetentionService.getRetentionStats()).rejects.toThrow();
      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('applyRetentionPolicy', () => {
    it('should apply retention policy with config', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await auditRetentionService.applyRetentionPolicy();

      expect(axios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/apply`,
        {
          config: auditConfig.retention
        }
      );
    });

    it('should handle error when applying retention policy', async () => {
      const mockError = new Error('Failed to apply policy');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(auditRetentionService.applyRetentionPolicy()).rejects.toThrow();
      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('archiveLogs', () => {
    it('should archive logs with storage config', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      await auditRetentionService.archiveLogs();

      expect(axios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/archive`,
        {
          config: auditConfig.storage
        }
      );
    });

    it('should handle error when archiving logs', async () => {
      const mockError = new Error('Failed to archive logs');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(auditRetentionService.archiveLogs()).rejects.toThrow();
      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getArchiveStatus', () => {
    it('should fetch archive status', async () => {
      const mockStatus = {
        lastArchiveDate: '2024-01-01T00:00:00Z',
        archiveSize: 200,
        archiveLocation: '/archive/2024-01-01.zip'
      };

      (axios.get as jest.Mock).mockResolvedValue({ data: mockStatus });

      const result = await auditRetentionService.getArchiveStatus();

      expect(result).toEqual(mockStatus);
      expect(axios.get).toHaveBeenCalledWith(`${mockBaseUrl}/archive/status`);
    });

    it('should handle error when fetching archive status', async () => {
      const mockError = new Error('Failed to fetch archive status');
      (axios.get as jest.Mock).mockRejectedValue(mockError);

      await expect(auditRetentionService.getArchiveStatus()).rejects.toThrow();
      expect(handleApiError).toHaveBeenCalledWith(mockError);
    });
  });
}); 