import Bull from 'bull';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationType, NotificationPriority, Notification } from '../../types/notification';
import { QueueConfig } from '../../config/queue.config';

// Mock dependencies
jest.mock('bull');
jest.mock('../../services/notification.service');
jest.mock('../../services/audit.service');

describe('NotificationQueueService', () => {
  let queueService: NotificationQueueService;
  let notificationService: jest.Mocked<NotificationService>;
  let mockQueue: jest.Mocked<Bull.Queue>;
  let mockConfig: QueueConfig;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock config
    mockConfig = {
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'password',
        db: 0
      },
      queueName: 'notifications',
      maxRetries: 3,
      retryDelay: 1000,
      concurrency: 5
    };

    // Mock Bull queue
    mockQueue = {
      process: jest.fn(),
      add: jest.fn(),
      getWaitingCount: jest.fn(),
      getActiveCount: jest.fn(),
      getCompletedCount: jest.fn(),
      getFailedCount: jest.fn(),
      getDelayedCount: jest.fn(),
      clean: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      close: jest.fn(),
      on: jest.fn()
    } as unknown as jest.Mocked<Bull.Queue>;

    (Bull as jest.Mock).mockImplementation(() => mockQueue);

    // Initialize service
    notificationService = {
      sendNotification: jest.fn(),
      createNotification: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;
    
    queueService = new NotificationQueueService(mockConfig, notificationService);
  });

  describe('addToQueue', () => {
    it('should add notification to queue', async () => {
      const notification: Notification = {
        id: 'test-id',
        type: NotificationType.EMAIL_VERIFICATION,
        subject: 'Test',
        content: 'Test content',
        recipient: 'user@example.com',
        priority: NotificationPriority.NORMAL,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const options = {
        type: notification.type,
        subject: notification.subject,
        content: notification.content,
        recipient: notification.recipient,
        priority: notification.priority
      };

      mockQueue.add.mockResolvedValueOnce({} as Bull.Job);

      await queueService.addToQueue(notification, options);

      expect(mockQueue.add).toHaveBeenCalledWith({
        notification,
        options
      });
    });

    it('should handle queue error', async () => {
      const notification: Notification = {
        id: 'test-id',
        type: NotificationType.EMAIL_VERIFICATION,
        subject: 'Test',
        content: 'Test content',
        recipient: 'user@example.com',
        priority: NotificationPriority.NORMAL,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const options = {
        type: notification.type,
        subject: notification.subject,
        content: notification.content,
        recipient: notification.recipient,
        priority: notification.priority
      };

      mockQueue.add.mockRejectedValueOnce(new Error('Queue error'));

      await expect(queueService.addToQueue(notification, options)).rejects.toThrow('Queue error');
    });
  });

  describe('getQueueStatus', () => {
    it('should return queue status', async () => {
      mockQueue.getWaitingCount.mockResolvedValueOnce(5);
      mockQueue.getActiveCount.mockResolvedValueOnce(2);
      mockQueue.getCompletedCount.mockResolvedValueOnce(10);
      mockQueue.getFailedCount.mockResolvedValueOnce(1);
      mockQueue.getDelayedCount.mockResolvedValueOnce(0);

      const status = await queueService.getQueueStatus();

      expect(status).toEqual({
        waiting: 5,
        active: 2,
        completed: 10,
        failed: 1,
        delayed: 0
      });
    });
  });

  describe('cleanQueue', () => {
    it('should clean completed and failed jobs', async () => {
      mockQueue.clean.mockResolvedValueOnce([]);
      mockQueue.clean.mockResolvedValueOnce([]);

      await queueService.cleanQueue();

      expect(mockQueue.clean).toHaveBeenCalledWith(0, 'completed');
      expect(mockQueue.clean).toHaveBeenCalledWith(0, 'failed');
    });

    it('should handle clean error', async () => {
      mockQueue.clean.mockRejectedValueOnce(new Error('Clean error'));

      await expect(queueService.cleanQueue()).rejects.toThrow('Clean error');
    });
  });

  describe('pauseQueue', () => {
    it('should pause queue', async () => {
      mockQueue.pause.mockResolvedValueOnce();

      await queueService.pauseQueue();

      expect(mockQueue.pause).toHaveBeenCalled();
    });

    it('should handle pause error', async () => {
      mockQueue.pause.mockRejectedValueOnce(new Error('Pause error'));

      await expect(queueService.pauseQueue()).rejects.toThrow('Pause error');
    });
  });

  describe('resumeQueue', () => {
    it('should resume queue', async () => {
      mockQueue.resume.mockResolvedValueOnce();

      await queueService.resumeQueue();

      expect(mockQueue.resume).toHaveBeenCalled();
    });

    it('should handle resume error', async () => {
      mockQueue.resume.mockRejectedValueOnce(new Error('Resume error'));

      await expect(queueService.resumeQueue()).rejects.toThrow('Resume error');
    });
  });

  describe('closeQueue', () => {
    it('should close queue', async () => {
      mockQueue.close.mockResolvedValueOnce();

      await queueService.closeQueue();

      expect(mockQueue.close).toHaveBeenCalled();
    });

    it('should handle close error', async () => {
      mockQueue.close.mockRejectedValueOnce(new Error('Close error'));

      await expect(queueService.closeQueue()).rejects.toThrow('Close error');
    });
  });

  describe('queue events', () => {
    it('should handle completed event', () => {
      const job = { id: 'job-1' };
      const eventHandler = mockQueue.on.mock.calls.find(
        call => call[0] === Bull.JobStatus.COMPLETED
      )?.[1] as (job: Bull.Job) => void;

      if (eventHandler) {
        eventHandler(job as Bull.Job);
      }

      // Verify event handler was registered
      expect(mockQueue.on).toHaveBeenCalledWith(Bull.JobStatus.COMPLETED, expect.any(Function));
    });

    it('should handle failed event', () => {
      const job = { id: 'job-1' };
      const error = new Error('Job failed');
      const eventHandler = mockQueue.on.mock.calls.find(
        call => call[0] === Bull.JobStatus.FAILED
      )?.[1] as (job: Bull.Job, error: Error) => void;

      if (eventHandler) {
        eventHandler(job as Bull.Job, error);
      }

      // Verify event handler was registered
      expect(mockQueue.on).toHaveBeenCalledWith(Bull.JobStatus.FAILED, expect.any(Function));
    });

    it('should handle stalled event', () => {
      const job = { id: 'job-1' };
      const eventHandler = mockQueue.on.mock.calls.find(
        call => call[0] === Bull.JobStatus.STALLED
      )?.[1] as (job: Bull.Job) => void;

      if (eventHandler) {
        eventHandler(job as Bull.Job);
      }

      // Verify event handler was registered
      expect(mockQueue.on).toHaveBeenCalledWith(Bull.JobStatus.STALLED, expect.any(Function));
    });

    it('should handle error event', () => {
      const error = new Error('Queue error');
      const eventHandler = mockQueue.on.mock.calls.find(
        call => call[0] === 'error'
      )?.[1] as (error: Error) => void;

      if (eventHandler) {
        eventHandler(error);
      }

      // Verify event handler was registered
      expect(mockQueue.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });
}); 