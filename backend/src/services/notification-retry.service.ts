import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';
import { logger } from '../utils/logger';
import { Notification } from '../types/notification';
import { AuditAction, EntityType } from '../types/audit';
import { QueueConfig } from '../config/queue.config';
import { NotificationRetryOptions } from '../types/notification';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface RetryJob {
  notification: Notification;
  attempts: number;
  nextAttempt: Date;
  lastError?: string;
}

export class NotificationRetryService {
  private static instance: NotificationRetryService;
  private retryQueue: Map<string, NotificationRetryOptions>;
  private config: QueueConfig;
  private isProcessing: boolean;
  private processingInterval: NodeJS.Timeout | null;

  private constructor(config: QueueConfig) {
    this.retryQueue = new Map();
    this.config = config;
    this.isProcessing = false;
    this.processingInterval = null;
    this.startRetryProcessor();
  }

  public static getInstance(config: QueueConfig): NotificationRetryService {
    if (!NotificationRetryService.instance) {
      NotificationRetryService.instance = new NotificationRetryService(config);
    }
    return NotificationRetryService.instance;
  }

  /**
   * Add a failed notification to the retry queue
   */
  public async addToRetryQueue(notification: Notification, error: string): Promise<void> {
    const retryOptions: NotificationRetryOptions = {
      notification,
      error,
      retryCount: 0,
      nextRetryAt: new Date(Date.now() + this.config.retryDelay)
    };

    this.retryQueue.set(notification.id, retryOptions);
    logger.info(`Added notification ${notification.id} to retry queue`, { retryOptions });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Start processing the retry queue
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processingInterval = setInterval(() => this.processRetryQueue(), 1000);
  }

  /**
   * Stop processing the retry queue
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
  }

  /**
   * Process the retry queue
   */
  private async processRetryQueue(): Promise<void> {
    const now = new Date();
    const retries = Array.from(this.retryQueue.entries());

    for (const [notificationId, retryOptions] of retries) {
      if (retryOptions.nextRetryAt <= now) {
        try {
          if (retryOptions.retryCount >= this.config.maxRetries) {
            logger.error(`Max retries exceeded for notification ${notificationId}`, {
              error: retryOptions.error,
              retryCount: retryOptions.retryCount
            });
            this.retryQueue.delete(notificationId);
            continue;
          }

          const notificationService = NotificationService.getInstance();
          await notificationService.createNotification({
            type: retryOptions.notification.type,
            subject: retryOptions.notification.subject,
            content: retryOptions.notification.content,
            recipient: retryOptions.notification.recipient,
            metadata: retryOptions.notification.metadata,
            priority: retryOptions.notification.priority
          });

          logger.info(`Successfully retried notification ${notificationId}`, {
            retryCount: retryOptions.retryCount
          });
          this.retryQueue.delete(notificationId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Failed to retry notification ${notificationId}`, {
            error: errorMessage,
            retryCount: retryOptions.retryCount
          });

          retryOptions.retryCount++;
          retryOptions.nextRetryAt = new Date(
            Date.now() + this.config.retryDelay * Math.pow(2, retryOptions.retryCount)
          );
          this.retryQueue.set(notificationId, retryOptions);
        }
      }
    }

    // Stop processing if queue is empty
    if (this.retryQueue.size === 0) {
      this.stopProcessing();
    }
  }

  /**
   * Get retry statistics
   */
  getRetryStats(): {
    queueSize: number;
    jobs: Array<{
      notificationId: string;
      attempts: number;
      nextAttempt: Date;
      lastError?: string;
    }>;
  } {
    return {
      queueSize: this.retryQueue.size,
      jobs: Array.from(this.retryQueue.entries()).map(([id, job]) => ({
        notificationId: id,
        attempts: job.retryCount,
        nextAttempt: job.nextRetryAt,
        lastError: job.error
      }))
    };
  }

  /**
   * Clear the retry queue
   */
  public clearRetryQueue(): void {
    this.retryQueue.clear();
  }

  private startRetryProcessor(): void {
    setInterval(() => {
      this.processRetryQueue().catch(error => {
        logger.error('Error processing retry queue:', error);
      });
    }, 1000); // Check every second
  }

  public getRetryQueue(): Map<string, NotificationRetryOptions> {
    return this.retryQueue;
  }
} 