import Bull from 'bull';
import { logger } from '../utils/logger';
import { NotificationService, Notification, NotificationType } from './notification.service';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  prefix?: string;
}

export interface QueueJob {
  notification: Notification;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export class NotificationQueueService {
  private queue: Bull.Queue<QueueJob>;
  private notificationService: NotificationService;
  private auditService: AuditService;

  constructor(config: QueueConfig, notificationService: NotificationService) {
    this.queue = new Bull('notifications', {
      redis: config.redis,
      prefix: config.prefix || 'notification-queue',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    this.notificationService = notificationService;
    this.auditService = new AuditService();

    this.setupQueueHandlers();
  }

  private setupQueueHandlers(): void {
    // Process jobs
    this.queue.process(async (job) => {
      const { notification } = job.data;
      logger.info('Processing notification job:', {
        jobId: job.id,
        notificationId: notification.id,
        type: notification.type
      });

      try {
        await this.notificationService.sendUserNotification(
          notification.userId,
          notification.subject,
          notification.content,
          {
            type: notification.type,
            priority: notification.priority,
            metadata: notification.metadata
          }
        );

        // Log successful processing
        await this.auditService.logAction({
          action: AuditAction.UPDATE,
          entityType: EntityType.NOTIFICATION,
          entityId: notification.id,
          userId: 'system',
          details: `Successfully processed notification job ${job.id}`,
          status: 'success'
        });

        return { success: true };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error processing notification job:', {
          jobId: job.id,
          error: errorMessage
        });

        // Log failed processing
        await this.auditService.logAction({
          action: AuditAction.UPDATE,
          entityType: EntityType.NOTIFICATION,
          entityId: notification.id,
          userId: 'system',
          details: `Failed to process notification job ${job.id}: ${errorMessage}`,
          status: 'error'
        });

        throw error;
      }
    });

    // Handle completed jobs
    this.queue.on('completed', (job) => {
      logger.info('Notification job completed:', {
        jobId: job.id,
        notificationId: job.data.notification.id
      });
    });

    // Handle failed jobs
    this.queue.on('failed', (job, error) => {
      logger.error('Notification job failed:', {
        jobId: job?.id,
        notificationId: job?.data.notification.id,
        error: error.message
      });
    });

    // Handle stalled jobs
    this.queue.on('stalled', (job) => {
      logger.warn('Notification job stalled:', {
        jobId: job.id,
        notificationId: job.data.notification.id
      });
    });
  }

  async addToQueue(notification: Notification, options?: {
    attempts?: number;
    backoff?: {
      type: 'fixed' | 'exponential';
      delay: number;
    };
  }): Promise<Bull.Job<QueueJob>> {
    try {
      const job = await this.queue.add(
        { notification },
        {
          attempts: options?.attempts,
          backoff: options?.backoff
        }
      );

      // Log job creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: notification.id,
        userId: 'system',
        details: `Added notification to queue with job ID ${job.id}`,
        status: 'success'
      });

      logger.info('Added notification to queue:', {
        jobId: job.id,
        notificationId: notification.id,
        type: notification.type
      });

      return job;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error adding notification to queue:', error);

      // Log failed job creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.NOTIFICATION,
        entityId: notification.id,
        userId: 'system',
        details: `Failed to add notification to queue: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to add notification to queue: ${errorMessage}`);
    }
  }

  async getJobStatus(jobId: string): Promise<{
    status: Bull.JobStatus;
    attempts: number;
    error?: string;
  }> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      const state = await job.getState();
      const attempts = job.attemptsMade;
      const error = job.failedReason;

      return {
        status: state,
        attempts,
        error
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting job status:', error);
      throw new Error(`Failed to get job status: ${errorMessage}`);
    }
  }

  async retryJob(jobId: string): Promise<void> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      await job.retry();

      // Log job retry
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.NOTIFICATION,
        entityId: job.data.notification.id,
        userId: 'system',
        details: `Retrying notification job ${jobId}`,
        status: 'success'
      });

      logger.info('Retrying notification job:', {
        jobId,
        notificationId: job.data.notification.id
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error retrying job:', error);

      // Log failed retry
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'unknown',
        userId: 'system',
        details: `Failed to retry notification job ${jobId}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to retry job: ${errorMessage}`);
    }
  }

  async removeJob(jobId: string): Promise<void> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      await job.remove();

      // Log job removal
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.NOTIFICATION,
        entityId: job.data.notification.id,
        userId: 'system',
        details: `Removed notification job ${jobId}`,
        status: 'success'
      });

      logger.info('Removed notification job:', {
        jobId,
        notificationId: job.data.notification.id
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error removing job:', error);

      // Log failed removal
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.NOTIFICATION,
        entityId: 'unknown',
        userId: 'system',
        details: `Failed to remove notification job ${jobId}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to remove job: ${errorMessage}`);
    }
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    try {
      const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
        this.queue.getDelayedCount(),
        this.queue.getPausedCount()
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting queue stats:', error);
      throw new Error(`Failed to get queue stats: ${errorMessage}`);
    }
  }

  async pauseQueue(): Promise<void> {
    try {
      await this.queue.pause();
      logger.info('Notification queue paused');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error pausing queue:', error);
      throw new Error(`Failed to pause queue: ${errorMessage}`);
    }
  }

  async resumeQueue(): Promise<void> {
    try {
      await this.queue.resume();
      logger.info('Notification queue resumed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error resuming queue:', error);
      throw new Error(`Failed to resume queue: ${errorMessage}`);
    }
  }
} 