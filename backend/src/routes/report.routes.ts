import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { reportValidation } from '../validations/report.validation';

const router = Router();
const reportController = new ReportController();

// Validation schemas
const reportIdSchema = {
  params: {
    reportId: { type: 'number' as const, required: true, min: 1 }
  }
};

// Generate a new report
router.post(
  '/',
  authenticate,
  validate(reportValidation.generateReport),
  reportController.generateReport.bind(reportController)
);

// Get all reports with filtering
router.get(
  '/',
  authenticate,
  validate(reportValidation.getReports),
  reportController.getReports.bind(reportController)
);

// Get a specific report
router.get(
  '/:reportId',
  authenticate,
  validate({ ...reportIdSchema, ...reportValidation.getReport }),
  reportController.getReport.bind(reportController)
);

// Delete a report
router.delete(
  '/:reportId',
  authenticate,
  validate({ ...reportIdSchema, ...reportValidation.deleteReport }),
  reportController.deleteReport.bind(reportController)
);

export default router; 