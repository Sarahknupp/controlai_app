import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from './logging';

// Express validator options interface
interface ExpressValidatorOptions {
  errorFormatter?: (error: any) => any;
  customValidators?: { [key: string]: (value: any) => boolean };
  customSanitizers?: { [key: string]: (value: any) => any };
}

// Default express validator options
const defaultOptions: ExpressValidatorOptions = {
  errorFormatter: (error: any) => {
    return {
      field: error.param,
      message: error.msg
    };
  },
  customValidators: {},
  customSanitizers: {}
};

// Express validator middleware factory
export const createExpressValidatorMiddleware = (validations: ValidationChain[], options: ExpressValidatorOptions = {}) => {
  const expressValidatorOptions = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Get validation errors
      const errors = validationResult(req);

      // Check if there are errors
      if (!errors.isEmpty()) {
        // Log validation errors
        logger.warn('Validation error', {
          errors: errors.array(),
          body: req.body
        });

        // Format validation errors
        const formattedErrors = errors.array().map(error => expressValidatorOptions.errorFormatter!(error));

        return res.status(400).json({
          error: 'Validation Error',
          details: formattedErrors
        });
      }

      next();
    } catch (error) {
      logger.error('Validation error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Express validator helper functions
export const expressValidatorHelpers = {
  // Get express validator error formatter
  getExpressValidatorErrorFormatter: (): (error: any) => any => {
    return defaultOptions.errorFormatter!;
  },

  // Get express validator custom validators
  getExpressValidatorCustomValidators: (): { [key: string]: (value: any) => boolean } => {
    return defaultOptions.customValidators!;
  },

  // Get express validator custom sanitizers
  getExpressValidatorCustomSanitizers: (): { [key: string]: (value: any) => any } => {
    return defaultOptions.customSanitizers!;
  },

  // Format validation errors
  formatValidationErrors: (errors: any[]): any => {
    return {
      error: 'Validation Error',
      details: errors.map(error => defaultOptions.errorFormatter!(error))
    };
  }
}; 