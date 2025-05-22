import Joi from 'joi';
import { ReportFormat, ReportSchedule } from '../services/scheduled-report.service';

export const scheduledReportValidation = {
  scheduleReport: Joi.object({
    body: Joi.object({
      name: Joi.string().min(3).max(100).required(),
      type: Joi.string().valid('sales', 'inventory', 'customer', 'financial').required(),
      format: Joi.string().valid(...Object.values(ReportFormat)).required(),
      schedule: Joi.string().pattern(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/).required(),
      recipients: Joi.array().items(Joi.string().email()).min(1).required(),
      filters: Joi.object({
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')),
        status: Joi.string(),
        [Joi.string()]: Joi.any()
      }).default({}),
      options: Joi.object({
        includeCharts: Joi.boolean().default(true),
        includeSummary: Joi.boolean().default(true),
        compression: Joi.boolean().default(false),
        customFields: Joi.array().items(Joi.string()).default([])
      }).default({})
    }).required()
  }),

  cancelScheduledReport: Joi.object({
    params: Joi.object({
      reportId: Joi.string().pattern(/^report_[a-zA-Z]+_\d+$/).required()
    }).required()
  }),

  getScheduledReports: Joi.object({})
}; 