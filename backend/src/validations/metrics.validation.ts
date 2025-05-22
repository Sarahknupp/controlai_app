import Joi from 'joi';

export const metricsValidation = {
  getUsageMetrics: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
      interval: Joi.string().valid('hour', 'day', 'week', 'month'),
    }),
  },
  collectMetrics: {
    body: Joi.object({
      type: Joi.string()
        .valid('system', 'business', 'all')
        .required(),
      timeRange: Joi.object({
        start: Joi.date()
          .required(),
        end: Joi.date()
          .required()
      })
      .optional()
    })
  }
}; 