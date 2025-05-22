import { Router } from 'express';
import { BackupController } from '../controllers/backup.controller';
import { validateRequest } from '../middleware/validation';
import { backupValidation } from '../validations/backup.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../types/user';

const router = Router();
const backupController = new BackupController();

// Create backup
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateRequest(backupValidation.createBackup),
  backupController.createBackup.bind(backupController)
);

// Restore backup
router.post(
  '/:backupId/restore',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateRequest(backupValidation.restoreBackup),
  backupController.restoreBackup.bind(backupController)
);

// List backups
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  backupController.listBackups.bind(backupController)
);

// Delete backup
router.delete(
  '/:backupId',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateRequest(backupValidation.deleteBackup),
  backupController.deleteBackup.bind(backupController)
);

// Get backup status
router.get(
  '/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  backupController.getBackupStatus.bind(backupController)
);

export default router; 