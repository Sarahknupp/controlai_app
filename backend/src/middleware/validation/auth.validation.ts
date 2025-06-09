import Joi from 'joi';

export const registerValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('user', 'admin').default('user')
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateDetailsValidation = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('user', 'admin')
});

export const updatePasswordValidation = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required().min(6)
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordValidation = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().min(6)
}); 