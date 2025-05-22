import admin from 'firebase-admin';
import { PushNotificationService, PushNotificationConfig } from '../../services/push-notification.service';
import { AuditService } from '../../services/audit.service';

// Mock dependencies
jest.mock('firebase-admin');
jest.mock('../../services/audit.service');

describe('PushNotificationService', () => {
  let pushService: PushNotificationService;
  let mockMessaging: jest.Mocked<admin.messaging.Messaging>;
  let auditService: jest.Mocked<AuditService>;

  const mockConfig: PushNotificationConfig = {
    projectId: 'test-project',
    privateKey: 'test-key',
    clientEmail: 'test@example.com'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock Firebase Admin
    mockMessaging = {
      send: jest.fn(),
      sendMulticast: jest.fn(),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn()
    } as any;

    (admin.messaging as jest.Mock).mockReturnValue(mockMessaging);

    // Initialize services
    auditService = new AuditService() as jest.Mocked<AuditService>;
    pushService = new PushNotificationService(mockConfig);
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const notificationOptions = {
        token: 'device-token',
        title: 'Test Notification',
        body: 'Test content',
        data: {
          key: 'value'
        }
      };

      mockMessaging.send.mockResolvedValueOnce('message-id');

      const result = await pushService.sendNotification(notificationOptions);

      expect(result.success).toBe(true);
      expect(mockMessaging.send).toHaveBeenCalledWith({
        token: notificationOptions.token,
        notification: {
          title: notificationOptions.title,
          body: notificationOptions.body
        },
        data: notificationOptions.data
      });
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle notification sending errors', async () => {
      const notificationOptions = {
        token: 'device-token',
        title: 'Test Notification',
        body: 'Test content'
      };

      mockMessaging.send.mockRejectedValueOnce(new Error('Send failed'));

      const result = await pushService.sendNotification(notificationOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send push notification: Send failed');
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });

    it('should send notification with image', async () => {
      const notificationOptions = {
        token: 'device-token',
        title: 'Test Notification',
        body: 'Test content',
        imageUrl: 'https://example.com/image.jpg'
      };

      mockMessaging.send.mockResolvedValueOnce('message-id');

      await pushService.sendNotification(notificationOptions);

      expect(mockMessaging.send).toHaveBeenCalledWith({
        token: notificationOptions.token,
        notification: {
          title: notificationOptions.title,
          body: notificationOptions.body,
          imageUrl: notificationOptions.imageUrl
        }
      });
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send bulk notifications successfully', async () => {
      const tokens = ['token1', 'token2', 'token3'];
      const notificationOptions = {
        title: 'Test Notification',
        body: 'Test content'
      };

      mockMessaging.sendMulticast.mockResolvedValueOnce({
        successCount: 2,
        failureCount: 1,
        responses: [
          { success: true, messageId: 'msg1' },
          { success: true, messageId: 'msg2' },
          { success: false, error: new Error('Failed') }
        ]
      });

      const result = await pushService.sendBulkNotifications(tokens, notificationOptions);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(mockMessaging.sendMulticast).toHaveBeenCalledWith({
        tokens,
        notification: {
          title: notificationOptions.title,
          body: notificationOptions.body
        }
      });
    });

    it('should handle bulk notification errors', async () => {
      const tokens = ['token1', 'token2'];
      const notificationOptions = {
        title: 'Test Notification',
        body: 'Test content'
      };

      mockMessaging.sendMulticast.mockRejectedValueOnce(new Error('Bulk send failed'));

      const result = await pushService.sendBulkNotifications(tokens, notificationOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send bulk notifications: Bulk send failed');
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe to topic successfully', async () => {
      const tokens = ['token1', 'token2'];
      const topic = 'news';

      mockMessaging.subscribeToTopic.mockResolvedValueOnce({
        successCount: 2,
        failureCount: 0
      });

      const result = await pushService.subscribeToTopic(tokens, topic);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(mockMessaging.subscribeToTopic).toHaveBeenCalledWith(tokens, topic);
    });

    it('should handle subscription errors', async () => {
      const tokens = ['token1'];
      const topic = 'news';

      mockMessaging.subscribeToTopic.mockRejectedValueOnce(new Error('Subscribe failed'));

      const result = await pushService.subscribeToTopic(tokens, topic);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to subscribe to topic: Subscribe failed');
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe from topic successfully', async () => {
      const tokens = ['token1', 'token2'];
      const topic = 'news';

      mockMessaging.unsubscribeFromTopic.mockResolvedValueOnce({
        successCount: 2,
        failureCount: 0
      });

      const result = await pushService.unsubscribeFromTopic(tokens, topic);

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(mockMessaging.unsubscribeFromTopic).toHaveBeenCalledWith(tokens, topic);
    });

    it('should handle unsubscription errors', async () => {
      const tokens = ['token1'];
      const topic = 'news';

      mockMessaging.unsubscribeFromTopic.mockRejectedValueOnce(new Error('Unsubscribe failed'));

      const result = await pushService.unsubscribeFromTopic(tokens, topic);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to unsubscribe from topic: Unsubscribe failed');
    });
  });
}); 