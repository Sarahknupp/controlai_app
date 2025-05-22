import { Router } from 'express';
import { ScheduledReportController } from '../controllers/scheduled-report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware/validate.middleware';
import { scheduledReportValidation } from '../validations/scheduled-report.validation';

const router = Router();
const scheduledReportController = new ScheduledReportController();

// Schedule a new report
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(scheduledReportValidation.scheduleReport),
  scheduledReportController.scheduleReport.bind(scheduledReportController)
);

// Cancel a scheduled report
router.delete(
  '/:reportId',
  authenticate,
  authorize(['ADMIN']),
  validate(scheduledReportValidation.cancelScheduledReport),
  scheduledReportController.cancelScheduledReport.bind(scheduledReportController)
);

// Get all scheduled reports
router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(scheduledReportValidation.getScheduledReports),
  scheduledReportController.getScheduledReports.bind(scheduledReportController)
);

export default router; 