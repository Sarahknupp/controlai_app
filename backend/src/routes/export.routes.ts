import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { exportValidation } from '../validations/export.validation';
import { UserRole } from '../models/user.model';

const router = Router();
const exportController = new ExportController();

// Export routes
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validate(exportValidation.exportData),
  (req, res, next): void => {
    exportController.exportData(req, res, next);
  }
);

router.get(
  '/:exportId/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validate(exportValidation.getExportStatus),
  (req, res, next): void => {
    exportController.getExportStatus(req, res, next);
  }
);

router.get(
  '/:exportId/download',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validate(exportValidation.downloadExport),
  (req, res, next): void => {
    exportController.downloadExport(req, res, next);
  }
);

router.delete(
  '/:exportId',
  authenticate,
  authorize([UserRole.ADMIN]),
  validate(exportValidation.deleteExport),
  (req, res, next): void => {
    exportController.deleteExport(req, res, next);
  }
);

export default router; 