import { Request, Response, NextFunction } from 'express';
import { sanitize } from 'class-sanitizer';
import { plainToClass } from 'class-transformer';
import { logger } from './logging';

// Sanitization middleware factory
export const createSanitizer = (dtoClass: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert plain object to class instance
      const dtoObject = plainToClass(dtoClass, req.body);

      // Sanitize the object
      sanitize(dtoObject);

      // Update request body with sanitized data
      req.body = dtoObject;

      next();
    } catch (error) {
      logger.error('Sanitization error', { error: (error as Error).message });
      next(error);
    }
  };
};

// Common sanitization functions
export const sanitizers = {
  // Remove HTML tags
  stripHtml: (value: string): string => {
    return value.replace(/<[^>]*>/g, '');
  },

  // Remove special characters
  stripSpecialChars: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  // Remove extra whitespace
  normalizeWhitespace: (value: string): string => {
    return value.replace(/\s+/g, ' ').trim();
  },

  // Convert to lowercase
  toLowerCase: (value: string): string => {
    return value.toLowerCase();
  },

  // Convert to uppercase
  toUpperCase: (value: string): string => {
    return value.toUpperCase();
  },

  // Remove numbers
  stripNumbers: (value: string): string => {
    return value.replace(/[0-9]/g, '');
  },

  // Keep only numbers
  keepNumbers: (value: string): string => {
    return value.replace(/[^0-9]/g, '');
  },

  // Remove email
  stripEmail: (value: string): string => {
    return value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  },

  // Remove phone numbers
  stripPhone: (value: string): string => {
    return value.replace(/\+?[\d\s-()]{10,}/g, '');
  },

  // Remove URLs
  stripUrl: (value: string): string => {
    return value.replace(/https?:\/\/[^\s]+/g, '');
  }
}; 