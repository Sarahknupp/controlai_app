import Joi from 'joi';
import { ExportFormat } from '../services/export.service';

export const exportValidation = {
  exportData: Joi.object({
    body: Joi.object({
      type: Joi.string().required(),
      format: Joi.string().valid(...Object.values(ExportFormat)).required(),
      filters: Joi.object({
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')),
        status: Joi.string(),
        [Joi.string()]: Joi.any()
      }).default(),
      options: Joi.object({
        batchSize: Joi.number().min(1).max(10000).default(1000),
        includeHeaders: Joi.boolean().default(true),
        compression: Joi.boolean().default(false),
        customFields: Joi.array().items(Joi.string()).default([]),
        sortBy: Joi.string().default('createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
      }).default()
    }).required()
  }),

  getExportStatus: Joi.object({
    params: Joi.object({
      exportId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  }),

  downloadExport: Joi.object({
    params: Joi.object({
      exportId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  }),

  deleteExport: Joi.object({
    params: Joi.object({
      exportId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  })
}; 