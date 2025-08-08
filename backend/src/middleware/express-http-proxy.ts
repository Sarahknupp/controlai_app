import { Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import { logger } from './logging';

// Proxy options interface
interface ProxyOptions {
  target?: string;
  changeOrigin?: boolean;
  secure?: boolean;
  pathRewrite?: { [key: string]: string };
  proxyTimeout?: number;
  timeout?: number;
  followRedirects?: boolean;
  preserveHostHeader?: boolean;
  parseReqBody?: boolean;
  proxyReqPathResolver?: (req: Request) => string;
  proxyReqOptDecorator?: (proxyReqOpts: any, srcReq: Request) => any;
  proxyResDecorator?: (proxyRes: Response, proxyResData: any, userReq: Request, userRes: Response) => any;
  userResDecorator?: (proxyRes: Response, proxyResData: any, userReq: Request, userRes: Response) => any;
  filter?: (req: Request, res: Response) => boolean;
}

// Default proxy options
const defaultOptions: ProxyOptions = {
  target: 'http://localhost:3000',
  changeOrigin: true,
  secure: false,
  pathRewrite: {},
  proxyTimeout: 30000,
  timeout: 30000,
  followRedirects: true,
  preserveHostHeader: false,
  parseReqBody: true,
  proxyReqPathResolver: (req: Request) => req.url,
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq: Request) => {
    return proxyReqOpts;
  },
  proxyResDecorator: (proxyRes: Response, proxyResData: any, userReq: Request, userRes: Response) => {
    return proxyResData;
  },
  userResDecorator: (proxyRes: Response, proxyResData: any, userReq: Request, userRes: Response) => {
    return proxyResData;
  },
  filter: (req: Request, res: Response) => {
    return true;
  }
};

// Proxy middleware factory
export const createProxyMiddleware = (options: ProxyOptions = {}) => {
  const proxyOptions = { ...defaultOptions, ...options };

  return proxy(proxyOptions.target!, proxyOptions);
};

// Proxy helper functions
export const proxyHelpers = {
  // Get proxy target
  getProxyTarget: (): string => {
    return defaultOptions.target!;
  },

  // Get proxy change origin
  getProxyChangeOrigin: (): boolean => {
    return defaultOptions.changeOrigin!;
  },

  // Get proxy secure
  getProxySecure: (): boolean => {
    return defaultOptions.secure!;
  },

  // Get proxy path rewrite
  getProxyPathRewrite: (): { [key: string]: string } => {
    return defaultOptions.pathRewrite!;
  },

  // Get proxy timeout
  getProxyTimeout: (): number => {
    return defaultOptions.proxyTimeout!;
  },

  // Get timeout
  getTimeout: (): number => {
    return defaultOptions.timeout!;
  },

  // Get proxy follow redirects
  getProxyFollowRedirects: (): boolean => {
    return defaultOptions.followRedirects!;
  },

  // Get proxy preserve host header
  getProxyPreserveHostHeader: (): boolean => {
    return defaultOptions.preserveHostHeader!;
  },

  // Get proxy parse req body
  getProxyParseReqBody: (): boolean => {
    return defaultOptions.parseReqBody!;
  },

  // Get proxy req path resolver
  getProxyReqPathResolver: (): (req: Request) => string => {
    return defaultOptions.proxyReqPathResolver!;
  },

  // Get proxy req opt decorator
  getProxyReqOptDecorator: (): (proxyReqOpts: any, srcReq: Request) => any => {
    return defaultOptions.proxyReqOptDecorator!;
  },

  // Get proxy res decorator
  getProxyResDecorator: (): (proxyRes: Response, proxyResData: any, userReq: Request, userRes: Response) => any => {
    return defaultOptions.proxyResDecorator!;
  },

  // Get user res decorator
  getUserResDecorator: (): (proxyRes: Response, proxyResData: any, userReq: Request, userRes: Response) => any => {
    return defaultOptions.userResDecorator!;
  },

  // Get proxy filter
  getProxyFilter: (): (req: Request, res: Response) => boolean => {
    return defaultOptions.filter!;
  }
}; 