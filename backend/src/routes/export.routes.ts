import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth';
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
  authorize(['ADMIN', 'MANAGER']),
  validate({ body: exportValidation.exportData }),
  exportController.exportData.bind(exportController)
);

router.get(
  '/:exportId/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate({ body: exportValidation.getExportStatus }),
  exportController.getExportStatus.bind(exportController)
);

router.get(
  '/:exportId/download',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate({ body: exportValidation.downloadExport }),
  exportController.downloadExport.bind(exportController)
);

router.delete(
  '/:exportId',
  authenticate,
  authorize(['ADMIN']),
  validate({ body: exportValidation.deleteExport }),
  exportController.deleteExport.bind(exportController)
);

export default router; 