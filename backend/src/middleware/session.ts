import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { logger } from './logging';

// Session options interface
interface SessionOptions {
  secret?: string;
  resave?: boolean;
  saveUninitialized?: boolean;
  cookie?: {
    secure?: boolean;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    domain?: string;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  };
  name?: string;
  rolling?: boolean;
  unset?: 'destroy' | 'keep';
}

// Default session options
const defaultOptions: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: undefined,
    sameSite: 'lax'
  },
  name: 'sessionId',
  rolling: false,
  unset: 'keep'
};

// Session middleware factory
export const createSessionMiddleware = (options: SessionOptions = {}) => {
  const sessionOptions = { ...defaultOptions, ...options };

  return session(sessionOptions);
};

// Session helper functions
export const sessionHelpers = {
  // Get session secret
  getSessionSecret: (): string => {
    return defaultOptions.secret!;
  },

  // Get session resave
  getSessionResave: (): boolean => {
    return defaultOptions.resave!;
  },

  // Get session save uninitialized
  getSessionSaveUninitialized: (): boolean => {
    return defaultOptions.saveUninitialized!;
  },

  // Get session cookie
  getSessionCookie: (): any => {
    return defaultOptions.cookie;
  },

  // Get session name
  getSessionName: (): string => {
    return defaultOptions.name!;
  },

  // Get session rolling
  getSessionRolling: (): boolean => {
    return defaultOptions.rolling!;
  },

  // Get session unset
  getSessionUnset: (): string => {
    return defaultOptions.unset!;
  }
}; 