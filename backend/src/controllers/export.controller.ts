import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export class ExportController {
  private exportService: ExportService;
  private exportDir: string;

  constructor() {
    this.exportService = new ExportService();
    this.exportDir = path.join(process.cwd(), 'exports');
    this.ensureExportDirectory();
  }

  private ensureExportDirectory(): void {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { type, format, filters, options } = req.body;
      const userId = req.user?.id;

      const result = await this.exportService.exportData({
        type,
        format,
        filters,
        userId,
        options
      });

      res.json(result);
    } catch (error) {
      logger.error('Error exporting data:', error);
      throw new BadRequestError('Failed to export data');
    }
  }

  async getExportStatus(req: Request, res: Response): Promise<void> {
    try {
      const { exportId } = req.params;
      const result = await this.exportService.getExportStatus(exportId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting export status:', error);
      throw new BadRequestError('Failed to get export status');
    }
  }

  async downloadExport(req: Request, res: Response): Promise<void> {
    try {
      const { exportId } = req.params;
      const result = await this.exportService.getExportStatus(exportId);

      if (!result.filePath || !fs.existsSync(result.filePath)) {
        throw new BadRequestError('Export file not found');
      }

      const fileName = path.basename(result.filePath);
      res.download(result.filePath, fileName);
    } catch (error) {
      logger.error('Error downloading export:', error);
      throw new BadRequestError('Failed to download export');
    }
  }

  async deleteExport(req: Request, res: Response): Promise<void> {
    try {
      const { exportId } = req.params;
      const userId = req.user?.id;

      await this.exportService.deleteExport(exportId, userId);
      res.json({ message: 'Export deleted successfully' });
    } catch (error) {
      logger.error('Error deleting export:', error);
      throw new BadRequestError('Failed to delete export');
    }
  }
} 