import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation/validate';
import { Types } from 'mongoose';

export const createSaleValidation = [
  body('customer')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do cliente deve ter entre 2 e 100 caracteres'),
  body('items')
    .isArray()
    .withMessage('Items deve ser um array')
    .notEmpty()
    .withMessage('Items não pode estar vazio'),
  body('items.*.product')
    .isMongoId()
    .withMessage('ID do produto inválido'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser maior que zero'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser maior ou igual a zero'),
  body('paymentMethod')
    .isIn(['cash', 'credit', 'debit', 'pix'])
    .withMessage('Método de pagamento inválido'),
  validateRequest
];

export const getSalesValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final inválida'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status inválido'),
  query('customer')
    .optional()
    .isString()
    .trim()
    .withMessage('Nome do cliente inválido'),
  validateRequest
];

export const getSaleValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID da venda inválido'),
  validateRequest
];

export const cancelSaleValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID da venda inválido'),
  body('reason')
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Motivo do cancelamento deve ter entre 5 e 200 caracteres'),
  validateRequest
];

export const saleValidations = {
  id: {
    id: { type: 'string', required: true, custom: (value: string) => Types.ObjectId.isValid(value) }
  },

  create: {
    customer: { 
      type: 'string', 
      required: true, 
      custom: (value: string) => Types.ObjectId.isValid(value) 
    },
    items: {
      type: 'array',
      required: true,
      minLength: 1,
      items: {
        type: 'object',
        required: true,
        properties: {
          product: { 
            type: 'string', 
            required: true, 
            custom: (value: string) => Types.ObjectId.isValid(value) 
          },
          quantity: { type: 'number', required: true, min: 1 },
          price: { type: 'number', required: true, min: 0 },
          discount: { type: 'number', min: 0, max: 100 }
        }
      }
    },
    paymentMethod: { 
      type: 'string', 
      required: true, 
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER'] 
    },
    installments: { type: 'number', min: 1, max: 12 },
    discount: { type: 'number', min: 0, max: 100 },
    notes: { type: 'string', maxLength: 500 }
  },

  filter: {
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
    customer: { 
      type: 'string', 
      custom: (value: string) => Types.ObjectId.isValid(value) 
    },
    status: { 
      type: 'string', 
      enum: ['PENDING', 'COMPLETED', 'CANCELLED'] 
    },
    paymentMethod: { 
      type: 'string', 
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER'] 
    },
    page: { type: 'number', min: 1 },
    limit: { type: 'number', min: 1, max: 100 },
    sortBy: { 
      type: 'string', 
      enum: ['date', 'total', 'status'] 
    },
    sortOrder: { type: 'string', enum: ['asc', 'desc'] }
  },

  payment: {
    id: { 
      type: 'string', 
      required: true, 
      custom: (value: string) => Types.ObjectId.isValid(value) 
    },
    amount: { type: 'number', required: true, min: 0 },
    method: { 
      type: 'string', 
      required: true, 
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BANK_TRANSFER'] 
    },
    installments: { type: 'number', min: 1, max: 12 },
    notes: { type: 'string', maxLength: 500 }
  },

  cancel: {
    id: { 
      type: 'string', 
      required: true, 
      custom: (value: string) => Types.ObjectId.isValid(value) 
    },
    reason: { 
      type: 'string', 
      required: true, 
      minLength: 5, 
      maxLength: 200 
    }
  }
}; 