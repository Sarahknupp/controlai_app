import { Router, Request, Response, NextFunction } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { syncValidation } from '../validations/sync.validation';

const router = Router();
const syncController = new SyncController();

// Sync routes
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(syncValidation.syncData),
  (req: Request, res: Response, next: NextFunction): void => {
    syncController.syncData.bind(syncController)(req, res, next);
  }
);

router.get(
  '/:syncId/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(syncValidation.getSyncStatus),
  (req: Request, res: Response, next: NextFunction): void => {
    syncController.getSyncStatus.bind(syncController)(req, res, next);
  }
);

router.post(
  '/:syncId/cancel',
  authenticate,
  authorize(['ADMIN']),
  validate(syncValidation.cancelSync),
  (req: Request, res: Response, next: NextFunction): void => {
    syncController.cancelSync.bind(syncController)(req, res, next);
  }
);

export default router; 