import Bull from 'bull';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { NotificationService, Notification, NotificationType, NotificationPriority } from '../../services/notification.service';
import { AuditService } from '../../services/audit.service';

// Mock dependencies
jest.mock('bull');
jest.mock('../../services/notification.service');
jest.mock('../../services/audit.service');

describe('NotificationQueueService', () => {
  let queueService: NotificationQueueService;
  let notificationService: jest.Mocked<NotificationService>;
  let auditService: jest.Mocked<AuditService>;
  let mockQueue: jest.Mocked<Bull.Queue>;

  const mockConfig = {
    redis: {
      host: 'localhost',
      port: 6379
    },
    prefix: 'test-queue'
  };

  const mockNotification: Notification = {
    id: 'notification123',
    userId: 'user123',
    type: NotificationType.EMAIL,
    priority: NotificationPriority.MEDIUM,
    subject: 'Test Subject',
    content: 'Test Content',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize mocked services
    notificationService = new NotificationService(
      {} as any,
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<NotificationService>;
    auditService = new AuditService() as jest.Mocked<AuditService>;

    // Mock Bull Queue
    mockQueue = {
      process: jest.fn(),
      add: jest.fn(),
      getJob: jest.fn(),
      getWaitingCount: jest.fn(),
      getActiveCount: jest.fn(),
      getCompletedCount: jest.fn(),
      getFailedCount: jest.fn(),
      getDelayedCount: jest.fn(),
      getPausedCount: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      on: jest.fn()
    } as any;

    (Bull as jest.Mock).mockImplementation(() => mockQueue);

    queueService = new NotificationQueueService(mockConfig, notificationService);
  });

  describe('addToQueue', () => {
    it('should add notification to queue successfully', async () => {
      const mockJob = {
        id: 'job123',
        data: { notification: mockNotification }
      };

      mockQueue.add.mockResolvedValueOnce(mockJob);

      const job = await queueService.addToQueue(mockNotification);

      expect(job).toBeDefined();
      expect(mockQueue.add).toHaveBeenCalledWith(
        { notification: mockNotification },
        undefined
      );
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle queue errors', async () => {
      mockQueue.add.mockRejectedValueOnce(new Error('Queue error'));

      await expect(
        queueService.addToQueue(mockNotification)
      ).rejects.toThrow('Failed to add notification to queue: Queue error');

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('getJobStatus', () => {
    it('should return job status successfully', async () => {
      const jobId = 'job123';
      const mockJob = {
        id: jobId,
        getState: jest.fn().mockResolvedValueOnce('completed'),
        attemptsMade: 1,
        failedReason: null
      };

      mockQueue.getJob.mockResolvedValueOnce(mockJob);

      const status = await queueService.getJobStatus(jobId);

      expect(status).toEqual({
        status: 'completed',
        attempts: 1
      });
    });

    it('should handle non-existent job', async () => {
      const jobId = 'non_existent_job';
      mockQueue.getJob.mockResolvedValueOnce(null);

      await expect(
        queueService.getJobStatus(jobId)
      ).rejects.toThrow(`Job not found: ${jobId}`);
    });
  });

  describe('retryJob', () => {
    it('should retry job successfully', async () => {
      const jobId = 'job123';
      const mockJob = {
        id: jobId,
        data: { notification: mockNotification },
        retry: jest.fn().mockResolvedValueOnce(undefined)
      };

      mockQueue.getJob.mockResolvedValueOnce(mockJob);

      await queueService.retryJob(jobId);

      expect(mockJob.retry).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'UPDATE',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle retry errors', async () => {
      const jobId = 'job123';
      const mockJob = {
        id: jobId,
        retry: jest.fn().mockRejectedValueOnce(new Error('Retry failed'))
      };

      mockQueue.getJob.mockResolvedValueOnce(mockJob);

      await expect(
        queueService.retryJob(jobId)
      ).rejects.toThrow('Failed to retry job: Retry failed');

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'UPDATE',
        entityType: 'NOTIFICATION',
        entityId: 'unknown',
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('removeJob', () => {
    it('should remove job successfully', async () => {
      const jobId = 'job123';
      const mockJob = {
        id: jobId,
        data: { notification: mockNotification },
        remove: jest.fn().mockResolvedValueOnce(undefined)
      };

      mockQueue.getJob.mockResolvedValueOnce(mockJob);

      await queueService.removeJob(jobId);

      expect(mockJob.remove).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'DELETE',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle removal errors', async () => {
      const jobId = 'job123';
      const mockJob = {
        id: jobId,
        remove: jest.fn().mockRejectedValueOnce(new Error('Remove failed'))
      };

      mockQueue.getJob.mockResolvedValueOnce(mockJob);

      await expect(
        queueService.removeJob(jobId)
      ).rejects.toThrow('Failed to remove job: Remove failed');

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'DELETE',
        entityType: 'NOTIFICATION',
        entityId: 'unknown',
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const mockStats = {
        waiting: 5,
        active: 2,
        completed: 10,
        failed: 1,
        delayed: 0,
        paused: 0
      };

      mockQueue.getWaitingCount.mockResolvedValueOnce(mockStats.waiting);
      mockQueue.getActiveCount.mockResolvedValueOnce(mockStats.active);
      mockQueue.getCompletedCount.mockResolvedValueOnce(mockStats.completed);
      mockQueue.getFailedCount.mockResolvedValueOnce(mockStats.failed);
      mockQueue.getDelayedCount.mockResolvedValueOnce(mockStats.delayed);
      mockQueue.getPausedCount.mockResolvedValueOnce(mockStats.paused);

      const stats = await queueService.getQueueStats();

      expect(stats).toEqual(mockStats);
    });

    it('should handle stats retrieval errors', async () => {
      mockQueue.getWaitingCount.mockRejectedValueOnce(new Error('Stats error'));

      await expect(
        queueService.getQueueStats()
      ).rejects.toThrow('Failed to get queue stats: Stats error');
    });
  });

  describe('queue management', () => {
    it('should pause queue successfully', async () => {
      await queueService.pauseQueue();

      expect(mockQueue.pause).toHaveBeenCalled();
    });

    it('should resume queue successfully', async () => {
      await queueService.resumeQueue();

      expect(mockQueue.resume).toHaveBeenCalled();
    });

    it('should handle pause errors', async () => {
      mockQueue.pause.mockRejectedValueOnce(new Error('Pause failed'));

      await expect(
        queueService.pauseQueue()
      ).rejects.toThrow('Failed to pause queue: Pause failed');
    });

    it('should handle resume errors', async () => {
      mockQueue.resume.mockRejectedValueOnce(new Error('Resume failed'));

      await expect(
        queueService.resumeQueue()
      ).rejects.toThrow('Failed to resume queue: Resume failed');
    });
  });
}); 