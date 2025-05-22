import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { BadRequestError } from '../errors/bad-request.error';
import logger from '../utils/logger';

export class SyncController {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  async syncData(req: Request, res: Response): Promise<void> {
    try {
      const { type, direction, source, destination, options } = req.body;
      const userId = req.user?.id;

      const result = await this.syncService.syncData({
        type,
        direction,
        source,
        destination,
        userId,
        options
      });

      res.json(result);
    } catch (error) {
      logger.error('Error syncing data:', error);
      throw new BadRequestError('Failed to sync data');
    }
  }

  async getSyncStatus(req: Request, res: Response): Promise<void> {
    try {
      const { syncId } = req.params;
      const result = await this.syncService.getSyncStatus(syncId);
      res.json(result);
    } catch (error) {
      logger.error('Error getting sync status:', error);
      throw new BadRequestError('Failed to get sync status');
    }
  }

  async cancelSync(req: Request, res: Response): Promise<void> {
    try {
      const { syncId } = req.params;
      const userId = req.user?.id;

      await this.syncService.cancelSync(syncId, userId);
      res.json({ message: 'Sync cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling sync:', error);
      throw new BadRequestError('Failed to cancel sync');
    }
  }
} 