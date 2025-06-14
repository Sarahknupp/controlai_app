import { NotificationRetryService } from '../../services/notification-retry.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationType, NotificationPriority, Notification } from '../../types/notification';
import { QueueConfig } from '../../config/queue.config';

// Mock dependencies
jest.mock('../../services/notification.service');

describe('NotificationRetryService', () => {
  let retryService: NotificationRetryService;
  let notificationService: jest.Mocked<NotificationService>;
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

    // Initialize service
    retryService = NotificationRetryService.getInstance(mockConfig);

    // Get mocked instances
    notificationService = NotificationService.prototype as jest.Mocked<NotificationService>;
  });

  describe('addToRetryQueue', () => {
    it('should add notification to retry queue', async () => {
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

      await retryService.addToRetryQueue(notification, 'Test error');

      const queue = retryService.getRetryQueue();
      expect(queue.has(notification.id)).toBe(true);
      expect(queue.get(notification.id)?.retryCount).toBe(0);
    });
  });

  describe('processRetryQueue', () => {
    it('should process notification successfully', async () => {
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

      await retryService.addToRetryQueue(notification, 'Test error');
      notificationService.createNotification.mockResolvedValueOnce();

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1100));

      const queue = retryService.getRetryQueue();
      expect(queue.has(notification.id)).toBe(false);
      expect(notificationService.createNotification).toHaveBeenCalledWith({
        type: notification.type,
        subject: notification.subject,
        content: notification.content,
        recipient: notification.recipient,
        priority: notification.priority
      });
    });

    it('should handle processing failure and increment retry count', async () => {
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

      await retryService.addToRetryQueue(notification, 'Test error');
      notificationService.createNotification.mockRejectedValueOnce(new Error('Failed to send'));

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1100));

      const queue = retryService.getRetryQueue();
      expect(queue.has(notification.id)).toBe(true);
      expect(queue.get(notification.id)?.retryCount).toBe(1);
    });

    it('should remove notification after max retries', async () => {
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

      await retryService.addToRetryQueue(notification, 'Test error');
      notificationService.createNotification.mockRejectedValue(new Error('Failed to send'));

      // Process max retries
      for (let i = 0; i < mockConfig.maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }

      const queue = retryService.getRetryQueue();
      expect(queue.has(notification.id)).toBe(false);
    });
  });

  describe('clearRetryQueue', () => {
    it('should clear retry queue', async () => {
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

      await retryService.addToRetryQueue(notification, 'Test error');
      retryService.clearRetryQueue();

      const queue = retryService.getRetryQueue();
      expect(queue.size).toBe(0);
    });
  });

  describe('getRetryQueue', () => {
    it('should return retry queue', async () => {
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

      await retryService.addToRetryQueue(notification, 'Test error');

      const queue = retryService.getRetryQueue();
      expect(queue).toBeInstanceOf(Map);
      expect(queue.has(notification.id)).toBe(true);
    });
  });
}); 