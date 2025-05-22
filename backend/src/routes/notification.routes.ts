import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validateRequest } from '../middleware/validation';
import { notificationValidation } from '../validations/notification.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../types/user';

const router = Router();
const notificationController = new NotificationController();

// Send general notification
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateRequest(notificationValidation.sendNotification),
  notificationController.sendNotification.bind(notificationController)
);

// Send low stock alert
router.post(
  '/low-stock',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateRequest(notificationValidation.sendLowStockAlert),
  notificationController.sendLowStockAlert.bind(notificationController)
);

// Send sales target alert
router.post(
  '/sales-target',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateRequest(notificationValidation.sendSalesTargetAlert),
  notificationController.sendSalesTargetAlert.bind(notificationController)
);

// Send system maintenance notification
router.post(
  '/maintenance',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateRequest(notificationValidation.sendSystemMaintenanceNotification),
  notificationController.sendSystemMaintenanceNotification.bind(notificationController)
);

// Send security alert
router.post(
  '/security',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateRequest(notificationValidation.sendSecurityAlert),
  notificationController.sendSecurityAlert.bind(notificationController)
);

export default router; 