import { NotificationService, Notification, NotificationType } from './notification.service';
import { AuditService } from './audit.service';
import { logger } from '../utils/logger';

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
  private retryQueue: Map<string, RetryJob>;
  private config: RetryConfig;
  private isProcessing: boolean;
  private processingInterval: NodeJS.Timeout | null;

  constructor(
    private notificationService: NotificationService,
    private auditService: AuditService,
    config?: Partial<RetryConfig>
  ) {
    this.retryQueue = new Map();
    this.config = {
      maxAttempts: config?.maxAttempts || 3,
      initialDelay: config?.initialDelay || 1000, // 1 second
      maxDelay: config?.maxDelay || 300000, // 5 minutes
      backoffFactor: config?.backoffFactor || 2
    };
    this.isProcessing = false;
    this.processingInterval = null;
  }

  /**
   * Add a failed notification to the retry queue
   */
  async addToRetryQueue(notification: Notification, error: Error): Promise<void> {
    const retryJob: RetryJob = {
      notification,
      attempts: 1,
      nextAttempt: this.calculateNextAttempt(1),
      lastError: error.message
    };

    this.retryQueue.set(notification.id, retryJob);
    await this.logRetryAction(notification.id, 'ADDED', error.message);

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
    this.processingInterval = setInterval(() => this.processQueue(), 1000);
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
  private async processQueue(): Promise<void> {
    const now = new Date();
    const jobsToProcess = Array.from(this.retryQueue.entries())
      .filter(([_, job]) => job.nextAttempt <= now);

    for (const [notificationId, job] of jobsToProcess) {
      try {
        await this.retryNotification(job);
      } catch (error) {
        logger.error(`Failed to process retry job for notification ${notificationId}:`, error);
      }
    }

    // Stop processing if queue is empty
    if (this.retryQueue.size === 0) {
      this.stopProcessing();
    }
  }

  /**
   * Retry sending a notification
   */
  private async retryNotification(job: RetryJob): Promise<void> {
    const { notification, attempts } = job;

    try {
      // Attempt to resend the notification
      await this.notificationService.sendUserNotification(
        notification.userId,
        notification.subject,
        notification.content,
        {
          type: notification.type as NotificationType,
          priority: notification.priority,
          metadata: {
            ...notification.metadata,
            retryAttempt: attempts
          }
        }
      );

      // Remove from retry queue on success
      this.retryQueue.delete(notification.id);
      await this.logRetryAction(notification.id, 'SUCCEEDED');

    } catch (error) {
      const nextAttempt = this.calculateNextAttempt(attempts + 1);
      
      if (attempts + 1 >= this.config.maxAttempts) {
        // Max attempts reached, remove from queue
        this.retryQueue.delete(notification.id);
        await this.logRetryAction(notification.id, 'FAILED', error.message);
      } else {
        // Update retry job with new attempt
        this.retryQueue.set(notification.id, {
          ...job,
          attempts: attempts + 1,
          nextAttempt,
          lastError: error.message
        });
        await this.logRetryAction(notification.id, 'RETRY', error.message);
      }
    }
  }

  /**
   * Calculate the next attempt time using exponential backoff
   */
  private calculateNextAttempt(attempt: number): Date {
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt - 1),
      this.config.maxDelay
    );
    return new Date(Date.now() + delay);
  }

  /**
   * Log retry actions to audit service
   */
  private async logRetryAction(
    notificationId: string,
    action: 'ADDED' | 'RETRY' | 'SUCCEEDED' | 'FAILED',
    error?: string
  ): Promise<void> {
    const details = {
      action,
      attempts: this.retryQueue.get(notificationId)?.attempts || 0,
      nextAttempt: this.retryQueue.get(notificationId)?.nextAttempt,
      error
    };

    await this.auditService.logAction({
      action: 'RETRY',
      entityType: 'NOTIFICATION',
      entityId: notificationId,
      userId: 'system',
      details: JSON.stringify(details),
      status: action === 'SUCCEEDED' ? 'success' : 'error'
    });
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
        attempts: job.attempts,
        nextAttempt: job.nextAttempt,
        lastError: job.lastError
      }))
    };
  }

  /**
   * Clear the retry queue
   */
  async clearQueue(): Promise<void> {
    const notificationIds = Array.from(this.retryQueue.keys());
    
    for (const id of notificationIds) {
      await this.logRetryAction(id, 'FAILED', 'Queue cleared');
    }
    
    this.retryQueue.clear();
    this.stopProcessing();
  }
} 