import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import { logger } from './logger';

// Configuração do CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

// Configuração do Helmet
const helmetOptions: HelmetOptions = {
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
  crossOriginResourcePolicy: { policy: 'same-site' as const },
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
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
};

// Aplica middlewares de segurança
export const applySecurityMiddleware = (app: Express): void => {
  try {
    // CORS
    app.use(cors(corsOptions));
    logger.info('CORS configurado');

    // Helmet
    app.use(helmet(helmetOptions));
    logger.info('Helmet configurado');

    // Outros headers de segurança
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('X-Download-Options', 'noopen');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
    logger.info('Headers de segurança configurados');

  } catch (error) {
    logger.error('Erro ao configurar middlewares de segurança:', error);
    throw error;
  }
};

// Configurações de segurança
export const securityConfig = {
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por windowMs
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },

  // Password
  password: {
    minLength: 6,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  }
}; 