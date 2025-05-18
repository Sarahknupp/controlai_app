/**
 * Product validation middleware
 * @module middleware/validators/product
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import { ApiError } from '../../utils/ApiError';

/**
 * Middleware to validate product data
 * @function validateProduct
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * @throws {ApiError} If validation fails
 */
export const validateProduct = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('descricao')
    .trim()
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU é obrigatório')
    .isLength({ max: 50 })
    .withMessage('SKU não pode exceder 50 caracteres'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Código de barras não pode exceder 50 caracteres'),
  body('preco')
    .isFloat({ min: 0.01 })
    .withMessage('Preço deve ser maior que zero'),
  body('estoque')
    .isInt({ min: 0 })
    .withMessage('Estoque não pode ser negativo'),
  body('estoqueMinimo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque mínimo não pode ser negativo'),
  body('unidade')
    .notEmpty()
    .withMessage('Unidade é obrigatória')
    .isIn(['un', 'kg', 'g', 'l', 'ml'])
    .withMessage('Unidade inválida'),
  body('categoria.id')
    .notEmpty()
    .withMessage('ID da categoria é obrigatório'),
  body('categoria.nome')
    .notEmpty()
    .withMessage('Nome da categoria é obrigatório'),
  body('imagens')
    .optional()
    .isArray()
    .withMessage('Imagens devem ser um array'),
  body('imagens.*')
    .optional()
    .isURL()
    .withMessage('URL de imagem inválida'),
  body('imposto.aliquota')
    .notEmpty()
    .withMessage('Alíquota é obrigatória')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alíquota deve estar entre 0 e 100'),
  body('imposto.codigo')
    .notEmpty()
    .withMessage('Código do imposto é obrigatório')
    .trim(),
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }));
      throw new ApiError(`Erro de validação: ${JSON.stringify(formattedErrors)}`, 400);
    }
    next();
  }
];

export const validateProductUpdate = [
  param('id').isMongoId().withMessage('ID inválido'),
  (_req: Request, _res: Response, next: NextFunction) => {
    next();
  }
]; 