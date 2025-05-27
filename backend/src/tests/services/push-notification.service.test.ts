import { PushNotificationService } from '../../services/push-notification.service';
import { PushNotificationConfig, PushNotificationOptions } from '../../types/push-notification';
import { AuditService } from '../../services/audit.service';
import { I18nService } from '../../services/i18n.service';

// Mock dependencies
jest.mock('../../services/audit.service');
jest.mock('../../services/i18n.service');

describe('PushNotificationService', () => {
  let pushService: PushNotificationService;
  let auditService: jest.Mocked<AuditService>;
  let i18nService: jest.Mocked<I18nService>;
  let mockConfig: PushNotificationConfig;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock config
    mockConfig = {
      vapidPublicKey: 'test-public-key',
      vapidPrivateKey: 'test-private-key',
      vapidSubject: 'mailto:test@example.com',
      firebaseConfig: {
        apiKey: 'test-api-key',
        authDomain: 'test-project.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test-project.appspot.com',
        messagingSenderId: 'test-sender-id',
        appId: 'test-app-id'
      }
    };

    // Initialize service
    pushService = new PushNotificationService(mockConfig);

    // Get mocked instances
    auditService = AuditService.prototype as jest.Mocked<AuditService>;
    i18nService = I18nService.prototype as jest.Mocked<I18nService>;
  });

  describe('sendNotification', () => {
    it('should send push notification successfully', async () => {
      const options: PushNotificationOptions = {
        token: 'user-token',
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' }
      };

      await pushService.sendNotification(options);

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH_NOTIFICATION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle notification failure', async () => {
      const options: PushNotificationOptions = {
        token: 'invalid-token',
        title: 'Test Title',
        body: 'Test Body'
      };

      await expect(pushService.sendNotification(options)).rejects.toThrow();

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH_NOTIFICATION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });

    it('should send notification with translated content', async () => {
      const options: PushNotificationOptions = {
        token: 'user-token',
        title: 'notification.title',
        body: 'notification.body',
        data: { key: 'value' }
      };

      i18nService.translate.mockImplementation((key) => {
        const translations = {
          'notification.title': 'Título Traduzido',
          'notification.body': 'Corpo Traduzido'
        };
        return translations[key] || key;
      });

      await pushService.sendNotification(options);

      expect(i18nService.translate).toHaveBeenCalledWith('notification.title');
      expect(i18nService.translate).toHaveBeenCalledWith('notification.body');
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send bulk notifications successfully', async () => {
      const tokens = ['token1', 'token2', 'token3'];
      const options: PushNotificationOptions = {
        token: 'dummy-token', // Will be replaced by each token
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' }
      };

      const result = await pushService.sendBulkNotifications(tokens, options);

      expect(result.success).toBe(true);
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH_NOTIFICATION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle bulk notification failure', async () => {
      const tokens = ['invalid-token1', 'invalid-token2'];
      const options: PushNotificationOptions = {
        token: 'dummy-token', // Will be replaced by each token
        title: 'Test Title',
        body: 'Test Body'
      };

      await expect(pushService.sendBulkNotifications(tokens, options)).rejects.toThrow();

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH_NOTIFICATION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe to topic successfully', async () => {
      const tokens = ['token1', 'token2'];
      const topic = 'news';

      const result = await pushService.subscribeToTopic(tokens, topic);

      expect(result.success).toBe(true);
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH_SUBSCRIPTION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle topic subscription failure', async () => {
      const tokens = ['invalid-token'];
      const topic = 'news';

      await expect(pushService.subscribeToTopic(tokens, topic)).rejects.toThrow();

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'CREATE',
        entityType: 'PUSH_SUBSCRIPTION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe from topic successfully', async () => {
      const tokens = ['token1', 'token2'];
      const topic = 'news';

      const result = await pushService.unsubscribeFromTopic(tokens, topic);

      expect(result.success).toBe(true);
      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'DELETE',
        entityType: 'PUSH_SUBSCRIPTION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'success'
      });
    });

    it('should handle topic unsubscription failure', async () => {
      const tokens = ['invalid-token'];
      const topic = 'news';

      await expect(pushService.unsubscribeFromTopic(tokens, topic)).rejects.toThrow();

      expect(auditService.logAction).toHaveBeenCalledWith({
        action: 'DELETE',
        entityType: 'PUSH_SUBSCRIPTION',
        entityId: expect.any(String),
        userId: 'system',
        details: expect.any(String),
        status: 'error'
      });
    });
  });
}); 