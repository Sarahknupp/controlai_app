import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { logger } from '../utils/logger';

// Content types that should not be compressed
const NO_COMPRESS_CONTENT_TYPES = [
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
];

// Minimum response size to compress (1KB)
const MIN_COMPRESS_SIZE = 1024;

// Filter function to determine if response should be compressed
export const shouldCompress = (req: Request, res: Response): boolean => {
  const contentType = res.getHeader('Content-Type') as string;
  const contentLength = res.getHeader('Content-Length') as string;

  // Don't compress if content type is in the no-compress list
  if (contentType && NO_COMPRESS_CONTENT_TYPES.includes(contentType)) {
    return false;
  }

  // Don't compress if content length is less than minimum size
  if (contentLength && parseInt(contentLength, 10) < MIN_COMPRESS_SIZE) {
    return false;
  }

  return true;
};

export const compressionOptions = {
  level: 6,
  threshold: 1024,
  windowBits: 15
};

export const compressionMiddleware = compression(compressionOptions);

// Log compression stats
export const compressionLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body) {
    const contentLength = Buffer.byteLength(body as string);
    const compressedLength = res.getHeader('content-length');

    if (compressedLength) {
      const ratio = ((contentLength - Number(compressedLength)) / contentLength * 100).toFixed(2);
      logger.debug('Response compressed', {
        path: req.path,
        originalSize: `${contentLength} bytes`,
        compressedSize: `${compressedLength} bytes`,
        compressionRatio: `${ratio}%`
      });
    }

    return originalSend.call(this, body);
  };

  next();
}; 