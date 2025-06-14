import { Router } from 'express';
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
  (req, res, next): void => {
    syncController.syncData.bind(syncController)(req, res, next);
  }
);

router.get(
  '/:syncId/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(syncValidation.getSyncStatus),
  (req, res, next): void => {
    syncController.getSyncStatus.bind(syncController)(req, res, next);
  }
);

router.post(
  '/:syncId/cancel',
  authenticate,
  authorize(['ADMIN']),
  validate(syncValidation.cancelSync),
  (req, res, next): void => {
    syncController.cancelSync.bind(syncController)(req, res, next);
  }
);

export default router; 