import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../utils/errors';
import { logger } from './logging';

// Upload options interface
interface UploadOptions {
  destination?: string;
  filename?: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => void;
  limits?: {
    fileSize?: number;
    files?: number;
  };
  fileFilter?: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
}

// Default upload options
const defaultOptions: UploadOptions = {
  destination: 'uploads/',
  filename: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestError('Invalid file type'), false);
    }
  }
};

// Upload middleware factory
export const createUploadMiddleware = (options: UploadOptions = {}) => {
  const uploadOptions = { ...defaultOptions, ...options };

  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadOptions.destination!)) {
    fs.mkdirSync(uploadOptions.destination!, { recursive: true });
  }

  // Configure storage
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
      callback(null, uploadOptions.destination!);
    },
    filename: uploadOptions.filename
  });

  // Create multer instance
  const upload = multer({
    storage,
    limits: uploadOptions.limits,
    fileFilter: uploadOptions.fileFilter
  });

  // Log upload configuration
  logger.info('Upload middleware configured', {
    destination: uploadOptions.destination,
    limits: uploadOptions.limits,
    fileFilter: !!uploadOptions.fileFilter
  });

  return upload;
};

// Upload helper functions
export const uploadHelpers = {
  // Get file extension
  getFileExtension: (filename: string): string => {
    return path.extname(filename).toLowerCase();
  },

  // Get file mime type
  getFileMimeType: (filename: string): string => {
    const ext = uploadHelpers.getFileExtension(filename);
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  },

  // Check if file is image
  isImage: (filename: string): boolean => {
    const mimeType = uploadHelpers.getFileMimeType(filename);
    return mimeType.startsWith('image/');
  },

  // Check if file is document
  isDocument: (filename: string): boolean => {
    const mimeType = uploadHelpers.getFileMimeType(filename);
    return mimeType.startsWith('application/');
  },

  // Get file size in bytes
  getFileSize: (file: Express.Multer.File): number => {
    return file.size;
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}; 