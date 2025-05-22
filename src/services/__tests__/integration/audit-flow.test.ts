import { auditService } from '../../audit.service';
import { cacheService } from '../../cache.service';
import { loggingService } from '../../logging.service';
import { AuditLog, RetentionStats, AuditFilters, ExportFormat } from '../../../types/audit';

describe('Audit Flow Integration', () => {
  beforeEach(() => {
    cacheService.clear();
    loggingService.clearLogBuffer();
    jest.clearAllMocks();
  });

  describe('Log Creation and Retrieval Flow', () => {
    it('should create a log and retrieve it with caching', async () => {
      // Mock successful API responses
      const mockLog: Partial<AuditLog> = {
        id: '1',
        action: 'test_action',
        entityType: 'test_resource',
        details: JSON.stringify({ test: 'data' })
      };

      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLog)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLog)
        });

      global.fetch = mockFetch;

      // Create a new log
      const createdLog = await auditService.createLog({
        action: 'test_action',
        entityType: 'test_resource',
        details: JSON.stringify({ test: 'data' })
      });

      expect(createdLog).toEqual(mockLog);
      expect(loggingService.getLogBuffer()).toHaveLength(1);

      // Retrieve the log (should use cache)
      const retrievedLog = await auditService.getLogById('1');
      expect(retrievedLog).toEqual(mockLog);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should handle log creation failure and retry', async () => {
      const mockError = new Error('Network error');
      const mockLog: Partial<AuditLog> = {
        id: '1',
        action: 'test_action',
        entityType: 'test_resource',
        details: JSON.stringify({ test: 'data' })
      };

      const mockFetch = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLog)
        });

      global.fetch = mockFetch;

      // Attempt to create log (should fail first, then succeed)
      const createdLog = await auditService.createLog({
        action: 'test_action',
        entityType: 'test_resource',
        details: JSON.stringify({ test: 'data' })
      });

      expect(createdLog).toEqual(mockLog);
      expect(loggingService.getLogBuffer()).toHaveLength(2); // Error log + success log
    });

    it('should handle concurrent log creation and retrieval', async () => {
      const mockLogs = [
        { id: '1', action: 'create', entityType: 'user' },
        { id: '2', action: 'update', entityType: 'user' }
      ];

      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLogs[0])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLogs[1])
        });

      global.fetch = mockFetch;

      // Create logs concurrently
      const [log1, log2] = await Promise.all([
        auditService.createLog({ action: 'create', entityType: 'user', details: '{}' }),
        auditService.createLog({ action: 'update', entityType: 'user', details: '{}' })
      ]);

      expect(log1).toEqual(mockLogs[0]);
      expect(log2).toEqual(mockLogs[1]);
      expect(loggingService.getLogBuffer()).toHaveLength(2);
    });
  });

  describe('Log Export and Statistics Flow', () => {
    it('should export logs and update statistics', async () => {
      const mockBlob = new Blob(['test']);
      const mockStats = {
        totalLogs: 100,
        actionsByType: { create: 50, update: 30, delete: 20 }
      };

      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(mockBlob)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats)
        });

      global.fetch = mockFetch;

      // Export logs
      await auditService.exportLogs();
      expect(loggingService.getLogBuffer()).toHaveLength(1);

      // Get updated statistics
      const stats = await auditService.getStats();
      expect(stats).toEqual(mockStats);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should handle export with filters', async () => {
      const mockBlob = new Blob(['test']);
      const filters: AuditFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        entityType: 'user',
        search: 'test'
      };

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      });

      global.fetch = mockFetch;

      await auditService.exportLogs(filters);
      expect(loggingService.getLogBuffer()).toHaveLength(1);
    });
  });

  describe('Log Retention and Archive Flow', () => {
    it('should handle log retention and archiving', async () => {
      const mockRetentionStats: RetentionStats = {
        totalLogs: 1000,
        logsToDelete: 500,
        totalSize: 1024,
        sizeToDelete: 512
      };

      const mockArchiveStatus = {
        lastArchiveDate: '2024-01-01',
        archivedCount: 500,
        pendingCount: 200
      };

      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockRetentionStats)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockArchiveStatus)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      global.fetch = mockFetch;

      // Get retention stats
      const retentionStats = await auditService.getRetentionStats();
      expect(retentionStats).toEqual(mockRetentionStats);

      // Get archive status
      const archiveStatus = await auditService.getArchiveStatus();
      expect(archiveStatus).toEqual(mockArchiveStatus);

      // Apply retention policy
      await auditService.applyRetentionPolicy(mockRetentionStats);
      expect(loggingService.getLogBuffer()).toHaveLength(3);
    });

    it('should handle retention policy validation', async () => {
      const invalidPolicy: Partial<RetentionStats> = {
        totalLogs: -1,
        logsToDelete: 0,
        totalSize: -100
      };

      await expect(auditService.applyRetentionPolicy(invalidPolicy)).rejects.toThrow();
      expect(loggingService.getLogBuffer()).toHaveLength(1);
    });

    it('should handle archive size limits', async () => {
      const mockRetentionStats: RetentionStats = {
        totalLogs: 1000000,
        logsToDelete: 500000,
        totalSize: 10240,
        sizeToDelete: 5120
      };

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Archive size limit exceeded' })
      });

      global.fetch = mockFetch;

      await expect(auditService.archiveLogs()).rejects.toThrow('Archive size limit exceeded');
      expect(loggingService.getLogBuffer()).toHaveLength(1);
    });
  });

  describe('Error Handling and Logging Flow', () => {
    it('should properly log errors and handle retries', async () => {
      const mockError = new Error('API Error');
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      global.fetch = mockFetch;

      try {
        await auditService.getLogs();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(loggingService.getLogBuffer()).toHaveLength(2); // Two error logs
      }

      // Verify error details in logs
      const logs = loggingService.getLogBuffer();
      expect(logs[0].level).toBe('error');
      expect(logs[0].error).toBeInstanceOf(Error);
    });

    it('should handle network timeouts', async () => {
      const mockFetch = jest.fn().mockImplementation(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 1000);
      }));

      global.fetch = mockFetch;

      await expect(auditService.getLogs()).rejects.toThrow('Timeout');
      expect(loggingService.getLogBuffer()).toHaveLength(1);
    });

    it('should handle malformed responses', async () => {
      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      global.fetch = mockFetch;

      await expect(auditService.getLogs()).rejects.toThrow('Invalid JSON');
      expect(loggingService.getLogBuffer()).toHaveLength(1);
    });
  });

  describe('Cache and Performance Flow', () => {
    it('should use cache for frequently accessed logs', async () => {
      const mockLog: Partial<AuditLog> = {
        id: '1',
        action: 'test_action',
        entityType: 'test_resource'
      };

      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLog)
      });

      global.fetch = mockFetch;

      // First request (should fetch from API)
      await auditService.getLogById('1');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second request (should use cache)
      await auditService.getLogById('1');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should handle cache invalidation', async () => {
      const mockLog: Partial<AuditLog> = {
        id: '1',
        action: 'test_action',
        entityType: 'test_resource'
      };

      const mockFetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockLog)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ...mockLog, action: 'updated_action' })
        });

      global.fetch = mockFetch;

      // First request
      await auditService.getLogById('1');

      // Invalidate cache
      cacheService.clear();

      // Second request (should fetch from API again)
      const updatedLog = await auditService.getLogById('1');
      expect(updatedLog.action).toBe('updated_action');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
}); 