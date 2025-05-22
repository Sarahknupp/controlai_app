import Joi from 'joi';

export const backupValidation = {
  createBackup: {
    body: Joi.object({
      type: Joi.string()
        .valid('full', 'incremental')
        .required(),
      entities: Joi.array()
        .items(Joi.string().valid('sales', 'products', 'customers', 'users'))
        .optional(),
      compression: Joi.boolean()
        .optional()
    })
  },

  restoreBackup: {
    params: Joi.object({
      backupId: Joi.string()
        .pattern(/^(full|incremental)_\d+\.json(\.gz)?$/)
        .required()
    })
  },

  deleteBackup: {
    params: Joi.object({
      backupId: Joi.string()
        .pattern(/^(full|incremental)_\d+\.json(\.gz)?$/)
        .required()
    })
  }
}; 