import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from './logging';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// Apply security middleware to Express app
export const applySecurityMiddleware = (app: Express) => {
  // Apply helmet for security headers
  app.use(helmet());

  // Configure CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Remove sensitive headers
  app.use((req: any, res: any, next: any) => {
    res.set('X-Powered-By', '');
    res.set('Server', '');
    next();
  });

  // Log security events
  app.use((req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const forwardedFor = req.get('x-forwarded-for');
    const forwardedProto = req.get('x-forwarded-proto');

    if (forwardedFor || forwardedProto) {
      logger.info('Proxy detected', {
        ip,
        forwardedFor,
        forwardedProto,
        userAgent
      });
    }

    next();
  });
}; 