import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { logger } from './logging';

// Helmet options interface
interface HelmetOptions {
  contentSecurityPolicy?: boolean | any;
  crossOriginEmbedderPolicy?: boolean | any;
  crossOriginOpenerPolicy?: boolean | any;
  crossOriginResourcePolicy?: boolean | any;
  dnsPrefetchControl?: boolean | any;
  expectCt?: boolean | any;
  frameguard?: boolean | any;
  hidePoweredBy?: boolean | any;
  hsts?: boolean | any;
  ieNoOpen?: boolean | any;
  noSniff?: boolean | any;
  originAgentCluster?: boolean | any;
  permittedCrossDomainPolicies?: boolean | any;
  referrerPolicy?: boolean | any;
  xssFilter?: boolean | any;
}

// Default helmet options
const defaultOptions: HelmetOptions = {
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
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  expectCt: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
};

// Helmet middleware factory
export const createHelmetMiddleware = (options: HelmetOptions = {}) => {
  const helmetOptions = { ...defaultOptions, ...options };

  return helmet(helmetOptions);
};

// Helmet helper functions
export const helmetHelpers = {
  // Get content security policy
  getContentSecurityPolicy: (): any => {
    return defaultOptions.contentSecurityPolicy;
  },

  // Get cross origin embedder policy
  getCrossOriginEmbedderPolicy: (): boolean => {
    return defaultOptions.crossOriginEmbedderPolicy as boolean;
  },

  // Get cross origin opener policy
  getCrossOriginOpenerPolicy: (): boolean => {
    return defaultOptions.crossOriginOpenerPolicy as boolean;
  },

  // Get cross origin resource policy
  getCrossOriginResourcePolicy: (): boolean => {
    return defaultOptions.crossOriginResourcePolicy as boolean;
  },

  // Get DNS prefetch control
  getDnsPrefetchControl: (): boolean => {
    return defaultOptions.dnsPrefetchControl as boolean;
  },

  // Get expect CT
  getExpectCt: (): boolean => {
    return defaultOptions.expectCt as boolean;
  },

  // Get frame guard
  getFrameGuard: (): boolean => {
    return defaultOptions.frameguard as boolean;
  },

  // Get hide powered by
  getHidePoweredBy: (): boolean => {
    return defaultOptions.hidePoweredBy as boolean;
  },

  // Get HSTS
  getHsts: (): boolean => {
    return defaultOptions.hsts as boolean;
  },

  // Get IE no open
  getIeNoOpen: (): boolean => {
    return defaultOptions.ieNoOpen as boolean;
  },

  // Get no sniff
  getNoSniff: (): boolean => {
    return defaultOptions.noSniff as boolean;
  },

  // Get origin agent cluster
  getOriginAgentCluster: (): boolean => {
    return defaultOptions.originAgentCluster as boolean;
  },

  // Get permitted cross domain policies
  getPermittedCrossDomainPolicies: (): boolean => {
    return defaultOptions.permittedCrossDomainPolicies as boolean;
  },

  // Get referrer policy
  getReferrerPolicy: (): boolean => {
    return defaultOptions.referrerPolicy as boolean;
  },

  // Get XSS filter
  getXssFilter: (): boolean => {
    return defaultOptions.xssFilter as boolean;
  }
}; 