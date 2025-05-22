import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMetricsService } from '../../services/notification-metrics.service';
import { QueueMonitorService } from '../../services/queue-monitor.service';
import { NotificationRetryService } from '../../services/notification-retry.service';
import { AuditService } from '../../services/audit.service';

describe('NotificationMetricsService', () => {
  let metricsService: NotificationMetricsService;
  let mockMonitorService: jest.Mocked<QueueMonitorService>;
  let mockRetryService: jest.Mocked<NotificationRetryService>;
  let mockAuditService: jest.Mocked<AuditService>;

  const mockQueueMetrics = {
    totalJobs: 1000,
    failedJobs: 100,
    jobsByType: {
      email: 600,
      sms: 300,
      push: 100
    },
    hourlyStats: [
      {
        hour: '2024-03-20T10:00:00Z',
        count: 100,
        success: 80,
        failure: 20
      },
      {
        hour: '2024-03-20T11:00:00Z',
        count: 100,
        success: 90,
        failure: 10
      }
    ]
  };

  const mockRetryStats = {
    total: 50,
    averageAttempts: 2.5,
    jobs: [
      {
        id: '1',
        type: 'email',
        lastError: 'Connection timeout',
        timestamp: '2024-03-20T10:00:00Z',
        attempts: 3
      },
      {
        id: '2',
        type: 'sms',
        lastError: 'Invalid number',
        timestamp: '2024-03-20T10:01:00Z',
        attempts: 2
      }
    ]
  };

  beforeEach(async () => {
    mockMonitorService = {
      getMetrics: jest.fn().mockResolvedValue(mockQueueMetrics)
    } as any;

    mockRetryService = {
      getRetryStats: jest.fn().mockResolvedValue(mockRetryStats)
    } as any;

    mockAuditService = {
      logAction: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationMetricsService,
        {
          provide: QueueMonitorService,
          useValue: mockMonitorService
        },
        {
          provide: NotificationRetryService,
          useValue: mockRetryService
        },
        {
          provide: AuditService,
          useValue: mockAuditService
        }
      ]
    }).compile();

    metricsService = module.get<NotificationMetricsService>(NotificationMetricsService);
  });

  describe('getMetrics', () => {
    it('should return current metrics', async () => {
      const metrics = await metricsService.getMetrics();

      expect(metrics).toEqual({
        totalSent: 1000,
        totalFailed: 100,
        failureRate: 0.1,
        averageRetryAttempts: 2.5,
        failuresByType: {
          email: 60,
          sms: 30,
          push: 10
        },
        failuresByError: {
          'Connection timeout': 1,
          'Invalid number': 1
        },
        hourlyFailureRate: [
          { hour: '2024-03-20T10:00:00Z', rate: 0.2 },
          { hour: '2024-03-20T11:00:00Z', rate: 0.1 }
        ],
        recentFailures: [
          {
            id: '2',
            type: 'sms',
            error: 'Invalid number',
            timestamp: '2024-03-20T10:01:00Z',
            attempts: 2
          },
          {
            id: '1',
            type: 'email',
            error: 'Connection timeout',
            timestamp: '2024-03-20T10:00:00Z',
            attempts: 3
          }
        ]
      });
    });

    it('should handle errors when getting metrics', async () => {
      mockMonitorService.getMetrics.mockRejectedValueOnce(new Error('Queue error'));

      await expect(metricsService.getMetrics()).rejects.toThrow('Queue error');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'metrics_error',
          status: 'error'
        })
      );
    });
  });

  describe('checkAlerts', () => {
    it('should trigger alerts when thresholds are exceeded', async () => {
      const customThresholds = {
        failureRateThreshold: 0.05, // 5%
        retryAttemptsThreshold: 2,
        consecutiveFailuresThreshold: 2,
        hourlyFailureRateThreshold: 0.1 // 10%
      };

      const { alerts, metrics } = await metricsService.checkAlerts(customThresholds);

      expect(alerts).toContain('High failure rate: 10.0%');
      expect(alerts).toContain('High average retry attempts: 2.5');
      expect(alerts).toContain('High hourly failure rates detected in 1 periods');
      expect(alerts).toContain('Consecutive failures detected: 2');
      expect(metrics).toBeDefined();
    });

    it('should not trigger alerts when metrics are within thresholds', async () => {
      const customThresholds = {
        failureRateThreshold: 0.2, // 20%
        retryAttemptsThreshold: 5,
        consecutiveFailuresThreshold: 10,
        hourlyFailureRateThreshold: 0.3 // 30%
      };

      const { alerts, metrics } = await metricsService.checkAlerts(customThresholds);

      expect(alerts).toHaveLength(0);
      expect(metrics).toBeDefined();
    });
  });

  describe('getFailureTrends', () => {
    it('should return failure trends by period', async () => {
      const trends = await metricsService.getFailureTrends();

      expect(trends).toHaveProperty('daily');
      expect(trends).toHaveProperty('weekly');
      expect(trends).toHaveProperty('monthly');

      // Verify daily trends
      expect(trends.daily).toHaveLength(1);
      expect(trends.daily[0]).toEqual({
        date: '2024-03-20',
        rate: 0.15 // Average of 0.2 and 0.1
      });

      // Verify weekly trends
      expect(trends.weekly).toHaveLength(1);
      expect(trends.weekly[0].rate).toBeCloseTo(0.15);

      // Verify monthly trends
      expect(trends.monthly).toHaveLength(1);
      expect(trends.monthly[0].rate).toBeCloseTo(0.15);
    });

    it('should handle empty metrics', async () => {
      mockMonitorService.getMetrics.mockResolvedValueOnce({
        ...mockQueueMetrics,
        hourlyStats: []
      });

      const trends = await metricsService.getFailureTrends();

      expect(trends.daily).toHaveLength(0);
      expect(trends.weekly).toHaveLength(0);
      expect(trends.monthly).toHaveLength(0);
    });
  });
}); 