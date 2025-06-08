import { body, query, param } from 'express-validator';
import { PaymentMethod } from '../../models/Sale';
import Joi from 'joi';

export const createSaleValidation = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().required().min(1),
  customerId: Joi.string().required(),
  totalAmount: Joi.number().required().min(0)
});

export const updateSaleValidation = Joi.object({
  productId: Joi.string(),
  quantity: Joi.number().min(1),
  customerId: Joi.string(),
  totalAmount: Joi.number().min(0)
});

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