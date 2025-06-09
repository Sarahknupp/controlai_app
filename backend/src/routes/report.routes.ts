import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { reportValidation } from '../validations/report.validation';

const router = Router();
const reportController = new ReportController();

// Generate a new report
router.post(
  '/',
  authenticate,
  validate(reportValidation.generateReport),
  (req, res, next): void => {
    reportController.generateReport(req, res, next);
  }
);

// Get all reports with filtering
router.get(
  '/',
  authenticate,
  validate(reportValidation.getReports),
  (req, res, next): void => {
    reportController.getReports(req, res, next);
  }
);

// Get a specific report
router.get(
  '/:id',
  authenticate,
  validate(reportValidation.getReport),
  (req, res, next): void => {
    reportController.getReport(req, res, next);
  }
);

// Delete a report
router.delete(
  '/:id',
  authenticate,
  validate(reportValidation.deleteReport),
  (req, res, next): void => {
    reportController.deleteReport(req, res, next);
  }
);

export default router; 