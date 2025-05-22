import Joi from 'joi';
import { ReportType } from '../types/report';

export const reportValidation = {
  generateReport: {
    body: Joi.object({
      type: Joi.string().valid(...Object.values(ReportType)).required(),
      name: Joi.string().required(),
      parameters: Joi.object().default({}),
      emailRecipients: Joi.array().items(Joi.string().email()).default([])
    })
  },

  getReports: {
    query: Joi.object({
      type: Joi.string().valid(...Object.values(ReportType)),
      status: Joi.string(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate'))
    })
  },

  getReport: {
    params: Joi.object({
      id: Joi.string().required()
    })
  },

  deleteReport: {
    params: Joi.object({
      id: Joi.string().required()
    })
  }
}; 