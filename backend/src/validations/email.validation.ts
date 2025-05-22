import Joi from 'joi';

export const emailValidation = {
  sendReport: {
    body: Joi.object({
      email: Joi.string().email().required(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
    }),
  },
  sendPasswordReset: {
    body: Joi.object({
      email: Joi.string().email().required(),
      resetToken: Joi.string().required(),
    }),
  },
}; 