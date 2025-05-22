import Joi from 'joi';
import { ImportFormat } from '../types/import';

export const importValidation = {
  importData: Joi.object({
    body: Joi.object({
      type: Joi.string().required(),
      format: Joi.string().valid(...Object.values(ImportFormat)).required(),
      options: Joi.object({
        batchSize: Joi.number().min(1).max(10000).default(1000),
        validateOnly: Joi.boolean().default(false),
        skipDuplicates: Joi.boolean().default(false),
        updateExisting: Joi.boolean().default(false),
        customMapping: Joi.object().pattern(
          Joi.string(),
          Joi.string()
        ).default({})
      }).default()
    }).required()
  }),

  getImportStatus: Joi.object({
    params: Joi.object({
      importId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  }),

  deleteImport: Joi.object({
    params: Joi.object({
      importId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  })
}; 