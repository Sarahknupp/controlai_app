/**
 * Async function wrapper to handle errors in async route handlers
 * @module utils/catchAsync
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Type definition for an async route handler function
 * @typedef {Function} AsyncRouteHandler
 */
type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps an async function and catches any errors, passing them to the error handler
 * @function catchAsync
 * @param {AsyncRouteHandler} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const catchAsync = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 