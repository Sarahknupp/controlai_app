import { Request, Response, NextFunction } from 'express';
import { plainToClass, ClassTransformOptions } from 'class-transformer';
import { logger } from './logging';

// Transformation middleware factory
export const createTransformer = (dtoClass: any, options: ClassTransformOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform request body
      if (req.body) {
        req.body = plainToClass(dtoClass, req.body, {
          excludeExtraneousValues: true,
          ...options
        });
      }

      // Transform request query
      if (req.query) {
        req.query = plainToClass(dtoClass, req.query, {
          excludeExtraneousValues: true,
          ...options
        });
      }

      // Transform request params
      if (req.params) {
        req.params = plainToClass(dtoClass, req.params, {
          excludeExtraneousValues: true,
          ...options
        });
      }

      next();
    } catch (error) {
      logger.error('Transformation error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Common transformation functions
export const transformers = {
  // Transform to number
  toNumber: (value: any): number => {
    return Number(value);
  },

  // Transform to boolean
  toBoolean: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  },

  // Transform to date
  toDate: (value: any): Date => {
    return new Date(value);
  },

  // Transform to array
  toArray: (value: any): any[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return [value];
  },

  // Transform to object
  toObject: (value: any): Record<string, any> => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return { value };
      }
    }
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    return { value };
  },

  // Transform to string
  toString: (value: any): string => {
    return String(value);
  },

  // Transform to integer
  toInteger: (value: any): number => {
    return Math.floor(Number(value));
  },

  // Transform to float
  toFloat: (value: any): number => {
    return parseFloat(value);
  },

  // Transform to lowercase
  toLowerCase: (value: any): string => {
    return String(value).toLowerCase();
  },

  // Transform to uppercase
  toUpperCase: (value: any): string => {
    return String(value).toUpperCase();
  }
}; 