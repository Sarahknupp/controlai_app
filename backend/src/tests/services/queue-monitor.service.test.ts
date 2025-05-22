import { QueueMonitorService } from '../../services/queue-monitor.service';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { NotificationRetryService } from '../../services/notification-retry.service';
import { AuditService } from '../../services/audit.service';

jest.mock('../../services/notification-queue.service');
jest.mock('../../services/notification-retry.service');
jest.mock('../../services/audit.service');

describe('QueueMonitorService', () => {
  let monitorService: QueueMonitorService;
  let mockQueueService: jest.Mocked<NotificationQueueService>;
  let mockRetryService: jest.Mocked<NotificationRetryService>;
  let mockAuditService: jest.Mocked<AuditService>;

  const mockQueueStats = {
    total: 100,
    active: 20,
    completed: 70,
    failed: 10,
    byType: {
      email: 50,
      sms: 30,
      push: 20
    },
    byPriority: {
      high: 30,
      normal: 60,
      low: 10
    },
    byStatus: {
      waiting: 20,
      processing: 10,
      completed: 70
    },
    hourlyStats: [
      {
        hour: '2024-03-20T10:00:00Z',
        count: 10,
        success: 8,
        failure: 2
      }
    ]
  };

  const mockRetryStats = {
    total: 5,
    jobs: [
      {
        notificationId: '123',
        attempts: 2,
        nextAttempt: new Date(),
        lastError: 'Connection timeout'
      }
    ]
  };

  beforeEach(() => {
    mockQueueService = new NotificationQueueService({} as any, {} as any) as jest.Mocked<NotificationQueueService>;
    mockRetryService = new NotificationRetryService({} as any, {} as any) as jest.Mocked<NotificationRetryService>;
    mockAuditService = new AuditService() as jest.Mocked<AuditService>;

    mockQueueService.getQueueStats = jest.fn().mockResolvedValue(mockQueueStats);
    mockRetryService.getRetryStats = jest.fn().mockResolvedValue(mockRetryStats);
    mockAuditService.logAction = jest.fn();

    monitorService = new QueueMonitorService(
      mockQueueService,
      mockRetryService,
      mockAuditService
    );
  });

  describe('getMetrics', () => {
    it('should return current queue metrics', async () => {
      const metrics = await monitorService.getMetrics();

      expect(metrics).toEqual({
        totalJobs: mockQueueStats.total,
        activeJobs: mockQueueStats.active,
        completedJobs: mockQueueStats.completed,
        failedJobs: mockQueueStats.failed,
        retryJobs: mockRetryStats.total,
        jobsByType: mockQueueStats.byType,
        jobsByPriority: mockQueueStats.byPriority,
        jobsByStatus: mockQueueStats.byStatus,
        hourlyStats: mockQueueStats.hourlyStats,
        averageProcessingTime: 0
      });
    });

    it('should handle errors when getting metrics', async () => {
      mockQueueService.getQueueStats.mockRejectedValueOnce(new Error('Queue error'));

      await expect(monitorService.getMetrics()).rejects.toThrow('Queue error');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'queue_metrics_error',
          status: 'error'
        })
      );
    });
  });

  describe('getJobDetails', () => {
    it('should return job details', async () => {
      const mockJob = { id: '123', status: 'completed' };
      mockQueueService.getJob = jest.fn().mockResolvedValue(mockJob);

      const job = await monitorService.getJobDetails('123');
      expect(job).toEqual(mockJob);
    });

    it('should throw error when job not found', async () => {
      mockQueueService.getJob = jest.fn().mockResolvedValue(null);

      await expect(monitorService.getJobDetails('123')).rejects.toThrow('Job not found: 123');
    });
  });

  describe('getFailedJobs', () => {
    it('should return failed jobs', async () => {
      const mockFailedJobs = [{ id: '123', error: 'Failed to send' }];
      mockQueueService.getFailedJobs = jest.fn().mockResolvedValue(mockFailedJobs);

      const failedJobs = await monitorService.getFailedJobs();
      expect(failedJobs).toEqual(mockFailedJobs);
    });
  });

  describe('getRetryJobs', () => {
    it('should return retry jobs', async () => {
      const mockRetryJobs = [{ id: '123', attempts: 2 }];
      mockRetryService.getRetryJobs = jest.fn().mockResolvedValue(mockRetryJobs);

      const retryJobs = await monitorService.getRetryJobs();
      expect(retryJobs).toEqual(mockRetryJobs);
    });
  });

  describe('clearFailedJobs', () => {
    it('should clear failed jobs successfully', async () => {
      mockQueueService.clearFailedJobs = jest.fn().mockResolvedValue(undefined);

      await monitorService.clearFailedJobs();
      expect(mockQueueService.clearFailedJobs).toHaveBeenCalled();
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'failed_jobs_cleared',
          status: 'success'
        })
      );
    });
  });

  describe('retryFailedJob', () => {
    it('should retry failed job successfully', async () => {
      mockQueueService.retryJob = jest.fn().mockResolvedValue(undefined);

      await monitorService.retryFailedJob('123');
      expect(mockQueueService.retryJob).toHaveBeenCalledWith('123');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'job_retry',
          status: 'success'
        })
      );
    });
  });
}); 