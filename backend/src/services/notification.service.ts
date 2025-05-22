import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { EmailService, EmailConfig } from './email.service';
import { AuditService } from './audit.service';
import { SMSService, SMSConfig } from './sms.service';
import { PushNotificationService, PushNotificationConfig } from './push-notification.service';
import { NotificationQueueService, QueueConfig } from './notification-queue.service';
import { AuditAction, EntityType } from '../types/audit';
import { NotificationRetryService } from './notification-retry.service';
import { I18nService } from './i18n.service';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  subject: string;
  content: string;
  variables: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  subject: string;
  content: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationResult {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export class NotificationService {
  private notifications: Map<string, Notification>;
  private templates: Map<string, NotificationTemplate>;
  private emailService: EmailService;
  private smsService: SMSService;
  private pushService: PushNotificationService;
  private queueService: NotificationQueueService;
  private auditService: AuditService;
  private retryService: NotificationRetryService;
  private i18nService: I18nService;

  constructor(
    emailConfig: EmailConfig,
    smsConfig: SMSConfig,
    pushConfig: PushNotificationConfig,
    queueConfig: QueueConfig,
    auditService: AuditService,
    retryService: NotificationRetryService,
    i18nService: I18nService
  ) {
    this.notifications = new Map();
    this.templates = new Map();
    this.emailService = new EmailService(emailConfig);
    this.smsService = new SMSService(smsConfig);
    this.pushService = new PushNotificationService(pushConfig);
    this.auditService = auditService;
    this.queueService = new NotificationQueueService(queueConfig, this);
    this.retryService = retryService;
    this.i18nService = i18nService;
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Initialize default notification templates
    const templates: NotificationTemplate[] = [
      // Payment related templates
      {
        id: 'payment_success',
        type: NotificationType.EMAIL,
        subject: 'Payment Successful',
        content: 'Your payment of {{amount}} {{currency}} has been processed successfully.',
        variables: ['amount', 'currency']
      },
      {
        id: 'payment_refund',
        type: NotificationType.EMAIL,
        subject: 'Payment Refunded',
        content: 'Your payment of {{amount}} {{currency}} has been refunded.',
        variables: ['amount', 'currency']
      },
      {
        id: 'payment_failed',
        type: NotificationType.EMAIL,
        subject: 'Payment Failed',
        content: 'Your payment of {{amount}} {{currency}} has failed. Please try again or contact support.',
        variables: ['amount', 'currency']
      },
      {
        id: 'payment_pending',
        type: NotificationType.EMAIL,
        subject: 'Payment Pending',
        content: 'Your payment of {{amount}} {{currency}} is pending. We will notify you once it is processed.',
        variables: ['amount', 'currency']
      },

      // Order related templates
      {
        id: 'order_created',
        type: NotificationType.EMAIL,
        subject: 'Order Confirmation',
        content: 'Your order #{{orderId}} has been created successfully. Total amount: {{amount}} {{currency}}',
        variables: ['orderId', 'amount', 'currency']
      },
      {
        id: 'order_status',
        type: NotificationType.IN_APP,
        subject: 'Order Status Update',
        content: 'Your order #{{orderId}} status has been updated to {{status}}.',
        variables: ['orderId', 'status']
      },
      {
        id: 'order_shipped',
        type: NotificationType.EMAIL,
        subject: 'Order Shipped',
        content: 'Your order #{{orderId}} has been shipped. Tracking number: {{trackingNumber}}',
        variables: ['orderId', 'trackingNumber']
      },
      {
        id: 'order_delivered',
        type: NotificationType.EMAIL,
        subject: 'Order Delivered',
        content: 'Your order #{{orderId}} has been delivered. Thank you for your purchase!',
        variables: ['orderId']
      },
      {
        id: 'order_cancelled',
        type: NotificationType.EMAIL,
        subject: 'Order Cancelled',
        content: 'Your order #{{orderId}} has been cancelled. If you did not request this cancellation, please contact support.',
        variables: ['orderId']
      },

      // Inventory related templates
      {
        id: 'low_stock',
        type: NotificationType.IN_APP,
        subject: 'Low Stock Alert',
        content: 'Product {{productName}} is running low on stock. Current quantity: {{quantity}}',
        variables: ['productName', 'quantity']
      },
      {
        id: 'out_of_stock',
        type: NotificationType.IN_APP,
        subject: 'Out of Stock Alert',
        content: 'Product {{productName}} is out of stock. Expected restock date: {{restockDate}}',
        variables: ['productName', 'restockDate']
      },
      {
        id: 'back_in_stock',
        type: NotificationType.EMAIL,
        subject: 'Product Back in Stock',
        content: '{{productName}} is back in stock! Click here to view: {{productUrl}}',
        variables: ['productName', 'productUrl']
      },

      // User account related templates
      {
        id: 'welcome',
        type: NotificationType.EMAIL,
        subject: 'Welcome to Our Platform',
        content: 'Welcome {{userName}}! Thank you for joining us. Get started by exploring our products.',
        variables: ['userName']
      },
      {
        id: 'password_reset',
        type: NotificationType.EMAIL,
        subject: 'Password Reset Request',
        content: 'You have requested to reset your password. Click here to reset: {{resetUrl}}',
        variables: ['resetUrl']
      },
      {
        id: 'email_verification',
        type: NotificationType.EMAIL,
        subject: 'Verify Your Email',
        content: 'Please verify your email address by clicking here: {{verificationUrl}}',
        variables: ['verificationUrl']
      },
      {
        id: 'account_locked',
        type: NotificationType.EMAIL,
        subject: 'Account Locked',
        content: 'Your account has been locked due to multiple failed login attempts. Please contact support.',
        variables: []
      },

      // Promotional templates
      {
        id: 'special_offer',
        type: NotificationType.EMAIL,
        subject: 'Special Offer',
        content: 'Special offer just for you! {{offerDescription}} Use code: {{promoCode}}',
        variables: ['offerDescription', 'promoCode']
      },
      {
        id: 'price_drop',
        type: NotificationType.EMAIL,
        subject: 'Price Drop Alert',
        content: 'The price of {{productName}} has dropped to {{newPrice}} {{currency}}!',
        variables: ['productName', 'newPrice', 'currency']
      },
      {
        id: 'abandoned_cart',
        type: NotificationType.EMAIL,
        subject: 'Complete Your Purchase',
        content: 'You have items in your cart waiting for you. Complete your purchase now!',
        variables: []
      },

      // System related templates
      {
        id: 'system_maintenance',
        type: NotificationType.IN_APP,
        subject: 'System Maintenance',
        content: 'The system will be under maintenance from {{startTime}} to {{endTime}}. Some features may be unavailable.',
        variables: ['startTime', 'endTime']
      },
      {
        id: 'security_alert',
        type: NotificationType.EMAIL,
        subject: 'Security Alert',
        content: 'We detected a login attempt from a new device. If this was you, please verify your account.',
        variables: []
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async sendUserNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    locale: string = 'en'
  ): Promise<void> {
    try {
      const notification = {
        userId,
        type,
        data,
        priority,
        locale
      };

      // Add to queue
      await this.queueService.addToQueue(notification);

      // Log action
      await this.auditService.logAction({
        action: 'notification_queued',
        entityType: 'notification',
        entityId: userId,
        details: `Notification of type ${type} queued for user ${userId}`,
        status: 'success'
      });
    } catch (error) {
      // Add to retry queue if sending fails
      await this.retryService.addToRetryQueue(notification);

      // Log error
      await this.auditService.logAction({
        action: 'notification_error',
        entityType: 'notification',
        entityId: userId,
        details: `Failed to queue notification of type ${type} for user ${userId}`,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  async processNotification(notification: any): Promise<void> {
    const { userId, type, data, priority, locale } = notification;

    try {
      // Get translated template
      const template = this.getNotificationTemplate(type, locale);
      const translatedSubject = this.i18nService.translate(
        `${type}.subject`,
        locale,
        data
      );
      const translatedContent = this.i18nService.translate(
        `${type}.content`,
        locale,
        data
      );

      // Send notification based on type
      switch (type) {
        case NotificationType.EMAIL:
          await this.emailService.sendEmail(userId, translatedSubject, translatedContent);
          break;
        case NotificationType.SMS:
          await this.smsService.sendSMS(userId, translatedContent);
          break;
        case NotificationType.PUSH:
          await this.pushService.sendNotification(userId, translatedSubject, translatedContent);
          break;
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }

      // Log success
      await this.auditService.logAction({
        action: 'notification_sent',
        entityType: 'notification',
        entityId: userId,
        details: `Notification of type ${type} sent to user ${userId}`,
        status: 'success'
      });
    } catch (error) {
      // Add to retry queue
      await this.retryService.addToRetryQueue(notification);

      // Log error
      await this.auditService.logAction({
        action: 'notification_error',
        entityType: 'notification',
        entityId: userId,
        details: `Failed to send notification of type ${type} to user ${userId}`,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private getNotificationTemplate(type: NotificationType, locale: string): string {
    // This method can be expanded to load templates from a database or file system
    return `${type}_template`;
  }

  async getRetryStats(): Promise<any> {
    return this.retryService.getRetryStats();
  }

  async clearRetryQueue(): Promise<void> {
    await this.retryService.clearRetryQueue();
  }
} 