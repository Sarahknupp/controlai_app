import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { logger } from './logging';

// Yup options interface
interface YupOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  recursive?: boolean;
  context?: any;
}

// Default yup options
const defaultOptions: YupOptions = {
  abortEarly: false,
  stripUnknown: true,
  recursive: true,
  context: {}
};

// Yup middleware factory
export const createYupMiddleware = (schema: yup.Schema<any>, options: YupOptions = {}) => {
  const yupOptions = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = await schema.validate(req.body, yupOptions);

      // Replace request body with validated data
      req.body = validatedData;

      next();
    } catch (error) {
      // Log validation error
      logger.warn('Validation error', {
        error: (error as Error).message,
        body: req.body
      });

      // Format validation error
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map(err => ({
          field: err.path,
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation Error',
          details: errors
        });
      }

      next(error);
    }
  };
};

// Yup helper functions
export const yupHelpers = {
  // Get yup abort early
  getYupAbortEarly: (): boolean => {
    return defaultOptions.abortEarly!;
  },

  // Get yup strip unknown
  getYupStripUnknown: (): boolean => {
    return defaultOptions.stripUnknown!;
  },

  // Get yup recursive
  getYupRecursive: (): boolean => {
    return defaultOptions.recursive!;
  },

  // Get yup context
  getYupContext: (): any => {
    return defaultOptions.context;
  },

  // Format validation error
  formatValidationError: (error: yup.ValidationError): any => {
    return {
      error: 'Validation Error',
      details: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    };
  }
}; 