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
  metricsController.collectMetrics.bind(metricsController)
);

// Get metrics status
router.get(
  '/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  metricsController.getMetricsStatus.bind(metricsController)
);

// Get system metrics
router.get(
  '/system',
  authenticate,
  authorize(['admin']),
  metricsController.getSystemMetrics.bind(metricsController)
);

// Get usage metrics
router.get(
  '/usage',
  authenticate,
  authorize(['admin']),
  validateRequest(metricsValidation.getUsageMetrics),
  metricsController.getUsageMetrics.bind(metricsController)
);

export default router; 