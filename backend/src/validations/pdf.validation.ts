import Joi from 'joi';

export const pdfValidation = {
  generateReport: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
    }),
  },
}; 