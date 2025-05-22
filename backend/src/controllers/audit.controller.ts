import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';
import { AuditFilter } from '../types/audit';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const filter: AuditFilter = {
        action: req.query.action as any,
        entityType: req.query.entityType as any,
        entityId: req.query.entityId as string,
        userId: req.query.userId as string,
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any
      };

      const result = await this.auditService.getAuditLogs(filter);
      res.json(result);
    } catch (error) {
      logger.error('Error getting audit logs:', error);
      throw new BadRequestError('Failed to get audit logs');
    }
  }

  async getAuditStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.auditService.getAuditStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      throw new BadRequestError('Failed to get audit stats');
    }
  }

  async getAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const log = await this.auditService.getAuditLog(id);

      if (!log) {
        throw new BadRequestError(`Audit log not found: ${id}`);
      }

      res.json(log);
    } catch (error) {
      logger.error('Error getting audit log:', error);
      throw new BadRequestError('Failed to get audit log');
    }
  }

  async deleteAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.auditService.deleteAuditLog(id);
      res.json({ message: 'Audit log deleted successfully' });
    } catch (error) {
      logger.error('Error deleting audit log:', error);
      throw new BadRequestError('Failed to delete audit log');
    }
  }

  async clearAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { beforeDate } = req.body;
      if (!beforeDate) {
        throw new BadRequestError('beforeDate is required');
      }

      const deletedCount = await this.auditService.clearAuditLogs(new Date(beforeDate));
      res.json({
        message: 'Audit logs cleared successfully',
        deletedCount
      });
    } catch (error) {
      logger.error('Error clearing audit logs:', error);
      throw new BadRequestError('Failed to clear audit logs');
    }
  }
} 