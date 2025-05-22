import { Request, Response } from 'express';
import { MetricsService } from '../services/metrics.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';

export class MetricsController {
  private metricsService: MetricsService;

  constructor() {
    this.metricsService = new MetricsService();
  }

  async collectMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { type, timeRange } = req.body;
      const userId = req.user?.id;

      const result = await this.metricsService.collectMetrics({
        type,
        userId,
        timeRange
      });

      res.json(result);
    } catch (error) {
      logger.error('Error collecting metrics:', error);
      throw new BadRequestError('Failed to collect metrics');
    }
  }

  async getMetricsStatus(req: Request, res: Response): Promise<void> {
    try {
      const inProgress = this.metricsService.isMetricsInProgress();
      res.json({ inProgress });
    } catch (error) {
      logger.error('Error getting metrics status:', error);
      throw new BadRequestError('Failed to get metrics status');
    }
  }

  async getSystemMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      throw new BadRequestError('Failed to get system metrics');
    }
  }

  async getUsageMetrics(req: Request, res: Response) {
    try {
      const { startDate, endDate, interval } = req.query;

      const metrics = await this.metricsService.getUsageMetrics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        interval: interval as 'hour' | 'day' | 'week' | 'month',
      });

      res.json(metrics);
    } catch (error) {
      logger.error('Error getting usage metrics:', error);
      throw new BadRequestError('Failed to get usage metrics');
    }
  }
} 