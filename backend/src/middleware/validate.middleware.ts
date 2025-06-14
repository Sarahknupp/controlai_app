import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

export const validateRequest = (schema: Schema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const { error } = schema.body.validate(req.body);
        if (error) {
          throw new BadRequestError(error.details[0].message);
        }
      }

      if (schema.query) {
        const { error } = schema.query.validate(req.query);
        if (error) {
          throw new BadRequestError(error.details[0].message);
        }
      }

      if (schema.params) {
        const { error } = schema.params.validate(req.params);
        if (error) {
          throw new BadRequestError(error.details[0].message);
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }

    next();
  });
}; 