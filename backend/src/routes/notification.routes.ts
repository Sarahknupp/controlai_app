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
router.post('/send', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  notificationController.sendNotification(req, res, next);
});

// Send low stock alert
router.post('/low-stock', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  notificationController.sendLowStockAlert(req, res, next);
});

// Send sales target alert
router.post('/sales-target', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  notificationController.sendSalesTargetAlert(req, res, next);
});

// Send system maintenance notification
router.post('/maintenance', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  notificationController.sendMaintenanceNotification(req, res, next);
});

// Send security alert
router.post('/security', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req, res, next): void => {
  notificationController.sendSecurityAlert(req, res, next);
});

export default router; 