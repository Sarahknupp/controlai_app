import Joi from 'joi';
import { AuditAction, EntityType } from '../types/audit';

export const auditValidation = {
  getAuditLogs: {
    query: Joi.object({
      action: Joi.string().valid(...Object.values(AuditAction)),
      entityType: Joi.string().valid(...Object.values(EntityType)),
      entityId: Joi.string(),
      userId: Joi.string(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
      status: Joi.string(),
      search: Joi.string(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().valid('timestamp', 'action', 'entityType', 'status'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  },

  getAuditLog: {
    params: Joi.object({
      id: Joi.string().required()
    })
  },

  deleteAuditLog: {
    params: Joi.object({
      id: Joi.string().required()
    })
  },

  clearAuditLogs: {
    body: Joi.object({
      beforeDate: Joi.date().iso().required()
    })
  },

  getAuditStats: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
    }),
  },

  cleanupAuditLogs: {
    query: Joi.object({
      days: Joi.number().integer().min(1).max(365).default(90),
    }),
  },
}; 