/**
 * Custom API Error class for handling application errors
 * @module utils/ApiError
 */

/**
 * ApiError class extending the built-in Error class
 * @class ApiError
 * @extends Error
 */
export class ApiError extends Error {
  /**
   * HTTP status code for the error
   * @type {number}
   */
  statusCode: number;

  /**
   * Whether the error is operational (expected) or programming error
   * @type {boolean}
   */
  isOperational: boolean;

  /**
   * Error status ('error', 'fail', etc.)
   * @type {string}
   */
  status: string;

  /**
   * Create an ApiError instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} [isOperational=true] - Whether the error is operational
   */
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
} 