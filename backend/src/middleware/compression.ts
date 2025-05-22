import compression from 'compression';
import { Request, Response } from 'express';

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

// Compression options
export const compressionOptions = {
  level: 6, // Compression level (0-9)
  threshold: MIN_COMPRESS_SIZE, // Minimum response size to compress
  windowBits: 15, // Window size for compression
  memLevel: 8, // Memory level for compression
  strategy: 0, // Compression strategy
  chunkSize: 16 * 1024, // Chunk size for compression
  contentType: [
    'application/json',
    'text/html',
    'text/css',
    'application/javascript',
    'text/plain',
    'text/xml',
    'application/xml',
    'application/xhtml+xml',
    'text/javascript',
    'application/x-javascript',
    'text/x-js',
    'application/x-httpd-php',
    'application/x-httpd-php-source',
    'application/x-httpd-php3',
    'application/x-httpd-php3-preprocessed',
    'application/x-httpd-php4',
    'application/x-httpd-php5',
    'application/x-httpd-php-source',
    'application/x-httpd-php-source',
    'application/x-httpd-php-source',
  ],
};

// Create compression middleware with options
export const compressionMiddleware = compression({
  ...compressionOptions,
  filter: shouldCompress,
}); 