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

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new BadRequestError(errorMessage);
    }

    next();
  });
}; 