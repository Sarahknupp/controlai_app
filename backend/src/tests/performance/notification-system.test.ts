import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../services/notification.service';
import { NotificationQueueService } from '../../services/notification-queue.service';
import { NotificationRetryService } from '../../services/notification-retry.service';
import { EmailService } from '../../services/email.service';
import { SmsService } from '../../services/sms.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { AuditService } from '../../services/audit.service';
import { I18nService } from '../../services/i18n.service';
import { QueueMonitorService } from '../../services/queue-monitor.service';

describe('Notification System Performance Tests', () => {
  let notificationService: NotificationService;
  let queueService: NotificationQueueService;
  let retryService: NotificationRetryService;
  let monitorService: QueueMonitorService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    phone: '+1234567890',
    pushToken: 'push-token-123',
    preferences: {
      email: true,
      sms: true,
      push: true
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        NotificationQueueService,
        NotificationRetryService,
        EmailService,
        SmsService,
        PushNotificationService,
        AuditService,
        I18nService,
        QueueMonitorService
      ]
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    queueService = module.get<NotificationQueueService>(NotificationQueueService);
    retryService = module.get<NotificationRetryService>(NotificationRetryService);
    monitorService = module.get<QueueMonitorService>(QueueMonitorService);
  });

  describe('Load Tests', () => {
    it('should handle 100 concurrent notifications', async () => {
      const startTime = Date.now();
      const notifications = Array(100).fill(null).map((_, index) => ({
        userId: mockUser.id,
        type: 'EMAIL',
        subject: `Test Notification ${index}`,
        content: `Test content ${index}`,
        priority: 'normal',
        locale: 'en'
      }));

      const results = await Promise.all(
        notifications.map(notification => 
          notificationService.sendUserNotification(notification)
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all notifications were queued
      expect(results.every(result => result.success)).toBe(true);

      // Check processing time
      expect(duration).toBeLessThan(5000); // Should process within 5 seconds

      // Verify queue metrics
      const metrics = await monitorService.getMetrics();
      expect(metrics.totalJobs).toBeGreaterThanOrEqual(100);
    });

    it('should handle mixed notification types under load', async () => {
      const startTime = Date.now();
      const notifications = Array(50).fill(null).map((_, index) => ({
        userId: mockUser.id,
        type: index % 3 === 0 ? 'EMAIL' : index % 3 === 1 ? 'SMS' : 'PUSH',
        subject: `Test Notification ${index}`,
        content: `Test content ${index}`,
        priority: index % 2 === 0 ? 'high' : 'normal',
        locale: 'en'
      }));

      const results = await Promise.all(
        notifications.map(notification => 
          notificationService.sendUserNotification(notification)
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all notifications were queued
      expect(results.every(result => result.success)).toBe(true);

      // Check processing time
      expect(duration).toBeLessThan(3000); // Should process within 3 seconds

      // Verify queue metrics
      const metrics = await monitorService.getMetrics();
      expect(metrics.jobsByType.email).toBeGreaterThan(0);
      expect(metrics.jobsByType.sms).toBeGreaterThan(0);
      expect(metrics.jobsByType.push).toBeGreaterThan(0);
    });

    it('should handle retry queue under load', async () => {
      // Simulate failed notifications
      const failedNotifications = Array(20).fill(null).map((_, index) => ({
        userId: mockUser.id,
        type: 'EMAIL',
        subject: `Failed Notification ${index}`,
        content: `Failed content ${index}`,
        priority: 'normal',
        locale: 'en'
      }));

      // Add failed notifications to retry queue
      await Promise.all(
        failedNotifications.map(notification =>
          retryService.addToRetryQueue(notification, new Error('Simulated failure'))
        )
      );

      const startTime = Date.now();
      await retryService.processRetryQueue();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check processing time
      expect(duration).toBeLessThan(2000); // Should process within 2 seconds

      // Verify retry metrics
      const metrics = await monitorService.getMetrics();
      expect(metrics.retryJobs).toBeGreaterThan(0);
    });

    it('should maintain performance with increasing queue size', async () => {
      const queueSizes = [100, 500, 1000];
      const processingTimes: number[] = [];

      for (const size of queueSizes) {
        const notifications = Array(size).fill(null).map((_, index) => ({
          userId: mockUser.id,
          type: 'EMAIL',
          subject: `Test Notification ${index}`,
          content: `Test content ${index}`,
          priority: 'normal',
          locale: 'en'
        }));

        const startTime = Date.now();
        await Promise.all(
          notifications.map(notification => 
            notificationService.sendUserNotification(notification)
          )
        );
        const endTime = Date.now();
        processingTimes.push(endTime - startTime);
      }

      // Verify that processing time doesn't grow exponentially
      const timeGrowth = processingTimes[2] / processingTimes[0];
      expect(timeGrowth).toBeLessThan(5); // Should not take more than 5x time for 10x queue size
    });
  });

  describe('Stress Tests', () => {
    it('should handle rapid notification bursts', async () => {
      const burstSize = 200;
      const notifications = Array(burstSize).fill(null).map((_, index) => ({
        userId: mockUser.id,
        type: 'EMAIL',
        subject: `Burst Notification ${index}`,
        content: `Burst content ${index}`,
        priority: 'high',
        locale: 'en'
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        notifications.map(notification => 
          notificationService.sendUserNotification(notification)
        )
      );
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verify all notifications were queued
      expect(results.every(result => result.success)).toBe(true);

      // Check processing time
      expect(duration).toBeLessThan(10000); // Should process within 10 seconds

      // Verify queue metrics
      const metrics = await monitorService.getMetrics();
      expect(metrics.totalJobs).toBeGreaterThanOrEqual(burstSize);
      expect(metrics.jobsByPriority.high).toBeGreaterThanOrEqual(burstSize);
    });

    it('should handle concurrent retries and new notifications', async () => {
      const notificationCount = 100;
      const retryCount = 50;

      // Create failed notifications for retry
      const failedNotifications = Array(retryCount).fill(null).map((_, index) => ({
        userId: mockUser.id,
        type: 'EMAIL',
        subject: `Failed Notification ${index}`,
        content: `Failed content ${index}`,
        priority: 'normal',
        locale: 'en'
      }));

      // Add failed notifications to retry queue
      await Promise.all(
        failedNotifications.map(notification =>
          retryService.addToRetryQueue(notification, new Error('Simulated failure'))
        )
      );

      // Create new notifications
      const newNotifications = Array(notificationCount).fill(null).map((_, index) => ({
        userId: mockUser.id,
        type: 'EMAIL',
        subject: `New Notification ${index}`,
        content: `New content ${index}`,
        priority: 'normal',
        locale: 'en'
      }));

      const startTime = Date.now();
      
      // Process retries and new notifications concurrently
      await Promise.all([
        retryService.processRetryQueue(),
        Promise.all(
          newNotifications.map(notification => 
            notificationService.sendUserNotification(notification)
          )
        )
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check processing time
      expect(duration).toBeLessThan(5000); // Should process within 5 seconds

      // Verify queue metrics
      const metrics = await monitorService.getMetrics();
      expect(metrics.totalJobs).toBeGreaterThanOrEqual(notificationCount + retryCount);
    });
  });
}); 