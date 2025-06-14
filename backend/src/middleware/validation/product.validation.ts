import Joi from 'joi';

export const createProductValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().required().min(0),
  stock: Joi.number().required().min(0)
});

export const updateProductValidation = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.number().min(0),
  stock: Joi.number().min(0)
}); 