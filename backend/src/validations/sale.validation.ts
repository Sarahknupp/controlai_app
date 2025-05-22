import { body } from 'express-validator';

export const createSaleValidation = [
  body('customer')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isMongoId()
    .withMessage('Invalid customer ID format'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('Sale must have at least one item'),
  
  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('items.*.price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('payments')
    .isArray()
    .withMessage('Payments must be an array'),
  
  body('payments.*.method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix'])
    .withMessage('Invalid payment method'),
  
  body('payments.*.amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  
  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a positive number')
];

export const addPaymentValidation = [
  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix'])
    .withMessage('Invalid payment method'),
  
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference cannot exceed 100 characters')
];

export const cancelSaleValidation = [
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
]; 