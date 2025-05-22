import Joi from 'joi';

export const validationValidation = {
  validateData: {
    body: Joi.object({
      type: Joi.string()
        .valid('sales', 'products', 'customers', 'users', 'all')
        .required(),
      filters: Joi.object().optional()
    })
  }
}; 