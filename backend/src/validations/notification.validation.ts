import Joi from 'joi';
import { NotificationType, NotificationPriority } from '../types/notification';

export const notificationValidation = {
  sendNotification: {
    body: Joi.object({
      type: Joi.string()
        .valid(...Object.values(NotificationType))
        .required(),
      priority: Joi.string()
        .valid(...Object.values(NotificationPriority))
        .required(),
      title: Joi.string().required(),
      message: Joi.string().required(),
      recipient: Joi.string().email(),
      entityType: Joi.string(),
      entityId: Joi.string(),
      metadata: Joi.object()
    })
  },

  sendLowStockAlert: {
    body: Joi.object({
      productId: Joi.string().required(),
      productName: Joi.string().required(),
      currentStock: Joi.number().integer().min(0).required()
    })
  },

  sendSalesTargetAlert: {
    body: Joi.object({
      userId: Joi.string().required(),
      userName: Joi.string().required(),
      target: Joi.number().min(0).required(),
      current: Joi.number().min(0).required()
    })
  },

  sendSystemMaintenanceNotification: {
    body: Joi.object({
      message: Joi.string().required(),
      startTime: Joi.date().iso().required(),
      endTime: Joi.date().iso().min(Joi.ref('startTime')).required()
    })
  },

  sendSecurityAlert: {
    body: Joi.object({
      userId: Joi.string().required(),
      action: Joi.string().required(),
      details: Joi.string().required()
    })
  }
}; 