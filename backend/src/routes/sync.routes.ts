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
  syncController.syncData.bind(syncController)
);

router.get(
  '/:syncId/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(syncValidation.getSyncStatus),
  syncController.getSyncStatus.bind(syncController)
);

router.post(
  '/:syncId/cancel',
  authenticate,
  authorize(['ADMIN']),
  validate(syncValidation.cancelSync),
  syncController.cancelSync.bind(syncController)
);

export default router; 