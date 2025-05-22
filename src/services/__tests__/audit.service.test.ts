import { auditService } from '../audit.service';
import { cacheService } from '../cache.service';
import { loggingService } from '../logging.service';
import { handleError } from '../../utils/error';
import { AuditAction, EntityType, AuditStatus } from '../../types/audit';

// Mock dependencies
jest.mock('../cache.service');
jest.mock('../logging.service');
jest.mock('../../utils/error');

describe('AuditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLog', () => {
    it('should create a new audit log', async () => {
      const mockLog = {
        action: 'create' as AuditAction,
        entityType: 'customer' as EntityType,
        entityId: 'customer123',
        details: { name: 'Test Customer' }
      };

      const mockResponse = {
        id: 'log123',
        ...mockLog,
        details: JSON.stringify(mockLog.details),
        userId: 'user123',
        userName: 'Test User',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        createdAt: new Date().toISOString()
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.createLog(mockLog);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(JSON.stringify(mockLog))
        })
      );
    });

    it('should handle error when creating log', async () => {
      const mockLog = {
        action: 'test_action',
        resource: 'test_resource'
      };

      const mockError = new Error('Failed to create log');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.createLog(mockLog)).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getLogs', () => {
    it('should fetch logs with filters', async () => {
      const mockFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        entityType: 'customer' as EntityType,
        page: 1,
        pageSize: 10
      };

      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.getLogs(mockFilters);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle empty filters', async () => {
      const mockResponse = {
        logs: [],
        total: 0
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      global.fetch = mockFetch;

      const result = await auditService.getLogs();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle error when fetching logs', async () => {
      const mockError = new Error('Failed to fetch logs');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.getLogs()).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getLogById', () => {
    it('should fetch a single log by ID', async () => {
      const mockLog = { id: '1', action: 'test' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLog)
      });
      global.fetch = mockFetch;

      const result = await auditService.getLogById('1');

      expect(result).toEqual(mockLog);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle error when fetching log by ID', async () => {
      const mockError = new Error('Failed to fetch log');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.getLogById('1')).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('exportLogs', () => {
    it('should export logs to CSV with filters', async () => {
      const mockFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        entityType: 'customer'
      };

      const mockBlob = new Blob(['test']);
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      });
      global.fetch = mockFetch;

      await auditService.exportLogs(mockFilters);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle error when exporting logs', async () => {
      const mockError = new Error('Failed to export logs');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.exportLogs()).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getStats', () => {
    it('should fetch audit statistics with filters', async () => {
      const mockFilters = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        entityType: 'customer'
      };

      const mockStats = {
        totalLogs: 100,
        actionsByType: { create: 50, update: 30, delete: 20 }
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });
      global.fetch = mockFetch;

      const result = await auditService.getStats(mockFilters);

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle error when fetching stats', async () => {
      const mockError = new Error('Failed to fetch stats');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.getStats()).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getRetentionStats', () => {
    it('should fetch retention statistics', async () => {
      const mockStats = {
        totalLogs: 1000,
        logsToDelete: 100,
        totalSize: 500,
        sizeToDelete: 50
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });
      global.fetch = mockFetch;

      const result = await auditService.getRetentionStats();

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle error when fetching retention stats', async () => {
      const mockError = new Error('Failed to fetch retention stats');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.getRetentionStats()).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getArchiveStatus', () => {
    it('should fetch archive status', async () => {
      const mockStatus = {
        lastArchiveDate: '2024-01-01T00:00:00Z',
        archiveSize: 200,
        archiveLocation: '/archive/2024-01-01.zip'
      };

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatus)
      });
      global.fetch = mockFetch;

      const result = await auditService.getArchiveStatus();

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle error when fetching archive status', async () => {
      const mockError = new Error('Failed to fetch archive status');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.getArchiveStatus()).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('applyRetentionPolicy', () => {
    it('should apply retention policy', async () => {
      const mockPolicy = {
        duration: 30,
        maxSize: 1000,
        enabled: true
      };

      const mockResponse = {
        totalLogs: 100,
        logsToDelete: 50,
        totalSize: 500,
        sizeToDelete: 250
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.applyRetentionPolicy(mockPolicy);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/retention'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(JSON.stringify(mockPolicy))
        })
      );
    });

    it('should handle error when applying retention policy', async () => {
      const mockError = new Error('Failed to apply retention policy');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.applyRetentionPolicy({})).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('archiveLogs', () => {
    it('should archive logs', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true
      });
      global.fetch = mockFetch;

      await auditService.archiveLogs();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    it('should handle error when archiving logs', async () => {
      const mockError = new Error('Failed to archive logs');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(auditService.archiveLogs()).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('logAction', () => {
    it('should log an action', async () => {
      const mockLog = {
        action: 'create' as AuditAction,
        entityType: 'customer' as EntityType,
        entityId: 'customer123',
        details: { name: 'Test Customer' }
      };

      const mockResponse = {
        id: 'log123',
        ...mockLog,
        details: JSON.stringify(mockLog.details),
        userId: 'user123',
        userName: 'Test User',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        createdAt: new Date().toISOString()
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.logAction(
        mockLog.action,
        mockLog.entityType,
        mockLog.entityId,
        mockLog.details
      );

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(JSON.stringify(mockLog))
        })
      );
    });

    it('should handle error when logging action', async () => {
      const mockError = new Error('Failed to log action');
      const mockFetch = jest.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      await expect(
        auditService.logAction('test', 'customer', 'customer123')
      ).rejects.toThrow();
      expect(handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getTodayLogs', () => {
    it('should fetch logs for today', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.getTodayLogs();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getLastWeekLogs', () => {
    it('should fetch logs for the last week', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.getLastWeekLogs();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getLastMonthLogs', () => {
    it('should fetch logs for the last month', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.getLastMonthLogs();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getLogsByStatus', () => {
    it('should fetch logs by status', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await auditService.getLogsByStatus('success' as AuditStatus);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getUserLogsByPeriod', () => {
    it('should fetch logs for a user in a specific period', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const userId = 'user123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const result = await auditService.getUserLogsByPeriod(userId, startDate, endDate);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getEntityLogsByPeriod', () => {
    it('should fetch logs for an entity in a specific period', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const entityType: EntityType = 'customer';
      const entityId = 'customer123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const result = await auditService.getEntityLogsByPeriod(entityType, entityId, startDate, endDate);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getActionLogsByPeriod', () => {
    it('should fetch logs for an action in a specific period', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const action: AuditAction = 'create';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      const result = await auditService.getActionLogsByPeriod(action, startDate, endDate);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getLogsByUserAndAction', () => {
    it('should fetch logs for a user and action', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const userId = 'user123';
      const action: AuditAction = 'create';

      const result = await auditService.getLogsByUserAndAction(userId, action);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getLogsByEntityAndAction', () => {
    it('should fetch logs for an entity and action', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const entityType: EntityType = 'customer';
      const entityId = 'customer123';
      const action: AuditAction = 'create';

      const result = await auditService.getLogsByEntityAndAction(entityType, entityId, action);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getLogsByUserAndEntity', () => {
    it('should fetch logs for a user and entity', async () => {
      const mockResponse = {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 10
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const userId = 'user123';
      const entityType: EntityType = 'customer';
      const entityId = 'customer123';

      const result = await auditService.getLogsByUserAndEntity(userId, entityType, entityId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audit/logs'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });
}); 