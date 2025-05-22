import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';
import { IUser } from '../types/user';

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    // Write all logs to console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
    // Write all logs with level 'error' and below to error.log
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with level 'info' and below to combined.log
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Capture request start time
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body: any): Response {
    // Calculate response time
    const responseTime = Date.now() - start;

    // Log response
    logger.info('Outgoing response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id,
    });

    // Restore original send function
    res.send = originalSend;
    return res.send(body);
  };

  next();
};

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
    },
  });

  next(error);
}; 