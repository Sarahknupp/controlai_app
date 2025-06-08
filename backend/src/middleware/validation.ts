import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../utils/errors';
import logger from './logging';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.error('Validation error', { error: error.details });
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  createUser: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('user', 'admin').default('user')
  }),

  updateUser: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid('user', 'admin')
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    stock: Joi.number().required().min(0),
    category: Joi.string().required()
  }),

  updateProduct: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    price: Joi.number().min(0),
    stock: Joi.number().min(0),
    category: Joi.string()
  }),

  // Order schemas
  createOrder: Joi.object({
    customerId: Joi.string().required(),
    products: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().required().min(1)
      })
    ).required()
  }),

  updateOrder: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').required()
  }),

  // Authentication schemas
  login: Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),

  register: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),

  // Pagination schemas
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  // Search schemas
  search: Joi.object({
    query: Joi.string().required().min(1),
    category: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    inStock: Joi.boolean(),
  }),
};

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .slice(0, 3) // Limita a 3 erros
        .map((detail: any) => detail.message)
        .join(', ');
      logger.warn('Validation error:', { error: errorMessage });
      throw new BadRequestError(errorMessage);
    }

    next();
  };
}; 