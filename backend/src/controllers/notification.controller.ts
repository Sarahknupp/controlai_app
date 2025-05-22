import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';
import { NotificationType, NotificationPriority } from '../types/notification';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async sendNotification(req: Request, res: Response) {
    try {
      const {
        type,
        priority,
        title,
        message,
        recipient,
        entityType,
        entityId,
        metadata
      } = req.body;

      await this.notificationService.sendNotification({
        type: type as NotificationType,
        priority: priority as NotificationPriority,
        title,
        message,
        recipient,
        entityType,
        entityId,
        metadata
      });

      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw new BadRequestError('Failed to send notification');
    }
  }

  async sendLowStockAlert(req: Request, res: Response) {
    try {
      const { productId, productName, currentStock } = req.body;

      await this.notificationService.sendLowStockAlert(
        productId,
        productName,
        currentStock
      );

      res.json({ message: 'Low stock alert sent successfully' });
    } catch (error) {
      logger.error('Error sending low stock alert:', error);
      throw new BadRequestError('Failed to send low stock alert');
    }
  }

  async sendSalesTargetAlert(req: Request, res: Response) {
    try {
      const { userId, userName, target, current } = req.body;

      await this.notificationService.sendSalesTargetAlert(
        userId,
        userName,
        target,
        current
      );

      res.json({ message: 'Sales target alert sent successfully' });
    } catch (error) {
      logger.error('Error sending sales target alert:', error);
      throw new BadRequestError('Failed to send sales target alert');
    }
  }

  async sendSystemMaintenanceNotification(req: Request, res: Response) {
    try {
      const { message, startTime, endTime } = req.body;

      await this.notificationService.sendSystemMaintenanceNotification(
        message,
        new Date(startTime),
        new Date(endTime)
      );

      res.json({ message: 'System maintenance notification sent successfully' });
    } catch (error) {
      logger.error('Error sending system maintenance notification:', error);
      throw new BadRequestError('Failed to send system maintenance notification');
    }
  }

  async sendSecurityAlert(req: Request, res: Response) {
    try {
      const { userId, action, details } = req.body;

      await this.notificationService.sendSecurityAlert(
        userId,
        action,
        details
      );

      res.json({ message: 'Security alert sent successfully' });
    } catch (error) {
      logger.error('Error sending security alert:', error);
      throw new BadRequestError('Failed to send security alert');
    }
  }
} 