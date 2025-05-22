import { body, query, param } from 'express-validator';
import { PaymentMethod } from '../../models/Sale';

export const createSaleValidation = [
  body('customer')
    .isMongoId()
    .withMessage('Customer ID is required and must be valid'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.product')
    .isMongoId()
    .withMessage('Product ID must be valid'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('payments')
    .isArray({ min: 1 })
    .withMessage('At least one payment is required'),

  body('payments.*.method')
    .isIn(Object.values(PaymentMethod))
    .withMessage('Invalid payment method'),

  body('payments.*.amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),

  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),

  body('total')
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number'),

  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a positive number'),

  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number')
];

export const getSalesValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),

  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string'),

  query('customer')
    .optional()
    .isMongoId()
    .withMessage('Customer ID must be valid'),

  query('seller')
    .optional()
    .isMongoId()
    .withMessage('Seller ID must be valid'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const cancelSaleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Sale ID must be valid'),

  body('reason')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
];

export const addPaymentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Sale ID must be valid'),

  body('method')
    .isIn(Object.values(PaymentMethod))
    .withMessage('Invalid payment method'),

  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),

  body('reference')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Payment reference must be a non-empty string')
]; 