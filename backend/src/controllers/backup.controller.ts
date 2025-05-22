import { Request, Response } from 'express';
import { BackupService } from '../services/backup.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  async createBackup(req: Request, res: Response): Promise<void> {
    try {
      const { type, entities, compression } = req.body;
      const userId = req.user?.id;

      const result = await this.backupService.createBackup({
        type,
        userId,
        entities,
        compression
      });

      res.json(result);
    } catch (error) {
      logger.error('Error creating backup:', error);
      throw new BadRequestError('Failed to create backup');
    }
  }

  async restoreBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      const userId = req.user?.id;

      await this.backupService.restoreBackup(backupId, userId);
      res.json({ message: 'Backup restored successfully' });
    } catch (error) {
      logger.error('Error restoring backup:', error);
      throw new BadRequestError('Failed to restore backup');
    }
  }

  async listBackups(req: Request, res: Response): Promise<void> {
    try {
      const backups = await this.backupService.listBackups();
      res.json(backups);
    } catch (error) {
      logger.error('Error listing backups:', error);
      throw new BadRequestError('Failed to list backups');
    }
  }

  async deleteBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      const userId = req.user?.id;

      await this.backupService.deleteBackup(backupId, userId);
      res.json({ message: 'Backup deleted successfully' });
    } catch (error) {
      logger.error('Error deleting backup:', error);
      throw new BadRequestError('Failed to delete backup');
    }
  }

  async getBackupStatus(req: Request, res: Response): Promise<void> {
    try {
      const inProgress = this.backupService.isBackupInProgress();
      res.json({ inProgress });
    } catch (error) {
      logger.error('Error getting backup status:', error);
      throw new BadRequestError('Failed to get backup status');
    }
  }
} 