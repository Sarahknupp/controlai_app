import { Router, Request, Response, NextFunction } from 'express';
import { BackupController } from '../controllers/backup.controller';
import { validateRequest } from '../middleware/validation';
import { backupValidation } from '../validations/backup.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../types/user';

const router = Router();
const backupController = new BackupController();

// Create backup
router.post('/create', authenticate, authorize([UserRole.ADMIN]), (req: Request, res: Response, next: NextFunction): void => {
  backupController.createBackup(req, res, next);
});

// Restore backup
router.post('/restore', authenticate, authorize([UserRole.ADMIN]), (req: Request, res: Response, next: NextFunction): void => {
  backupController.restoreBackup(req, res, next);
});

// List backups
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req: Request, res: Response, next: NextFunction): void => {
  backupController.listBackups(req, res, next);
});

// Delete backup
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), (req: Request, res: Response, next: NextFunction): void => {
  backupController.deleteBackup(req, res, next);
});

// Get backup status
router.get('/status', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req: Request, res: Response, next: NextFunction): void => {
  backupController.getBackupStatus(req, res, next);
});

export default router; 