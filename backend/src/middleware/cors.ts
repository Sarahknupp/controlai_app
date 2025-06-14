import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from './logging';

// CORS options interface
interface CorsOptions {
  origin?: string | string[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

// Default CORS options
const defaultOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// CORS middleware factory
export const createCorsMiddleware = (options: CorsOptions = {}) => {
  const corsOptions = { ...defaultOptions, ...options };

  // Log CORS configuration
  logger.info('CORS middleware configured', {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    allowedHeaders: corsOptions.allowedHeaders,
    exposedHeaders: corsOptions.exposedHeaders,
    credentials: corsOptions.credentials,
    maxAge: corsOptions.maxAge
  });

  return cors(corsOptions);
};

// Apply CORS middleware
export const applyCorsMiddleware = (app: Express, options: CorsOptions = {}) => {
  const corsMiddleware = createCorsMiddleware(options);
  app.use(corsMiddleware);

  // Log CORS middleware setup
  logger.info('CORS middleware applied');
};

// CORS helper functions
export const corsHelpers = {
  // Check if origin is allowed
  isOriginAllowed: (origin: string, allowedOrigins: string | string[]): boolean => {
    if (allowedOrigins === '*') {
      return true;
    }

    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes(origin);
    }

    return allowedOrigins === origin;
  },

  // Get allowed methods
  getAllowedMethods: (methods: string | string[]): string[] => {
    if (Array.isArray(methods)) {
      return methods;
    }

    return methods.split(',').map(method => method.trim());
  },

  // Get allowed headers
  getAllowedHeaders: (headers: string | string[]): string[] => {
    if (Array.isArray(headers)) {
      return headers;
    }

    return headers.split(',').map(header => header.trim());
  },

  // Get exposed headers
  getExposedHeaders: (headers: string | string[]): string[] => {
    if (Array.isArray(headers)) {
      return headers;
    }

    return headers.split(',').map(header => header.trim());
  }
}; 