import { NotificationService, NotificationType, NotificationPriority } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { SMSService } from '../../services/sms.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { AuditService } from '../../services/audit.service';

// Mock dependencies
jest.mock('../../services/email.service');
jest.mock('../../services/sms.service');
jest.mock('../../services/push-notification.service');
jest.mock('../../services/notification-queue.service');
jest.mock('../../services/audit.service');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let emailService: jest.Mocked<EmailService>;
  let smsService: jest.Mocked<SMSService>;
  let pushService: jest.Mocked<PushNotificationService>;
  let queueService: jest.Mocked<NotificationQueueService>;
  let auditService: jest.Mocked<AuditService>;

  const mockConfig = {
    email: {
      host: 'smtp.example.com',
      port: 587,
      secure: true,
      auth: {
        user: 'test@example.com',
        pass: 'password'
      }
    },
    sms: {
      accountSid: 'test-sid',
      authToken: 'test-token',
      fromNumber: '+1234567890'
    },
    push: {
      projectId: 'test-project',
      privateKey: 'test-key',
      clientEmail: 'test@example.com'
    },
    queue: {
      redis: {
        host: 'localhost',
        port: 6379
      }
    }
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Initialize services with mocked dependencies
    emailService = new EmailService(mockConfig.email) as jest.Mocked<EmailService>;
    smsService = new SMSService(mockConfig.sms) as jest.Mocked<SMSService>;
    pushService = new PushNotificationService(mockConfig.push) as jest.Mocked<PushNotificationService>;
    queueService = new NotificationQueueService(mockConfig.queue, {} as NotificationService) as jest.Mocked<NotificationQueueService>;
    auditService = new AuditService() as jest.Mocked<AuditService>;

    notificationService = new NotificationService(
      mockConfig.email,
      mockConfig.sms,
      mockConfig.push,
      mockConfig.queue
    );
  });

  describe('sendUserNotification', () => {
    it('should send an email notification successfully', async () => {
      const userId = 'user123';
      const subject = 'Test Email';
      const content = 'Test content';
      const options = {
        type: NotificationType.EMAIL,
        priority: NotificationPriority.MEDIUM
      };

      emailService.sendEmail.mockResolvedValueOnce();

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        options
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.EMAIL);
      expect(notification.priority).toBe(NotificationPriority.MEDIUM);
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: userId,
        subject,
        html: content
      });
    });

    it('should send an SMS notification successfully', async () => {
      const userId = 'user123';
      const subject = 'Test SMS';
      const content = 'Test content';
      const options = {
        type: NotificationType.SMS,
        priority: NotificationPriority.HIGH
      };

      smsService.sendSMS.mockResolvedValueOnce();

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        options
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.SMS);
      expect(notification.priority).toBe(NotificationPriority.HIGH);
      expect(smsService.sendSMS).toHaveBeenCalledWith({
        to: userId,
        message: content
      });
    });

    it('should send a push notification successfully', async () => {
      const userId = 'user123';
      const subject = 'Test Push';
      const content = 'Test content';
      const options = {
        type: NotificationType.PUSH,
        priority: NotificationPriority.URGENT
      };

      pushService.sendNotification.mockResolvedValueOnce({ success: true });

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        options
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.PUSH);
      expect(notification.priority).toBe(NotificationPriority.URGENT);
      expect(pushService.sendNotification).toHaveBeenCalledWith({
        token: userId,
        title: subject,
        body: content,
        priority: 'high'
      });
    });

    it('should send a notification through queue when useQueue is true', async () => {
      const userId = 'user123';
      const subject = 'Test Queue';
      const content = 'Test content';
      const options = {
        type: NotificationType.EMAIL,
        priority: NotificationPriority.MEDIUM,
        useQueue: true
      };

      queueService.addToQueue.mockResolvedValueOnce({} as any);

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        options
      );

      expect(notification).toBeDefined();
      expect(queueService.addToQueue).toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle notification sending errors', async () => {
      const userId = 'user123';
      const subject = 'Test Error';
      const content = 'Test content';
      const options = {
        type: NotificationType.EMAIL
      };

      emailService.sendEmail.mockRejectedValueOnce(new Error('Send failed'));

      await expect(
        notificationService.sendUserNotification(userId, subject, content, options)
      ).rejects.toThrow('Failed to send notification: Send failed');
    });
  });

  describe('sendTemplateNotification', () => {
    it('should send a template notification successfully', async () => {
      const userId = 'user123';
      const templateId = 'payment_success';
      const variables = {
        amount: '100',
        currency: 'USD'
      };

      emailService.sendEmail.mockResolvedValueOnce();

      const notification = await notificationService.sendTemplateNotification(
        userId,
        templateId,
        variables
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.EMAIL);
      expect(notification.content).toContain('100');
      expect(notification.content).toContain('USD');
    });

    it('should throw error for missing template', async () => {
      const userId = 'user123';
      const templateId = 'non_existent_template';
      const variables = {};

      await expect(
        notificationService.sendTemplateNotification(userId, templateId, variables)
      ).rejects.toThrow('Notification template not found: non_existent_template');
    });

    it('should throw error for missing required variables', async () => {
      const userId = 'user123';
      const templateId = 'payment_success';
      const variables = {
        amount: '100'
        // Missing currency
      };

      await expect(
        notificationService.sendTemplateNotification(userId, templateId, variables)
      ).rejects.toThrow('Missing required variables: currency');
    });
  });

  describe('getNotifications', () => {
    it('should return filtered notifications', async () => {
      const userId = 'user123';
      const filters = {
        userId,
        type: NotificationType.EMAIL,
        read: false
      };

      const result = await notificationService.getNotifications(filters);

      expect(result).toBeDefined();
      expect(result.notifications).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification123';

      const notification = await notificationService.markAsRead(notificationId);

      expect(notification).toBeDefined();
      expect(notification.read).toBe(true);
    });

    it('should throw error for non-existent notification', async () => {
      const notificationId = 'non_existent_notification';

      await expect(
        notificationService.markAsRead(notificationId)
      ).rejects.toThrow(`Notification not found: ${notificationId}`);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const notificationId = 'notification123';

      await expect(
        notificationService.deleteNotification(notificationId)
      ).resolves.not.toThrow();
    });

    it('should throw error for non-existent notification', async () => {
      const notificationId = 'non_existent_notification';

      await expect(
        notificationService.deleteNotification(notificationId)
      ).rejects.toThrow(`Notification not found: ${notificationId}`);
    });
  });
}); 