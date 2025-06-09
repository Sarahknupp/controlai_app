import { Router } from 'express';
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
  (req, res, next): void => {
    metricsController.collectMetrics(req, res, next);
  }
);

// Get metrics status
router.get(
  '/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  (req, res, next): void => {
    metricsController.getMetricsStatus(req, res, next);
  }
);

// Get system metrics
router.get(
  '/system',
  authenticate,
  authorize(['admin']),
  (req, res, next): void => {
    metricsController.getSystemMetrics(req, res, next);
  }
);

// Get usage metrics
router.get(
  '/usage',
  authenticate,
  authorize(['admin']),
  validateRequest(metricsValidation.getUsageMetrics),
  (req, res, next): void => {
    metricsController.getUsageMetrics(req, res, next);
  }
);

export default router; 