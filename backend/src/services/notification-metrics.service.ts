import { Injectable } from '@nestjs/common';
import { AuditService } from './audit.service';
import { QueueMonitorService } from './queue-monitor.service';
import { NotificationRetryService } from './notification-retry.service';

export interface NotificationMetrics {
  totalSent: number;
  totalFailed: number;
  failureRate: number;
  averageRetryAttempts: number;
  failuresByType: Record<string, number>;
  failuresByError: Record<string, number>;
  hourlyFailureRate: {
    hour: string;
    rate: number;
  }[];
  recentFailures: {
    id: string;
    type: string;
    error: string;
    timestamp: string;
    attempts: number;
  }[];
}

export interface AlertThresholds {
  failureRateThreshold: number;
  retryAttemptsThreshold: number;
  consecutiveFailuresThreshold: number;
  hourlyFailureRateThreshold: number;
}

@Injectable()
export class NotificationMetricsService {
  private metrics: NotificationMetrics = {
    totalSent: 0,
    totalFailed: 0,
    failureRate: 0,
    averageRetryAttempts: 0,
    failuresByType: {},
    failuresByError: {},
    hourlyFailureRate: [],
    recentFailures: []
  };

  private readonly defaultThresholds: AlertThresholds = {
    failureRateThreshold: 0.1, // 10%
    retryAttemptsThreshold: 3,
    consecutiveFailuresThreshold: 5,
    hourlyFailureRateThreshold: 0.15 // 15%
  };

  constructor(
    private readonly monitorService: QueueMonitorService,
    private readonly retryService: NotificationRetryService,
    private readonly auditService: AuditService
  ) {
    this.initializeMetrics();
  }

