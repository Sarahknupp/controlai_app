import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from './logging';
import { errorHelpers } from './errorHandler';

// Schema validation options interface
interface SchemaValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  presence?: 'optional' | 'required';
  context?: any;
}

// Default schema validation options
const defaultOptions: SchemaValidationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
  presence: 'optional'
};

// Schema validation middleware factory
export const createSchemaValidationMiddleware = (schema: Schema, options: SchemaValidationOptions = {}) => {
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
        logger.warn('Schema validation error', {
          errors,
          body: req.body
        });

        // Create validation error
        const validationError = errorHelpers.createValidationError('Schema validation failed', errors);

        // Pass error to error handler
        return next(validationError);
      }

      // Replace request body with validated value
      req.body = value;

      next();
    } catch (error) {
      logger.error('Schema validation error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Schema validation helper functions
export const schemaValidationHelpers = {
  // Validate object against schema
  validateObject: (schema: Schema, object: any, options: SchemaValidationOptions = {}): any => {
    const validationOptions = { ...defaultOptions, ...options };
    const { error, value } = schema.validate(object, validationOptions);

    if (error) {
      throw error;
    }

    return value;
  },

  // Validate array against schema
  validateArray: (schema: Schema, array: any[], options: SchemaValidationOptions = {}): any[] => {
    const validationOptions = { ...defaultOptions, ...options };
    const { error, value } = schema.validate(array, validationOptions);

    if (error) {
      throw error;
    }

    return value;
  },

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
  }
}; 