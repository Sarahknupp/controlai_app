import { Injectable } from '@nestjs/common';
import { AuditService } from './audit.service';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationRetryService } from './notification-retry.service';

export interface QueueMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  retryJobs: number;
  averageProcessingTime: number;
  jobsByType: Record<string, number>;
  jobsByPriority: Record<string, number>;
  jobsByStatus: Record<string, number>;
  hourlyStats: {
    hour: string;
    count: number;
    success: number;
    failure: number;
  }[];
}

@Injectable()
export class QueueMonitorService {
  private metrics: QueueMetrics = {
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    retryJobs: 0,
    averageProcessingTime: 0,
    jobsByType: {},
    jobsByPriority: {},
    jobsByStatus: {},
    hourlyStats: []
  };

  constructor(
    private readonly queueService: NotificationQueueService,
    private readonly retryService: NotificationRetryService,
    private readonly auditService: AuditService
  ) {
    this.initializeMetrics();
  }

  private async initializeMetrics(): Promise<void> {
    try {
      // Get initial queue state
      const queueStats = await this.queueService.getQueueStats();
      const retryStats = await this.retryService.getRetryStats();

      // Update metrics
      this.metrics = {
        ...this.metrics,
        totalJobs: queueStats.total,
        activeJobs: queueStats.active,
        completedJobs: queueStats.completed,
        failedJobs: queueStats.failed,
        retryJobs: retryStats.total,
        jobsByType: queueStats.byType,
        jobsByPriority: queueStats.byPriority,
        jobsByStatus: queueStats.byStatus,
        hourlyStats: queueStats.hourlyStats
      };

      // Log initialization
      await this.auditService.logAction({
        action: 'queue_monitor_initialized',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Queue monitor service initialized successfully',
        status: 'success'
      });
    } catch (error) {
      await this.auditService.logAction({
        action: 'queue_monitor_init_error',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Failed to initialize queue monitor service',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public async getMetrics(): Promise<QueueMetrics> {
    try {
      // Get current queue state
      const queueStats = await this.queueService.getQueueStats();
      const retryStats = await this.retryService.getRetryStats();

      // Update metrics
      this.metrics = {
        ...this.metrics,
        totalJobs: queueStats.total,
        activeJobs: queueStats.active,
        completedJobs: queueStats.completed,
        failedJobs: queueStats.failed,
        retryJobs: retryStats.total,
        jobsByType: queueStats.byType,
        jobsByPriority: queueStats.byPriority,
        jobsByStatus: queueStats.byStatus,
        hourlyStats: queueStats.hourlyStats
      };

      return this.metrics;
    } catch (error) {
      await this.auditService.logAction({
        action: 'queue_metrics_error',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Failed to get queue metrics',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async getJobDetails(jobId: string): Promise<any> {
    try {
      const job = await this.queueService.getJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }
      return job;
    } catch (error) {
      await this.auditService.logAction({
        action: 'job_details_error',
        entityType: 'queue',
        entityId: jobId,
        details: 'Failed to get job details',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async getFailedJobs(): Promise<any[]> {
    try {
      return await this.queueService.getFailedJobs();
    } catch (error) {
      await this.auditService.logAction({
        action: 'failed_jobs_error',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Failed to get failed jobs',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async getRetryJobs(): Promise<any[]> {
    try {
      return await this.retryService.getRetryJobs();
    } catch (error) {
      await this.auditService.logAction({
        action: 'retry_jobs_error',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Failed to get retry jobs',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async clearFailedJobs(): Promise<void> {
    try {
      await this.queueService.clearFailedJobs();
      await this.auditService.logAction({
        action: 'failed_jobs_cleared',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Failed jobs cleared successfully',
        status: 'success'
      });
    } catch (error) {
      await this.auditService.logAction({
        action: 'clear_failed_jobs_error',
        entityType: 'queue',
        entityId: 'monitor',
        details: 'Failed to clear failed jobs',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async retryFailedJob(jobId: string): Promise<void> {
    try {
      await this.queueService.retryJob(jobId);
      await this.auditService.logAction({
        action: 'job_retry',
        entityType: 'queue',
        entityId: jobId,
        details: 'Job retry initiated successfully',
        status: 'success'
      });
    } catch (error) {
      await this.auditService.logAction({
        action: 'job_retry_error',
        entityType: 'queue',
        entityId: jobId,
        details: 'Failed to retry job',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
} 