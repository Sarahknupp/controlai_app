import { NotificationService } from '../../services/notification.service';
import { NotificationType, NotificationPriority } from '../../types/notification';
import { EmailService } from '../../services/email.service';
import { SMSService } from '../../services/sms.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { AuditService } from '../../services/audit.service';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { NotificationRetryService } from '../../services/notification-retry.service';
import { I18nService } from '../../services/i18n.service';

// Mock dependencies
jest.mock('../../services/email.service');
jest.mock('../../services/sms.service');
jest.mock('../../services/push-notification.service');
jest.mock('../../services/audit.service');
jest.mock('../../services/notification-queue.service');
jest.mock('../../services/notification-retry.service');
jest.mock('../../services/i18n.service');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let emailService: jest.Mocked<EmailService>;
  let smsService: jest.Mocked<SMSService>;
  let pushService: jest.Mocked<PushNotificationService>;
  let auditService: jest.Mocked<AuditService>;
  let queueService: jest.Mocked<NotificationQueueService>;
  let retryService: jest.Mocked<NotificationRetryService>;
  let i18nService: jest.Mocked<I18nService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize service
    notificationService = NotificationService.getInstance();

    // Get mocked instances
    emailService = EmailService.prototype as jest.Mocked<EmailService>;
    smsService = SMSService.prototype as jest.Mocked<SMSService>;
    pushService = PushNotificationService.prototype as jest.Mocked<PushNotificationService>;
    auditService = AuditService.prototype as jest.Mocked<AuditService>;
    queueService = NotificationQueueService.prototype as jest.Mocked<NotificationQueueService>;
    retryService = NotificationRetryService.prototype as jest.Mocked<NotificationRetryService>;
    i18nService = I18nService.prototype as jest.Mocked<I18nService>;
  });

  describe('createNotification', () => {
    it('should create and send an email notification', async () => {
      const options = {
        type: NotificationType.WELCOME,
        subject: 'Welcome',
        content: 'Welcome to our platform',
        recipient: 'user@example.com',
        priority: NotificationPriority.NORMAL
      };

      await notificationService.createNotification(options);

      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: options.recipient,
        subject: options.subject,
        html: options.content
      });
    });

    it('should create and send a push notification', async () => {
      const options = {
        type: NotificationType.SECURITY_ALERT,
        subject: 'Security Alert',
        content: 'Your account has been locked',
        recipient: 'user@example.com',
        priority: NotificationPriority.HIGH
      };

      await notificationService.createNotification(options);

      expect(pushService.sendNotification).toHaveBeenCalledWith({
        to: options.recipient,
        title: options.subject,
        body: options.content,
        data: undefined
      });
    });

    it('should store in-app notification', async () => {
      const options = {
        type: NotificationType.IN_APP,
        subject: 'In-App Notification',
        content: 'This is an in-app notification',
        recipient: 'user@example.com',
        priority: NotificationPriority.NORMAL
      };

      await notificationService.createNotification(options);

      const notifications = await notificationService.getNotifications({});
      expect(notifications.notifications).toHaveLength(1);
      expect(notifications.notifications[0].type).toBe(NotificationType.IN_APP);
    });

    it('should handle notification failure and add to retry queue', async () => {
      const options = {
        type: NotificationType.EMAIL_VERIFICATION,
        subject: 'Verify Email',
        content: 'Please verify your email',
        recipient: 'user@example.com',
        priority: NotificationPriority.NORMAL
      };

      emailService.sendEmail.mockRejectedValueOnce(new Error('Failed to send email'));

      await expect(notificationService.createNotification(options)).rejects.toThrow('Failed to send email');
      expect(retryService.addToRetryQueue).toHaveBeenCalled();
    });
  });

  describe('getNotifications', () => {
    it('should filter notifications by type', async () => {
      // Add test notifications
      await notificationService.createNotification({
        type: NotificationType.WELCOME,
        subject: 'Welcome',
        content: 'Welcome',
        recipient: 'user@example.com'
      });

      await notificationService.createNotification({
        type: NotificationType.SECURITY_ALERT,
        subject: 'Alert',
        content: 'Alert',
        recipient: 'user@example.com'
      });

      const result = await notificationService.getNotifications({
        type: NotificationType.WELCOME
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].type).toBe(NotificationType.WELCOME);
    });

    it('should filter notifications by priority', async () => {
      await notificationService.createNotification({
        type: NotificationType.SYSTEM_ALERT,
        subject: 'High Priority',
        content: 'High Priority Alert',
        recipient: 'user@example.com',
        priority: NotificationPriority.HIGH
      });

      const result = await notificationService.getNotifications({
        priority: NotificationPriority.HIGH
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].priority).toBe(NotificationPriority.HIGH);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const options = {
        type: NotificationType.IN_APP,
        subject: 'Test',
        content: 'Test',
        recipient: 'user@example.com'
      };

      await notificationService.createNotification(options);
      const notifications = await notificationService.getNotifications({});
      const notificationId = notifications.notifications[0].id;

      await notificationService.markAsRead(notificationId);

      const updatedNotifications = await notificationService.getNotifications({});
      expect(updatedNotifications.notifications[0].read).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const options = {
        type: NotificationType.IN_APP,
        subject: 'Test',
        content: 'Test',
        recipient: 'user@example.com'
      };

      await notificationService.createNotification(options);
      const notifications = await notificationService.getNotifications({});
      const notificationId = notifications.notifications[0].id;

      await notificationService.deleteNotification(notificationId);

      const updatedNotifications = await notificationService.getNotifications({});
      expect(updatedNotifications.notifications).toHaveLength(0);
    });
  });

  describe('templates', () => {
    it('should get template by id', async () => {
      const template = await notificationService.getTemplate('welcome');
      expect(template).toBeDefined();
      expect(template?.id).toBe('welcome');
    });

    it('should process template with variables', async () => {
      const variables = {
        userName: 'John',
        verificationUrl: 'http://example.com/verify'
      };

      const content = await notificationService.processTemplate('welcome', variables);
      expect(content).toContain('John');
      expect(content).toContain('http://example.com/verify');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        notificationService.processTemplate('non-existent', {})
      ).rejects.toThrow('Template not found: non-existent');
    });
  });
}); 