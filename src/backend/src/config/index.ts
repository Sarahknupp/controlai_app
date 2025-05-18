/**
 * Configuration module for the ControlAI Sales System
 * @module config
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * CORS configuration options
 * @interface CorsOptions
 */
interface CorsOptions {
  /** Allowed origins for CORS */
  origin: string | string[];
  /** Whether to allow credentials */
  credentials: boolean;
  /** Maximum age of CORS preflight requests */
  maxAge: number;
}

/**
 * Database configuration options
 * @interface DatabaseConfig
 */
interface DatabaseConfig {
  /** MongoDB URI */
  uri: string;
  /** Connection options */
  options: {
    /** Maximum connection retries */
    retryAttempts: number;
    /** Retry delay in milliseconds */
    retryDelay: number;
    /** Connection timeout in milliseconds */
    connectTimeoutMS: number;
  };
}

/**
 * JWT configuration options
 * @interface JWTConfig
 */
interface JWTConfig {
  /** Secret key for JWT signing */
  secret: string;
  /** Token expiration time */
  expiresIn: string;
  /** Refresh token secret */
  refreshSecret: string;
  /** Refresh token expiration time */
  refreshExpiresIn: string;
}

/**
 * Rate limiting configuration
 * @interface RateLimitConfig
 */
interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  max: number;
}

/**
 * Logging configuration
 * @interface LogConfig
 */
interface LogConfig {
  /** Log level */
  level: string;
  /** Whether to log to file */
  fileLogging: boolean;
  /** Log file path */
  filePath?: string;
}

/**
 * Application configuration
 * @interface Config
 */
interface Config {
  /** Node environment */
  env: string;
  /** Server port */
  port: number;
  /** CORS options */
  corsOptions: CorsOptions;
  /** Database configuration */
  database: DatabaseConfig;
  /** JWT configuration */
  jwt: JWTConfig;
  /** Rate limiting configuration */
  rateLimit: RateLimitConfig;
  /** Logging configuration */
  logging: LogConfig;
  /** API documentation enabled */
  enableSwagger: boolean;
  /** Metrics enabled */
  enableMetrics: boolean;
}

/**
 * Configuration object with all application settings
 * @const {Config}
 */
export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOptions: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/controlai_sales',
    options: {
      retryAttempts: 5,
      retryDelay: 1000,
      connectTimeoutMS: 10000,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? 
      (() => { throw new Error('JWT_SECRET must be set in production') })() : 'dev-secret-key'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || (process.env.NODE_ENV === 'production' ?
      (() => { throw new Error('REFRESH_TOKEN_SECRET must be set in production') })() : 'dev-refresh-secret'),
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileLogging: process.env.NODE_ENV === 'production',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
  },
  enableSwagger: process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production',
  enableMetrics: process.env.ENABLE_METRICS === 'true' || false,
}; 