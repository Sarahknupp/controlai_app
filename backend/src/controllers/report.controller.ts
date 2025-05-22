import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ReportType, ReportStatus } from '../types/report';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { type, name, parameters, emailRecipients } = req.body;
      const userId = req.user!.id;

      if (!type || !name) {
        throw new BadRequestError('Type and name are required');
      }

      const report = await this.reportService.generateReport({
        type: type as ReportType,
        name,
        parameters,
        userId,
        emailRecipients
      });

      res.status(201).json(report);
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const {
        type,
        status,
        startDate,
        endDate
      } = req.query;

      const reports = await this.reportService.getReports({
        type: type as ReportType,
        status: status as ReportStatus,
        userId: req.user!.id,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json(reports);
    } catch (error) {
      logger.error('Error getting reports:', error);
      throw error;
    }
  }

  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReport(id);

      if (!report) {
        throw new BadRequestError(`Report not found: ${id}`);
      }

      // Check if user has access to the report
      if (report.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new BadRequestError('Access denied');
      }

      res.json(report);
    } catch (error) {
      logger.error('Error getting report:', error);
      throw error;
    }
  }

  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = await this.reportService.getReport(id);

      if (!report) {
        throw new BadRequestError(`Report not found: ${id}`);
      }

      // Check if user has access to delete the report
      if (report.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new BadRequestError('Access denied');
      }

      await this.reportService.deleteReport(id);
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      logger.error('Error deleting report:', error);
      throw error;
    }
  }
} 