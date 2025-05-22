import { Request, Response } from 'express';
import { ScheduledReportService } from '../services/scheduled-report.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';

export class ScheduledReportController {
  private scheduledReportService: ScheduledReportService;

  constructor() {
    this.scheduledReportService = new ScheduledReportService();
  }

  async scheduleReport(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, format, schedule, recipients, filters, options } = req.body;
      const userId = req.user?.id;

      const result = await this.scheduledReportService.scheduleReport({
        name,
        type,
        format,
        schedule,
        recipients,
        filters,
        options,
        userId
      });

      res.json(result);
    } catch (error) {
      logger.error('Error scheduling report:', error);
      throw new BadRequestError('Failed to schedule report');
    }
  }

  async cancelScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const userId = req.user?.id;

      await this.scheduledReportService.cancelScheduledReport(reportId, userId);
      res.json({ message: 'Report cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling report:', error);
      throw new BadRequestError('Failed to cancel report');
    }
  }

  async getScheduledReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await this.scheduledReportService.getScheduledReports();
      res.json(reports);
    } catch (error) {
      logger.error('Error getting scheduled reports:', error);
      throw new BadRequestError('Failed to get scheduled reports');
    }
  }
} 