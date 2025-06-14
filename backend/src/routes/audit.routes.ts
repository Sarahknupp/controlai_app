import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { auditValidation } from '../validations/audit.validation';
import { UserRole } from '../models/user.model';

const router = Router();
const auditController = new AuditController();

// Get audit logs with filtering and pagination
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validate(auditValidation.getAuditLogs),
  (req, res, next): void => {
    auditController.getAuditLogs(req, res, next);
  }
);

// Get audit statistics
router.get(
  '/stats',
  authenticate,
  authorize([UserRole.ADMIN]),
  auditController.getAuditStats.bind(auditController)
);

// Get a specific audit log
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validate(auditValidation.getAuditLog),
  (req, res, next): void => {
    auditController.getAuditLog(req, res, next);
  }
);

// Delete a specific audit log
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validate(auditValidation.deleteAuditLog),
  (req, res, next): void => {
    auditController.deleteAuditLog(req, res, next);
  }
);

// Clear audit logs before a specific date
router.post(
  '/clear',
  authenticate,
  authorize([UserRole.ADMIN]),
  validate(auditValidation.clearAuditLogs),
  (req, res, next): void => {
    auditController.clearAuditLogs(req, res, next);
  }
);

export default router; 