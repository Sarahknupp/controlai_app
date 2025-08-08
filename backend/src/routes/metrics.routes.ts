import { Router, Request, Response, NextFunction } from 'express';
import { MetricsController } from '../controllers/metrics.controller';
import { validateRequest } from '../middleware/validation';
import { metricsValidation } from '../validations/metrics.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../types/user';

const router = Router();
const metricsController = new MetricsController();

// Collect metrics
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateRequest(metricsValidation.collectMetrics),
  (req: Request, res: Response, next: NextFunction): void => {
    metricsController.collectMetrics(req, res, next);
  }
);

// Get metrics status
router.get(
  '/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  (req: Request, res: Response, next: NextFunction): void => {
    metricsController.getMetricsStatus(req, res, next);
  }
);

// Get system metrics
router.get(
  '/system',
  authenticate,
  authorize([UserRole.ADMIN]),
  metricsController.getSystemMetrics.bind(metricsController)
);

// Get usage metrics
router.get(
  '/usage',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateRequest(metricsValidation.getUsageMetrics),
  (req: Request, res: Response, next: NextFunction): void => {
    metricsController.getUsageMetrics(req, res, next);
  }
);

export default router; 