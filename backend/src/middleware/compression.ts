import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { logger } from './logging';
import { Express } from 'express';

// Compression options interface
interface CompressionOptions {
  level?: number;
  threshold?: number;
  filter?: (req: Request, res: Response) => boolean;
}

// Default compression options
const defaultOptions: CompressionOptions = {
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    // Skip compression for small responses
    if (res.getHeader('Content-Length') && Number(res.getHeader('Content-Length')) < defaultOptions.threshold!) {
      return false;
    }

    // Skip compression for non-text responses
    const contentType = res.getHeader('Content-Type');
    if (typeof contentType === 'string' && !contentType.includes('text/') && !contentType.includes('application/json')) {
      return false;
    }

    return true;
  }
};

// Compression middleware factory
export const createCompressionMiddleware = (options: CompressionOptions = {}) => {
  const compressionOptions = { ...defaultOptions, ...options };

  return compression(compressionOptions);
};

// Compression helper functions
export const compressionHelpers = {
  // Get compression level
  getCompressionLevel: (req: Request): number => {
    const acceptEncoding = req.headers['accept-encoding'];
    if (typeof acceptEncoding === 'string') {
      if (acceptEncoding.includes('gzip')) {
        return 6;
      }
      if (acceptEncoding.includes('deflate')) {
        return 4;
      }
    }
    return 0;
  },

  // Get compression threshold
  getCompressionThreshold: (req: Request): number => {
    return defaultOptions.threshold!;
  },

  // Check if response should be compressed
  shouldCompress: (req: Request, res: Response): boolean => {
    return defaultOptions.filter!(req, res);
  }
};

// Content types that should not be compressed
const excludedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-gzip',
  'application/x-bzip2',
  'application/x-tar',
  'application/x-xz',
  'application/x-lzma',
  'application/x-lzip',
  'application/x-lzop',
  'application/x-lz4',
  'application/x-zstd',
  'application/x-brotli',
  'application/x-deflate',
  'application/x-inflate',
  'application/x-compress',
  'application/x-compressed',
  'application/x-gzip-compressed',
  'application/x-bzip2-compressed',
  'application/x-tar-compressed',
  'application/x-xz-compressed',
  'application/x-lzma-compressed',
  'application/x-lzip-compressed',
  'application/x-lzop-compressed',
  'application/x-lz4-compressed',
  'application/x-zstd-compressed',
  'application/x-brotli-compressed',
  'application/x-deflate-compressed',
  'application/x-inflate-compressed',
  'application/x-compress-compressed',
  'application/x-compressed-compressed'
];

// Filter function to determine if response should be compressed
export const shouldCompress = (req: any, res: any): boolean => {
  const contentType = res.getHeader('Content-Type') as string;
  const contentLength = res.getHeader('Content-Length') as string;

  // Don't compress if content type is excluded
  if (contentType && excludedContentTypes.includes(contentType)) {
    return false;
  }

  // Don't compress if content length is too small
  if (contentLength && parseInt(contentLength) < 1024) {
    return false;
  }

  return true;
};

// Log compression stats
export const compressionLogger = (req: any, res: any, next: any) => {
  const originalSend = res.send;
  const start = process.hrtime();

  res.send = function(body: any) {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    logger.info('Response compression', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      contentLength: body.length,
      compressed: res.getHeader('content-encoding') === 'gzip'
    });

    return originalSend.call(this, body);
  };

  next();
};

// Compression options
const compressionOptions = {
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1kb
  filter: (req: any, res: any) => {
    // Don't compress if client doesn't support compression
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use default compression filter
    return compression.filter(req, res);
  }
};

// Apply compression middleware
export const applyCompressionMiddleware = (app: Express): void => {
  try {
    app.use(compression(compressionOptions));
    logger.info('Compression middleware applied successfully');
  } catch (error) {
    logger.error('Error applying compression middleware:', error);
    throw error;
  }
};

// Export alias
export const compressionMiddleware = applyCompressionMiddleware; 