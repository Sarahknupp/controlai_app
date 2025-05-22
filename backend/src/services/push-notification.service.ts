import admin from 'firebase-admin';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';

export interface PushNotificationConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export interface PushNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  priority?: 'high' | 'normal';
  ttl?: number;
}

export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PushNotificationService {
  private app: admin.app.App;
  private auditService: AuditService;

  constructor(config: PushNotificationConfig) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.privateKey,
        clientEmail: config.clientEmail
      })
    });
    this.auditService = new AuditService();
  }

  async sendNotification(options: PushNotificationOptions): Promise<PushNotificationResult> {
    try {
      const message: admin.messaging.Message = {
        token: options.token,
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl
        },
        data: options.data,
        android: {
          priority: options.priority || 'normal',
          ttl: options.ttl ? options.ttl * 1000 : undefined
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.app.messaging().send(message);

      // Log successful notification
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: response,
        userId: 'system',
        details: `Sent push notification to token ${options.token}`,
        status: 'success'
      });

      logger.info('Push notification sent successfully:', {
        messageId: response,
        token: options.token
      });

      return {
        success: true,
        messageId: response
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending push notification:', error);

      // Log failed notification
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'failed',
        userId: 'system',
        details: `Failed to send push notification to token ${options.token}: ${errorMessage}`,
        status: 'error'
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    body: string,
    options: {
      data?: Record<string, string>;
      imageUrl?: string;
      priority?: 'high' | 'normal';
      ttl?: number;
    } = {}
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
          imageUrl: options.imageUrl
        },
        data: options.data,
        android: {
          priority: options.priority || 'normal',
          ttl: options.ttl ? options.ttl * 1000 : undefined
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.app.messaging().sendMulticast(message);

      // Log multicast notification
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'multicast',
        userId: 'system',
        details: `Sent multicast push notification to ${response.successCount} devices`,
        status: response.successCount > 0 ? 'success' : 'error'
      });

      logger.info('Multicast push notification sent:', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length
      });

      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending multicast push notification:', error);

      // Log failed multicast
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'multicast_failed',
        userId: 'system',
        details: `Failed to send multicast push notification: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to send multicast push notification: ${errorMessage}`);
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await this.app.messaging().subscribeToTopic(tokens, topic);

      // Log topic subscription
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: topic,
        userId: 'system',
        details: `Subscribed ${tokens.length} devices to topic ${topic}`,
        status: 'success'
      });

      logger.info('Devices subscribed to topic:', {
        topic,
        tokenCount: tokens.length
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error subscribing to topic:', error);

      // Log failed subscription
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: topic,
        userId: 'system',
        details: `Failed to subscribe devices to topic ${topic}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to subscribe to topic: ${errorMessage}`);
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await this.app.messaging().unsubscribeFromTopic(tokens, topic);

      // Log topic unsubscription
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.NOTIFICATION,
        entityId: topic,
        userId: 'system',
        details: `Unsubscribed ${tokens.length} devices from topic ${topic}`,
        status: 'success'
      });

      logger.info('Devices unsubscribed from topic:', {
        topic,
        tokenCount: tokens.length
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error unsubscribing from topic:', error);

      // Log failed unsubscription
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.NOTIFICATION,
        entityId: topic,
        userId: 'system',
        details: `Failed to unsubscribe devices from topic ${topic}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to unsubscribe from topic: ${errorMessage}`);
    }
  }

  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    options: {
      data?: Record<string, string>;
      imageUrl?: string;
      priority?: 'high' | 'normal';
      ttl?: number;
    } = {}
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
          imageUrl: options.imageUrl
        },
        data: options.data,
        android: {
          priority: options.priority || 'normal',
          ttl: options.ttl ? options.ttl * 1000 : undefined
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.app.messaging().send(message);

      // Log topic notification
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: response,
        userId: 'system',
        details: `Sent push notification to topic ${topic}`,
        status: 'success'
      });

      logger.info('Topic push notification sent:', {
        topic,
        messageId: response
      });

      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending topic notification:', error);

      // Log failed topic notification
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'failed',
        userId: 'system',
        details: `Failed to send push notification to topic ${topic}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to send topic notification: ${errorMessage}`);
    }
  }
} 