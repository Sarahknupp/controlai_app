import { Express } from 'express';
import helmet from 'helmet';
import { logger } from './logging';
import mongoSanitize from 'express-mongo-sanitize';

// Security options interface
interface SecurityOptions {
  contentSecurityPolicy?: boolean | object;
  crossOriginEmbedderPolicy?: boolean | object;
  crossOriginOpenerPolicy?: boolean | object;
  crossOriginResourcePolicy?: boolean | object;
  dnsPrefetchControl?: boolean | object;
  expectCt?: boolean | object;
  frameguard?: boolean | object;
  hidePoweredBy?: boolean | object;
  hsts?: boolean | object;
  ieNoOpen?: boolean | object;
  noSniff?: boolean | object;
  originAgentCluster?: boolean | object;
  permittedCrossDomainPolicies?: boolean | object;
  referrerPolicy?: boolean | object;
  xssFilter?: boolean | object;
}

// Default security options
const defaultOptions: SecurityOptions = {
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
  dnsPrefetchControl: true,
  expectCt: {
    enforce: true,
    maxAge: 30
  },
  frameguard: {
    action: 'deny'
  },
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

// Security middleware factory
export const createSecurityMiddleware = (options: SecurityOptions = {}) => {
  const securityOptions = { ...defaultOptions, ...options };

  // Log security configuration
  logger.info('Security middleware configured', {
    contentSecurityPolicy: !!securityOptions.contentSecurityPolicy,
    crossOriginEmbedderPolicy: !!securityOptions.crossOriginEmbedderPolicy,
    crossOriginOpenerPolicy: !!securityOptions.crossOriginOpenerPolicy,
    crossOriginResourcePolicy: !!securityOptions.crossOriginResourcePolicy,
    dnsPrefetchControl: !!securityOptions.dnsPrefetchControl,
    expectCt: !!securityOptions.expectCt,
    frameguard: !!securityOptions.frameguard,
    hidePoweredBy: !!securityOptions.hidePoweredBy,
    hsts: !!securityOptions.hsts,
    ieNoOpen: !!securityOptions.ieNoOpen,
    noSniff: !!securityOptions.noSniff,
    originAgentCluster: !!securityOptions.originAgentCluster,
    permittedCrossDomainPolicies: !!securityOptions.permittedCrossDomainPolicies,
    referrerPolicy: !!securityOptions.referrerPolicy,
    xssFilter: !!securityOptions.xssFilter
  });

  return helmet(securityOptions);
};

// Apply security middleware
export const applySecurityMiddleware = (app: Express): void => {
  try {
    // Prevent NoSQL injection
    app.use(mongoSanitize());
    
    // Add security headers
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    logger.info('Security middleware applied successfully');
  } catch (error) {
    logger.error('Error applying security middleware:', error);
    throw error;
  }
};

// Security helper functions
export const securityHelpers = {
  // Validate CSP directive
  validateCspDirective: (directive: string, value: string[]): boolean => {
    const validDirectives = [
      'defaultSrc',
      'scriptSrc',
      'styleSrc',
      'imgSrc',
      'connectSrc',
      'fontSrc',
      'objectSrc',
      'mediaSrc',
      'frameSrc',
      'sandbox',
      'reportUri',
      'childSrc',
      'formAction',
      'frameAncestors',
      'pluginTypes',
      'baseUri',
      'upgradeInsecureRequests',
      'blockAllMixedContent',
      'requireSriFor',
      'workerSrc',
      'manifestSrc',
      'prefetchSrc',
      'navigateTo'
    ];

    if (!validDirectives.includes(directive)) {
      return false;
    }

    const validValues = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "'none'",
      'data:',
      'https:',
      'http:',
      'blob:',
      'mediastream:',
      'filesystem:'
    ];

    return value.every(v => validValues.includes(v));
  },

  // Validate HSTS options
  validateHstsOptions: (options: any): boolean => {
    if (!options) {
      return false;
    }

    if (typeof options.maxAge !== 'number' || options.maxAge < 0) {
      return false;
    }

    if (typeof options.includeSubDomains !== 'boolean') {
      return false;
    }

    if (typeof options.preload !== 'boolean') {
      return false;
    }

    return true;
  },

  // Validate referrer policy
  validateReferrerPolicy: (policy: string): boolean => {
    const validPolicies = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'same-origin',
      'origin',
      'strict-origin',
      'origin-when-cross-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url'
    ];

    return validPolicies.includes(policy);
  }
}; 