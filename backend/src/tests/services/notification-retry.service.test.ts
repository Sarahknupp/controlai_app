import { NotificationRetryService } from '../../services/notification-retry.service';
import { NotificationService, Notification, NotificationType, NotificationPriority } from '../../services/notification.service';
import { AuditService } from '../../services/audit.service';

// Mock dependencies
jest.mock('../../services/notification.service');
jest.mock('../../services/audit.service');

describe('NotificationRetryService', () => {
  let retryService: NotificationRetryService;
  let notificationService: jest.Mocked<NotificationService>;
  let auditService: jest.Mocked<AuditService>;

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

    // Initialize retry service with test config
    retryService = new NotificationRetryService(notificationService, auditService, {
      maxAttempts: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffFactor: 2
    });
  });

  describe('addToRetryQueue', () => {
    it('should add notification to retry queue', async () => {
      const error = new Error('Send failed');

      await retryService.addToRetryQueue(mockNotification, error);

      const stats = retryService.getRetryStats();
      expect(stats.queueSize).toBe(1);
      expect(stats.jobs[0].notificationId).toBe(mockNotification.id);
      expect(stats.jobs[0].attempts).toBe(1);
      expect(stats.jobs[0].lastError).toBe(error.message);
    });

    it('should log retry action when adding to queue', async () => {
      const error = new Error('Send failed');

      await retryService.addToRetryQueue(mockNotification, error);

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'RETRY',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('retry processing', () => {
    it('should retry notification successfully', async () => {
      const error = new Error('Send failed');
      await retryService.addToRetryQueue(mockNotification, error);

      // Mock successful retry
      notificationService.sendUserNotification.mockResolvedValueOnce(mockNotification);

      // Wait for retry processing
      await new Promise(resolve => setTimeout(resolve, 200));

      const stats = retryService.getRetryStats();
      expect(stats.queueSize).toBe(0);
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'RETRY',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should retry with exponential backoff', async () => {
      const error = new Error('Send failed');
      await retryService.addToRetryQueue(mockNotification, error);

      // Mock failed retry
      notificationService.sendUserNotification.mockRejectedValueOnce(error);

      // Wait for first retry
      await new Promise(resolve => setTimeout(resolve, 200));

      const stats = retryService.getRetryStats();
      expect(stats.queueSize).toBe(1);
      expect(stats.jobs[0].attempts).toBe(2);
      expect(stats.jobs[0].nextAttempt.getTime()).toBeGreaterThan(Date.now() + 150);
    });

    it('should remove notification after max attempts', async () => {
      const error = new Error('Send failed');
      await retryService.addToRetryQueue(mockNotification, error);

      // Mock failed retries
      notificationService.sendUserNotification
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      // Wait for all retries
      await new Promise(resolve => setTimeout(resolve, 1000));

      const stats = retryService.getRetryStats();
      expect(stats.queueSize).toBe(0);
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'RETRY',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('queue management', () => {
    it('should clear retry queue', async () => {
      const error = new Error('Send failed');
      await retryService.addToRetryQueue(mockNotification, error);

      await retryService.clearQueue();

      const stats = retryService.getRetryStats();
      expect(stats.queueSize).toBe(0);
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'RETRY',
        entityType: 'NOTIFICATION',
        entityId: mockNotification.id,
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });

    it('should get retry statistics', async () => {
      const error = new Error('Send failed');
      await retryService.addToRetryQueue(mockNotification, error);

      const stats = retryService.getRetryStats();
      expect(stats).toEqual({
        queueSize: 1,
        jobs: [{
          notificationId: mockNotification.id,
          attempts: 1,
          nextAttempt: expect.any(Date),
          lastError: error.message
        }]
      });
    });
  });
}); 