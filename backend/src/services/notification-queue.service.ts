import Bull from 'bull';
import { QueueConfig } from '../config/queue.config';
import { Notification, NotificationOptions } from '../types/notification';
import { logger } from '../utils/logger';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';

interface QueueJob {
  notification: Notification;
  options: NotificationOptions;
}

export class NotificationQueueService {
  private queue: Bull.Queue<QueueJob>;
  private notificationService: NotificationService;
  private auditService: AuditService;

  constructor(config: QueueConfig, notificationService: NotificationService) {
    this.notificationService = notificationService;
    this.auditService = new AuditService();
    this.queue = new Bull(config.queueName, {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db
      },
      defaultJobOptions: {
        attempts: config.maxRetries,
        backoff: {
          type: 'exponential',
          delay: config.retryDelay
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    this.initializeQueue();
  }

  private initializeQueue(): void {
    // Process jobs
    this.queue.process(this.config.concurrency, async (job) => {
      try {
        const { notification, options } = job.data;
        await this.notificationService.createNotification(options);
        logger.info(`Processed notification ${notification.id} from queue`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to process notification from queue: ${errorMessage}`);
        throw error;
      }
    });

    // Handle events
    this.queue.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    this.queue.on('failed', (job, error) => {
      logger.error(`Job ${job?.id} failed:`, error);
    });

    this.queue.on('stalled', (job) => {
      logger.warn(`Job ${job.id} stalled`);
    });

    this.queue.on('error', (error) => {
      logger.error('Queue error:', error);
    });
  }

  public async addToQueue(notification: Notification, options: NotificationOptions): Promise<void> {
    try {
      await this.queue.add({ notification, options });
      logger.info(`Added notification ${notification.id} to queue`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to add notification to queue: ${errorMessage}`);
      throw error;
    }
  }

  public async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed
    };
  }

  public async cleanQueue(): Promise<void> {
    try {
      await this.queue.clean(0, 'completed');
      await this.queue.clean(0, 'failed');
      logger.info('Queue cleaned successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to clean queue: ${errorMessage}`);
      throw error;
    }
  }

  public async pauseQueue(): Promise<void> {
    try {
      await this.queue.pause();
      logger.info('Queue paused');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to pause queue: ${errorMessage}`);
      throw error;
    }
  }

  public async resumeQueue(): Promise<void> {
    try {
      await this.queue.resume();
      logger.info('Queue resumed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to resume queue: ${errorMessage}`);
      throw error;
    }
  }

  public async closeQueue(): Promise<void> {
    try {
      await this.queue.close();
      logger.info('Queue closed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to close queue: ${errorMessage}`);
      throw error;
    }
  }
} 