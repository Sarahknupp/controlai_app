import { body, query, param } from 'express-validator';
import { validateRequest } from './validate';

// Validações para criação de venda
export const createSaleValidation = [
  body('customer')
    .isMongoId()
    .withMessage('ID do cliente inválido'),
  
  body('seller')
    .isMongoId()
    .withMessage('ID do vendedor inválido'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('A venda deve ter pelo menos um item'),
  
  body('items.*.product')
    .isMongoId()
    .withMessage('ID do produto inválido'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser maior que zero'),
  
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser maior ou igual a zero'),
  
  body('payments')
    .isArray({ min: 1 })
    .withMessage('A venda deve ter pelo menos uma forma de pagamento'),
  
  body('payments.*.method')
    .isIn(['cash', 'credit_card', 'debit_card', 'pix'])
    .withMessage('Método de pagamento inválido'),
  
  body('payments.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Valor do pagamento deve ser maior ou igual a zero'),
  
  validateRequest
];

// Validações para listagem de vendas
export const getSalesValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial inválida'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final inválida'),
  
  query('customer')
    .optional()
    .isMongoId()
    .withMessage('ID do cliente inválido'),
  
  query('seller')
    .optional()
    .isMongoId()
    .withMessage('ID do vendedor inválido'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status inválido'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser maior que zero'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
  
  validateRequest
];

// Validações para obtenção de uma venda específica
export const getSaleValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID da venda inválido'),
  
  validateRequest
];

// Validações para cancelamento de venda
export const cancelSaleValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID da venda inválido'),
  
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Motivo do cancelamento deve ter entre 3 e 500 caracteres'),
  
  validateRequest
]; 