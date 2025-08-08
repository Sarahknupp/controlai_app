import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from './logging';

// Validation options interface
interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
}

// Default validation options
const defaultOptions: ValidationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true
};

// Validation middleware factory
export const createValidationMiddleware = (schema: Schema, options: ValidationOptions = {}) => {
  const validationOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const { error, value } = schema.validate(req.body, validationOptions);

      if (error) {
        // Format validation errors
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        // Log validation errors
        logger.warn('Validation error', {
          errors,
          body: req.body
        });

        return res.status(400).json({
          error: 'Validation Error',
          details: errors
        });
      }

      // Replace request body with validated value
      req.body = value;

      next();
    } catch (error) {
      logger.error('Validation error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Validation helper functions
export const validationHelpers = {
  // Format validation error
  formatValidationError: (error: any): any => {
    if (!error) {
      return null;
    }

    if (error.isJoi) {
      return {
        error: 'Validation Error',
        details: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }

    return {
      error: 'Validation Error',
      message: error.message
    };
  },

  // Validate object against schema
  validateObject: (schema: Schema, object: any, options: ValidationOptions = {}): any => {
    const validationOptions = { ...defaultOptions, ...options };
    const { error, value } = schema.validate(object, validationOptions);

    if (error) {
      throw error;
    }

    return value;
  },

  // Validate array of objects against schema
  validateArray: (schema: Schema, array: any[], options: ValidationOptions = {}): any[] => {
    const validationOptions = { ...defaultOptions, ...options };
    const { error, value } = schema.validate(array, validationOptions);

    if (error) {
      throw error;
    }

    return value;
  }
};

// Common validation schemas
export const validationSchemas = {
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
    const { error, value } = schema.validate(req, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .slice(0, 3) // Limita a 3 erros
        .map((detail: any) => detail.message)
        .join(', ');
      logger.warn('Validation error:', { error: errorMessage });
      if (typeof BadRequestError === 'function') {
        throw new BadRequestError(errorMessage);
      }
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    req.body = value;
    next();
  };
}; 