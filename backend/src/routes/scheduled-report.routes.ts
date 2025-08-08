import { Router, Request, Response, NextFunction } from 'express';
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
  (req: Request, res: Response, next: NextFunction): void => {
    scheduledReportController.scheduleReport.bind(scheduledReportController)(req, res, next);
  }
);

// Cancel a scheduled report
router.delete(
  '/:reportId',
  authenticate,
  authorize(['ADMIN']),
  validate(scheduledReportValidation.cancelScheduledReport),
  (req: Request, res: Response, next: NextFunction): void => {
    scheduledReportController.cancelScheduledReport.bind(scheduledReportController)(req, res, next);
  }
);

// Get all scheduled reports
router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(scheduledReportValidation.getScheduledReports),
  (req: Request, res: Response, next: NextFunction): void => {
    scheduledReportController.getScheduledReports.bind(scheduledReportController)(req, res, next);
  }
);

export default router; 