  private async initializeMetrics(): Promise<void> {
    try {
      const queueMetrics = await this.monitorService.getMetrics();
      const retryStats = await this.retryService.getRetryStats();

      this.updateMetrics(queueMetrics, retryStats);

      await this.auditService.logAction({
        action: 'metrics_initialized',
        entityType: 'metrics',
        entityId: 'notification',
        details: 'Notification metrics service initialized successfully',
        status: 'success'
      });
    } catch (error) {
      await this.auditService.logAction({
        action: 'metrics_init_error',
        entityType: 'metrics',
        entityId: 'notification',
        details: 'Failed to initialize notification metrics service',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private updateMetrics(queueMetrics: any, retryStats: any): void {
    this.metrics = {
      totalSent: queueMetrics.totalJobs,
      totalFailed: queueMetrics.failedJobs,
      failureRate: queueMetrics.failedJobs / queueMetrics.totalJobs || 0,
      averageRetryAttempts: retryStats.averageAttempts || 0,
      failuresByType: this.calculateFailuresByType(queueMetrics),
      failuresByError: this.calculateFailuresByError(retryStats),
      hourlyFailureRate: this.calculateHourlyFailureRate(queueMetrics),
      recentFailures: this.getRecentFailures(retryStats)
    };
  }

  private calculateFailuresByType(queueMetrics: any): Record<string, number> {
    const failures: Record<string, number> = {};
    for (const [type, count] of Object.entries(queueMetrics.jobsByType)) {
      failures[type] = queueMetrics.failedJobs * (count as number) / queueMetrics.totalJobs;
    }
    return failures;
  }

  private calculateFailuresByError(retryStats: any): Record<string, number> {
    const failures: Record<string, number> = {};
    for (const job of retryStats.jobs || []) {
      const error = job.lastError || 'Unknown error';
      failures[error] = (failures[error] || 0) + 1;
    }
    return failures;
  }

  private calculateHourlyFailureRate(queueMetrics: any): { hour: string; rate: number }[] {
    return (queueMetrics.hourlyStats || []).map((stat: any) => ({
      hour: stat.hour,
      rate: stat.failure / stat.count || 0
    }));
  }

  private getRecentFailures(retryStats: any): any[] {
    return (retryStats.jobs || [])
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map((job: any) => ({
        id: job.id,
        type: job.type,
        error: job.lastError,
        timestamp: job.timestamp,
        attempts: job.attempts
      }));
  }

  public async getMetrics(): Promise<NotificationMetrics> {
    try {
      const queueMetrics = await this.monitorService.getMetrics();
      const retryStats = await this.retryService.getRetryStats();

      this.updateMetrics(queueMetrics, retryStats);
      return this.metrics;
    } catch (error) {
      await this.auditService.logAction({
        action: 'metrics_error',
        entityType: 'metrics',
        entityId: 'notification',
        details: 'Failed to get notification metrics',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async checkAlerts(thresholds: Partial<AlertThresholds> = {}): Promise<{
    alerts: string[];
    metrics: NotificationMetrics;
  }> {
    const currentMetrics = await this.getMetrics();
    const mergedThresholds = { ...this.defaultThresholds, ...thresholds };
    const alerts: string[] = [];

    // Check overall failure rate
    if (currentMetrics.failureRate > mergedThresholds.failureRateThreshold) {
      alerts.push(`High failure rate: ${(currentMetrics.failureRate * 100).toFixed(1)}%`);
    }

    // Check average retry attempts
    if (currentMetrics.averageRetryAttempts > mergedThresholds.retryAttemptsThreshold) {
      alerts.push(`High average retry attempts: ${currentMetrics.averageRetryAttempts.toFixed(1)}`);
    }

    // Check hourly failure rates
    const highHourlyRates = currentMetrics.hourlyFailureRate.filter(
      rate => rate.rate > mergedThresholds.hourlyFailureRateThreshold
    );
    if (highHourlyRates.length > 0) {
      alerts.push(`High hourly failure rates detected in ${highHourlyRates.length} periods`);
    }

    // Check consecutive failures
    const recentFailures = currentMetrics.recentFailures;
    if (recentFailures.length >= mergedThresholds.consecutiveFailuresThreshold) {
      const consecutiveFailures = recentFailures.filter(
        (failure, index) => index > 0 && 
        new Date(failure.timestamp).getTime() - new Date(recentFailures[index - 1].timestamp).getTime() < 300000
      );
      if (consecutiveFailures.length >= mergedThresholds.consecutiveFailuresThreshold) {
        alerts.push(`Consecutive failures detected: ${consecutiveFailures.length}`);
      }
    }

    // Log alerts
    if (alerts.length > 0) {
      await this.auditService.logAction({
        action: 'notification_alerts',
        entityType: 'metrics',
        entityId: 'notification',
        details: `Alerts triggered: ${alerts.join(', ')}`,
        status: 'warning'
      });
    }

    return { alerts, metrics: currentMetrics };
  }

  public async getFailureTrends(): Promise<{
    daily: { date: string; rate: number }[];
    weekly: { week: string; rate: number }[];
    monthly: { month: string; rate: number }[];
  }> {
    const metrics = await this.getMetrics();
    const hourlyRates = metrics.hourlyFailureRate;

    // Calculate daily trends
    const dailyRates = this.aggregateRatesByPeriod(hourlyRates, 'day');
    
    // Calculate weekly trends
    const weeklyRates = this.aggregateRatesByPeriod(hourlyRates, 'week');
    
    // Calculate monthly trends
    const monthlyRates = this.aggregateRatesByPeriod(hourlyRates, 'month');

    return {
      daily: dailyRates,
      weekly: weeklyRates,
      monthly: monthlyRates
    };
  }

  private aggregateRatesByPeriod(
    rates: { hour: string; rate: number }[],
    period: 'day' | 'week' | 'month'
  ): { date: string; rate: number }[] {
    const aggregated: Record<string, { total: number; count: number }> = {};

    rates.forEach(({ hour, rate }) => {
      const date = new Date(hour);
      let key: string;

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!aggregated[key]) {
        aggregated[key] = { total: 0, count: 0 };
      }
      aggregated[key].total += rate;
      aggregated[key].count += 1;
    });

    return Object.entries(aggregated)
      .map(([date, { total, count }]) => ({
        date,
        rate: total / count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
} 