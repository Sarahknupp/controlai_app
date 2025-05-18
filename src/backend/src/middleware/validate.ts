import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware para validar requisições usando express-validator
 * @param validations - Array de validações do express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Executa todas as validações
    await Promise.all(validations.map(validation => validation.run(req)));

    // Verifica se houve erros
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Formata os erros
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    // Retorna resposta com erros
    res.status(400).json({
      success: false,
      error: {
        code: 'VAL_001',
        message: 'Erro de validação',
        details: formattedErrors
      }
    });
  };
}; 