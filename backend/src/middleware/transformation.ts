import { Request, Response, NextFunction } from 'express';
import { logger } from './logging';
import { errorHelpers } from './errorHandler';

// Transformation options interface
interface TransformationOptions {
  body?: boolean;
  query?: boolean;
  params?: boolean;
  headers?: boolean;
  cookies?: boolean;
  transform?: (value: any) => any;
  validate?: (value: any) => boolean;
  errorMessage?: string;
}

// Default transformation options
const defaultOptions: TransformationOptions = {
  body: true,
  query: true,
  params: true,
  headers: false,
  cookies: false,
  transform: (value: any) => value,
  validate: (value: any) => true,
  errorMessage: 'Invalid value'
};

// Transformation middleware factory
export const createTransformationMiddleware = (options: TransformationOptions = {}) => {
  const transformationOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform request body
      if (transformationOptions.body && req.body) {
        req.body = transformObject(req.body, transformationOptions);
      }

      // Transform request query
      if (transformationOptions.query && req.query) {
        req.query = transformObject(req.query, transformationOptions);
      }

      // Transform request params
      if (transformationOptions.params && req.params) {
        req.params = transformObject(req.params, transformationOptions);
      }

      // Transform request headers
      if (transformationOptions.headers && req.headers) {
        req.headers = transformObject(req.headers, transformationOptions);
      }

      // Transform request cookies
      if (transformationOptions.cookies && req.cookies) {
        req.cookies = transformObject(req.cookies, transformationOptions);
      }

      next();
    } catch (error) {
      logger.error('Transformation error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Transform object
const transformObject = (obj: any, options: TransformationOptions): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformObject(item, options));
  }

  const transformed: any = {};

  for (const [key, value] of Object.entries(obj)) {
    transformed[key] = transformValue(value, options);
  }

  return transformed;
};

// Transform value
const transformValue = (value: any, options: TransformationOptions): any => {
  if (value === null || value === undefined) {
    return value;
  }

  // Transform value
  const transformed = options.transform!(value);

  // Validate transformed value
  if (!options.validate!(transformed)) {
    throw errorHelpers.createValidationError(options.errorMessage!, {
      value,
      transformed
    });
  }

  if (typeof transformed === 'object') {
    return transformObject(transformed, options);
  }

  return transformed;
};

// Transformation helper functions
export const transformationHelpers = {
  // Transform string
  transformString: (value: any, options: TransformationOptions = {}): string => {
    return transformValue(value, { ...defaultOptions, ...options }) as string;
  },

  // Transform number
  transformNumber: (value: any, options: TransformationOptions = {}): number => {
    return transformValue(value, { ...defaultOptions, ...options }) as number;
  },

  // Transform boolean
  transformBoolean: (value: any, options: TransformationOptions = {}): boolean => {
    return transformValue(value, { ...defaultOptions, ...options }) as boolean;
  },

  // Transform date
  transformDate: (value: any, options: TransformationOptions = {}): Date => {
    return transformValue(value, { ...defaultOptions, ...options }) as Date;
  },

  // Transform array
  transformArray: (value: any, options: TransformationOptions = {}): any[] => {
    return transformValue(value, { ...defaultOptions, ...options }) as any[];
  },

  // Transform object
  transformObject: (value: any, options: TransformationOptions = {}): any => {
    return transformValue(value, { ...defaultOptions, ...options }) as any;
  }
}; 