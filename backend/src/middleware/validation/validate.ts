import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError, ValidationErrorDetail } from '../errors/validation.error';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.type === 'field' ? err.path : err.type,
          message: err.msg
        }))
      });
    }

    next();
  };
};

/**
 * Middleware para validar requisições usando express-validator
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: ValidationErrorDetail[] = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));
    throw new ValidationError('Erro de validação', formattedErrors);
  }
  next();
}; 