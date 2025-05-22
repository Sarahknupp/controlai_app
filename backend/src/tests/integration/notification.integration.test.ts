import { NotificationService, NotificationType, NotificationPriority } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { SMSService } from '../../services/sms.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { AuditService } from '../../services/audit.service';

describe('Notification System Integration', () => {
  let notificationService: NotificationService;
  let emailService: EmailService;
  let smsService: SMSService;
  let pushService: PushNotificationService;
  let queueService: NotificationQueueService;
  let auditService: AuditService;

  const config = {
    email: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password'
      },
      from: process.env.SMTP_FROM || 'noreply@example.com'
    },
    sms: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || 'test-sid',
      authToken: process.env.TWILIO_AUTH_TOKEN || 'test-token',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890'
    },
    push: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
      privateKey: process.env.FIREBASE_PRIVATE_KEY || 'test-key',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'test@example.com'
    },
    queue: {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    }
  };

  beforeAll(async () => {
    // Initialize services
    emailService = new EmailService(config.email);
    smsService = new SMSService(config.sms);
    pushService = new PushNotificationService(config.push);
    auditService = new AuditService();
    queueService = new NotificationQueueService(config.queue, {} as NotificationService);
    notificationService = new NotificationService(
      config.email,
      config.sms,
      config.push,
      config.queue
    );

    // Verify connections
    await emailService.verifyConnection();
    await smsService.verifyNumber(config.sms.fromNumber);
  });

  describe('Email Notifications', () => {
    it('should send email notification through queue', async () => {
      const userId = 'test@example.com';
      const subject = 'Test Email Notification';
      const content = 'This is a test email notification.';

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        {
          type: NotificationType.EMAIL,
          priority: NotificationPriority.MEDIUM,
          useQueue: true
        }
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.EMAIL);
      expect(notification.priority).toBe(NotificationPriority.MEDIUM);

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify notification was sent
      const notifications = await notificationService.getNotifications({
        userId,
        type: NotificationType.EMAIL
      });

      expect(notifications.notifications.length).toBeGreaterThan(0);
      expect(notifications.notifications[0].subject).toBe(subject);
    });

    it('should send templated email notification', async () => {
      const userId = 'test@example.com';
      const templateId = 'payment_success';
      const variables = {
        amount: '100',
        currency: 'USD'
      };

      const notification = await notificationService.sendTemplateNotification(
        userId,
        templateId,
        variables,
        {
          type: NotificationType.EMAIL,
          priority: NotificationPriority.HIGH
        }
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.EMAIL);
      expect(notification.content).toContain('100');
      expect(notification.content).toContain('USD');
    });
  });

  describe('SMS Notifications', () => {
    it('should send SMS notification through queue', async () => {
      const userId = '+9876543210';
      const subject = 'Test SMS Notification';
      const content = 'This is a test SMS notification.';

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        {
          type: NotificationType.SMS,
          priority: NotificationPriority.HIGH,
          useQueue: true
        }
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.SMS);
      expect(notification.priority).toBe(NotificationPriority.HIGH);

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify notification was sent
      const notifications = await notificationService.getNotifications({
        userId,
        type: NotificationType.SMS
      });

      expect(notifications.notifications.length).toBeGreaterThan(0);
      expect(notifications.notifications[0].subject).toBe(subject);
    });

    it('should send templated SMS notification', async () => {
      const userId = '+9876543210';
      const templateId = 'order_status';
      const variables = {
        orderId: '12345',
        status: 'shipped'
      };

      const notification = await notificationService.sendTemplateNotification(
        userId,
        templateId,
        variables,
        {
          type: NotificationType.SMS,
          priority: NotificationPriority.HIGH
        }
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.SMS);
      expect(notification.content).toContain('12345');
      expect(notification.content).toContain('shipped');
    });
  });

  describe('Push Notifications', () => {
    it('should send push notification through queue', async () => {
      const userId = 'device-token';
      const subject = 'Test Push Notification';
      const content = 'This is a test push notification.';

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content,
        {
          type: NotificationType.PUSH,
          priority: NotificationPriority.URGENT,
          useQueue: true
        }
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.PUSH);
      expect(notification.priority).toBe(NotificationPriority.URGENT);

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify notification was sent
      const notifications = await notificationService.getNotifications({
        userId,
        type: NotificationType.PUSH
      });

      expect(notifications.notifications.length).toBeGreaterThan(0);
      expect(notifications.notifications[0].subject).toBe(subject);
    });

    it('should send templated push notification', async () => {
      const userId = 'device-token';
      const templateId = 'special_offer';
      const variables = {
        offerDescription: '50% off on all items',
        promoCode: 'SUMMER50'
      };

      const notification = await notificationService.sendTemplateNotification(
        userId,
        templateId,
        variables,
        {
          type: NotificationType.PUSH,
          priority: NotificationPriority.HIGH
        }
      );

      expect(notification).toBeDefined();
      expect(notification.type).toBe(NotificationType.PUSH);
      expect(notification.content).toContain('50% off');
      expect(notification.content).toContain('SUMMER50');
    });
  });

  describe('Notification Management', () => {
    it('should mark notification as read', async () => {
      const userId = 'test@example.com';
      const subject = 'Test Notification';
      const content = 'This is a test notification.';

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content
      );

      const updatedNotification = await notificationService.markAsRead(notification.id);

      expect(updatedNotification.read).toBe(true);
    });

    it('should delete notification', async () => {
      const userId = 'test@example.com';
      const subject = 'Test Notification';
      const content = 'This is a test notification.';

      const notification = await notificationService.sendUserNotification(
        userId,
        subject,
        content
      );

      await notificationService.deleteNotification(notification.id);

      const notifications = await notificationService.getNotifications({
        userId
      });

      expect(notifications.notifications.find(n => n.id === notification.id)).toBeUndefined();
    });
  });
}); 