import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { auditValidation } from '../validations/audit.validation';

const router = Router();
const auditController = new AuditController();

// Get audit logs with filtering and pagination
router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(auditValidation.getAuditLogs),
  auditController.getAuditLogs.bind(auditController)
);

// Get audit statistics
router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN']),
  auditController.getAuditStats.bind(auditController)
);

// Get a specific audit log
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(auditValidation.getAuditLog),
  auditController.getAuditLog.bind(auditController)
);

// Delete a specific audit log
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(auditValidation.deleteAuditLog),
  auditController.deleteAuditLog.bind(auditController)
);

// Clear audit logs before a specific date
router.post(
  '/clear',
  authenticate,
  authorize(['ADMIN']),
  validate(auditValidation.clearAuditLogs),
  auditController.clearAuditLogs.bind(auditController)
);

export default router; 