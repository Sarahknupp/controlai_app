import Joi from 'joi';
import { UserRole } from '../models/User';

export const registerValidation = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required(),
    role: Joi.string().valid(...Object.values(UserRole)).optional(),
  })
};

export const loginValidation = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
  })
};

export const updateDetailsValidation = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    email: Joi.string().trim().email().optional(),
  })
};

export const updatePasswordValidation = {
  body: Joi.object({
    currentPassword: Joi.string().trim().required(),
    newPassword: Joi.string().trim().min(6).required(),
  })
}; 