import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { format, transports } from 'winston';
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

const loggerInstance = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  loggerInstance.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  // Store original send function
  const originalSend = res.send;

  // Override send function
  res.send = function (body) {
    const responseTime = Date.now() - start;

    // Log response
    logger.info('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id
    });

    // Restore original send function
    res.send = originalSend;

    // Call original send function
    return originalSend.call(this, body);
  };

  req.startTime = start;
  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    }
  });

  next(err);
};

// Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    loggerInstance.info('Request performance', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userId: req.user?.id,
    });
  });

  next();
};

export default loggerInstance; 