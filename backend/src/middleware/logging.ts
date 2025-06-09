import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { format } from 'winston';
import { IUser } from '../types/user';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      startTime?: number;
    }
  }
}

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(colors);

// Create logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({ filename: 'logs/all.log' })
  ]
});

// Logging options interface
interface LoggingOptions {
  level?: string;
  message?: string;
  skip?: (req: Request) => boolean;
}

// Default logging options
const defaultOptions: LoggingOptions = {
  level: 'info',
  message: 'Request completed',
  skip: (req: Request) => false
};

// Logging middleware factory
export const createLoggingMiddleware = (options: LoggingOptions = {}) => {
  const loggingOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip logging if skip function returns true
    if (loggingOptions.skip!(req)) {
      return next();
    }

    // Get start time
    const start = Date.now();

    // Log request
    logger.http('Request started', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    });

    // Log response
    res.on('finish', () => {
      // Get response time
      const duration = Date.now() - start;

      // Log response
      logger.log(loggingOptions.level!, loggingOptions.message!, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userId: req.user?.id
      });
    });

    next();
  };
};

// Logging helper functions
export const loggingHelpers = {
  // Log error
  logError: (error: Error, req?: Request): void => {
    logger.error('Error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      request: req ? {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id
      } : undefined
    });
  },

  // Log warning
  logWarning: (message: string, data?: any): void => {
    logger.warn(message, data);
  },

  // Log info
  logInfo: (message: string, data?: any): void => {
    logger.info(message, data);
  },

  // Log debug
  logDebug: (message: string, data?: any): void => {
    logger.debug(message, data);
  }
};

export default logger;

// Request logger middleware
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });

  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function (body: any): Response {
    // Log response
    logger.info('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: Date.now() - req._startTime
    });

    // Restore original send function
    res.send = originalSend;

    // Call original send function
    return originalSend.call(this, body);
  };

  // Add start time to request
  req._startTime = Date.now();

  next();
}

// Error logger middleware
export function errorLogger(error: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      user: req.user ? req.user.id : 'anonymous'
    }
  });

  next(error);
}

// Performance logger middleware
export function performanceLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    logger.info('Request performance', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`
    });
  });

  next();
} 