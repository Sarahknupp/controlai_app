import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

type ValidationSchema = {
  body?: any;
  query?: any;
  params?: any;
};

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
  };
}; 