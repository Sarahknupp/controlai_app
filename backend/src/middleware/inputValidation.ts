import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { BadRequestError } from '../utils/errors';
import { logger } from './logging';

// Input validation middleware factory
export const createValidator = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert plain object to class instance
      const dtoObject = plainToClass(dtoClass, req.body);

      // Validate the object
      const errors = await validate(dtoObject, {
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true
      });

      if (errors.length > 0) {
        const errorMessages = errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }));

        logger.warn('Validation error', { errors: errorMessages });
        throw new BadRequestError('Validation error', errorMessages);
      }

      // Update request body with validated data
      req.body = dtoObject;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation functions
export const validators = {
  // Validate email
  isEmail: (value: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  },

  // Validate phone number
  isPhone: (value: string): boolean => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(value);
  },

  // Validate URL
  isUrl: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // Validate date
  isDate: (value: string): boolean => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },

  // Validate number
  isNumber: (value: string): boolean => {
    return !isNaN(Number(value));
  },

  // Validate integer
  isInteger: (value: string): boolean => {
    return Number.isInteger(Number(value));
  },

  // Validate boolean
  isBoolean: (value: string): boolean => {
    return value === 'true' || value === 'false';
  },

  // Validate array
  isArray: (value: any): boolean => {
    return Array.isArray(value);
  },

  // Validate object
  isObject: (value: any): boolean => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },

  // Validate string
  isString: (value: any): boolean => {
    return typeof value === 'string';
  }
}; 