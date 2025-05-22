import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMetricsController } from '../../controllers/notification-metrics.controller';
import { NotificationMetricsService } from '../../services/notification-metrics.service';

describe('NotificationMetricsController', () => {
  let controller: NotificationMetricsController;
  let metricsService: jest.Mocked<NotificationMetricsService>;

  const mockMetrics = {
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
      }
    ]
  };

  const mockTrends = {
    daily: [
      { date: '2024-03-20', rate: 0.15 }
    ],
    weekly: [
      { week: '2024-03-17', rate: 0.15 }
    ],
    monthly: [
      { month: '2024-03', rate: 0.15 }
    ]
  };

  const mockAlerts = {
    alerts: [
      'High failure rate: 10.0%',
      'High average retry attempts: 2.5'
    ],
    metrics: mockMetrics
  };

  beforeEach(async () => {
    metricsService = {
      getMetrics: jest.fn().mockResolvedValue(mockMetrics),
      getFailureTrends: jest.fn().mockResolvedValue(mockTrends),
      checkAlerts: jest.fn().mockResolvedValue(mockAlerts)
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationMetricsController],
      providers: [
        {
          provide: NotificationMetricsService,
          useValue: metricsService
        }
      ]
    }).compile();

    controller = module.get<NotificationMetricsController>(NotificationMetricsController);
  });

  describe('getMetrics', () => {
    it('should return notification metrics', async () => {
      const result = await controller.getMetrics();
      expect(result).toEqual(mockMetrics);
      expect(metricsService.getMetrics).toHaveBeenCalled();
    });
  });

  describe('getFailureTrends', () => {
    it('should return failure trends', async () => {
      const result = await controller.getFailureTrends();
      expect(result).toEqual(mockTrends);
      expect(metricsService.getFailureTrends).toHaveBeenCalled();
    });
  });

  describe('checkAlerts', () => {
    it('should check alerts with custom thresholds', async () => {
      const thresholds = {
        failureRateThreshold: 0.05,
        retryAttemptsThreshold: 2
      };

      const result = await controller.checkAlerts(thresholds);
      expect(result).toEqual(mockAlerts);
      expect(metricsService.checkAlerts).toHaveBeenCalledWith(thresholds);
    });

    it('should check alerts with default thresholds', async () => {
      const result = await controller.checkAlerts({});
      expect(result).toEqual(mockAlerts);
      expect(metricsService.checkAlerts).toHaveBeenCalledWith({});
    });
  });
}); 