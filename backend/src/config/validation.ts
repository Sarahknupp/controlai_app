import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';

// Validações comuns
export const commonValidations = {
  id: param('id')
    .isMongoId()
    .withMessage('ID inválido'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número inteiro positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve ser um número entre 1 e 100')
  ],

  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Data inicial inválida'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Data final inválida')
  ]
};

// Validações de usuário
export const userValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres'),
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'cashier', 'user'])
      .withMessage('Função inválida'),
    validateRequest
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Nome deve ter entre 2 e 50 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    validateRequest
  ]
};

// Validações de produto
export const productValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Estoque deve ser um número inteiro positivo'),
    body('category')
      .isMongoId()
      .withMessage('Categoria inválida'),
    validateRequest
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    body('stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Estoque deve ser um número inteiro positivo'),
    body('category')
      .optional()
      .isMongoId()
      .withMessage('Categoria inválida'),
    validateRequest
  ]
};

// Validações de venda
export const saleValidations = {
  create: [
    body('customer')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome do cliente deve ter entre 2 e 100 caracteres'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Venda deve ter pelo menos um item'),
    body('items.*.product')
      .isMongoId()
      .withMessage('Produto inválido'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantidade deve ser um número inteiro positivo'),
    body('items.*.price')
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    body('paymentMethod')
      .isIn(['cash', 'credit', 'debit', 'pix'])
      .withMessage('Método de pagamento inválido'),
    validateRequest
  ],

  update: [
    body('status')
      .optional()
      .isIn(['pending', 'completed', 'cancelled'])
      .withMessage('Status inválido'),
    body('reason')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Motivo deve ter entre 2 e 200 caracteres'),
    validateRequest
  ]
}; 