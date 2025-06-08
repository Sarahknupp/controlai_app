import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details
        .slice(0, 3) // Limita a 3 erros
        .map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
      throw new BadRequestError('Validation error', errors);
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
export const validationSchemas = {
  // User schemas
  createUser: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('user', 'admin').default('user'),
  }),

  updateUser: Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid('user', 'admin'),
    active: Joi.boolean(),
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    price: Joi.number().required().min(0),
    stock: Joi.number().required().min(0),
    category: Joi.string().required(),
    image: Joi.string().uri(),
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10),
    price: Joi.number().min(0),
    stock: Joi.number().min(0),
    category: Joi.string(),
    image: Joi.string().uri(),
  }),

  // Order schemas
  createOrder: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().required().min(1),
      })
    ).required().min(1),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
  }),

  updateOrder: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    trackingNumber: Joi.string(),
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