import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from './logging';

// Multer options interface
interface MulterOptions {
  dest?: string;
  limits?: {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  };
  fileFilter?: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => void;
  storage?: multer.StorageEngine;
}

// Default multer options
const defaultOptions: MulterOptions = {
  dest: 'uploads/',
  limits: {
    fieldNameSize: 100,
    fieldSize: 1024 * 1024,
    fields: 10,
    fileSize: 1024 * 1024 * 5,
    files: 5,
    parts: 20,
    headerPairs: 2000
  },
  fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'));
    }
    callback(null, true);
  },
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
      callback(null, defaultOptions.dest!);
    },
    filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      callback(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  })
};

// Multer middleware factory
export const createMulterMiddleware = (options: MulterOptions = {}) => {
  const multerOptions = { ...defaultOptions, ...options };

  return multer(multerOptions);
};

// Multer helper functions
export const multerHelpers = {
  // Get multer destination
  getMulterDestination: (): string => {
    return defaultOptions.dest!;
  },

  // Get multer limits
  getMulterLimits: (): any => {
    return defaultOptions.limits;
  },

  // Get multer file filter
  getMulterFileFilter: (): any => {
    return defaultOptions.fileFilter;
  },

  // Get multer storage
  getMulterStorage: (): any => {
    return defaultOptions.storage;
  }
}; 