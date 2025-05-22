import Joi from 'joi';

export const ocrValidation = {
  scanDocument: Joi.object({
    image: Joi.string().required(),
    language: Joi.string().default('por'),
    options: Joi.object({
      detectOrientation: Joi.boolean().default(true),
      detectTables: Joi.boolean().default(true),
      detectText: Joi.boolean().default(true),
    }).default(),
  }),

  processImage: Joi.object({
    image: Joi.string().required(),
    type: Joi.string().valid('product', 'document', 'receipt').required(),
    options: Joi.object({
      extractFields: Joi.array().items(Joi.string()),
      validateData: Joi.boolean().default(true),
      autoCorrect: Joi.boolean().default(true),
    }).default(),
  }),

  getHistory: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    type: Joi.string().valid('product', 'document', 'receipt'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    status: Joi.string().valid('success', 'error', 'pending'),
  }),
}; 