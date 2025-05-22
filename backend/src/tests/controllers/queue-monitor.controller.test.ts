import { Test, TestingModule } from '@nestjs/testing';
import { QueueMonitorController } from '../../controllers/queue-monitor.controller';
import { QueueMonitorService } from '../../services/queue-monitor.service';

describe('QueueMonitorController', () => {
  let controller: QueueMonitorController;
  let monitorService: jest.Mocked<QueueMonitorService>;

  const mockMetrics = {
    totalJobs: 100,
    activeJobs: 20,
    completedJobs: 70,
    failedJobs: 10,
    retryJobs: 5,
    jobsByType: {
      email: 50,
      sms: 30,
      push: 20
    },
    jobsByPriority: {
      high: 30,
      normal: 60,
      low: 10
    },
    jobsByStatus: {
      waiting: 20,
      processing: 10,
      completed: 70
    },
    hourlyStats: [
      {
        hour: '2024-03-20T10:00:00Z',
        count: 10,
        success: 8,
        failure: 2
      }
    ],
    averageProcessingTime: 0
  };

  beforeEach(async () => {
    monitorService = {
      getMetrics: jest.fn().mockResolvedValue(mockMetrics),
      getJobDetails: jest.fn(),
      getFailedJobs: jest.fn(),
      getRetryJobs: jest.fn(),
      clearFailedJobs: jest.fn(),
      retryFailedJob: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueMonitorController],
      providers: [
        {
          provide: QueueMonitorService,
          useValue: monitorService
        }
      ]
    }).compile();

    controller = module.get<QueueMonitorController>(QueueMonitorController);
  });

  describe('getMetrics', () => {
    it('should return queue metrics', async () => {
      const result = await controller.getMetrics();
      expect(result).toEqual(mockMetrics);
      expect(monitorService.getMetrics).toHaveBeenCalled();
    });
  });

  describe('getJobDetails', () => {
    it('should return job details', async () => {
      const mockJob = { id: '123', status: 'completed' };
      monitorService.getJobDetails.mockResolvedValueOnce(mockJob);

      const result = await controller.getJobDetails('123');
      expect(result).toEqual(mockJob);
      expect(monitorService.getJobDetails).toHaveBeenCalledWith('123');
    });
  });

  describe('getFailedJobs', () => {
    it('should return failed jobs', async () => {
      const mockFailedJobs = [{ id: '123', error: 'Failed to send' }];
      monitorService.getFailedJobs.mockResolvedValueOnce(mockFailedJobs);

      const result = await controller.getFailedJobs();
      expect(result).toEqual(mockFailedJobs);
      expect(monitorService.getFailedJobs).toHaveBeenCalled();
    });
  });

  describe('getRetryJobs', () => {
    it('should return retry jobs', async () => {
      const mockRetryJobs = [{ id: '123', attempts: 2 }];
      monitorService.getRetryJobs.mockResolvedValueOnce(mockRetryJobs);

      const result = await controller.getRetryJobs();
      expect(result).toEqual(mockRetryJobs);
      expect(monitorService.getRetryJobs).toHaveBeenCalled();
    });
  });

  describe('clearFailedJobs', () => {
    it('should clear failed jobs', async () => {
      const result = await controller.clearFailedJobs();
      expect(result).toEqual({ message: 'Failed jobs cleared successfully' });
      expect(monitorService.clearFailedJobs).toHaveBeenCalled();
    });
  });

  describe('retryFailedJob', () => {
    it('should retry failed job', async () => {
      const result = await controller.retryFailedJob('123');
      expect(result).toEqual({ message: 'Job retry initiated successfully' });
      expect(monitorService.retryFailedJob).toHaveBeenCalledWith('123');
    });
  });
}); 