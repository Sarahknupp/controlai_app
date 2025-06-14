import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { logger } from './logging';

// Winston options interface
interface WinstonOptions {
  level?: string;
  format?: winston.Logform.Format;
  transports?: winston.transport[];
  exitOnError?: boolean;
  silent?: boolean;
}

// Default winston options
const defaultOptions: WinstonOptions = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ],
  exitOnError: false,
  silent: false
};

// Winston middleware factory
export const createWinstonMiddleware = (options: WinstonOptions = {}) => {
  const winstonOptions = { ...defaultOptions, ...options };

  // Create winston logger
  const winstonLogger = winston.createLogger(winstonOptions);

  // Winston middleware
  return (req: Request, res: Response, next: NextFunction) => {
    // Log request
    winstonLogger.info('Request received', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    });

    // Log response
    res.on('finish', () => {
      winstonLogger.info('Response sent', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        ip: req.ip,
        userId: req.user?.id
      });
    });

    next();
  };
};

// Winston helper functions
export const winstonHelpers = {
  // Get winston level
  getWinstonLevel: (): string => {
    return defaultOptions.level!;
  },

  // Get winston format
  getWinstonFormat: (): winston.Logform.Format => {
    return defaultOptions.format!;
  },

  // Get winston transports
  getWinstonTransports: (): winston.transport[] => {
    return defaultOptions.transports!;
  },

  // Get winston exit on error
  getWinstonExitOnError: (): boolean => {
    return defaultOptions.exitOnError!;
  },

  // Get winston silent
  getWinstonSilent: (): boolean => {
    return defaultOptions.silent!;
  }
}; 