import { body, query, param } from 'express-validator';

export const createCustomerValidation = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),

  body('address')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Address must be a non-empty string'),

  body('city')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('City must be a non-empty string'),

  body('state')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be a 2-letter code'),

  body('zipCode')
    .optional()
    .isString()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format')
];

export const getCustomersValidation = [
  query('search')
    .optional()
    .isString()
    .trim()
    .withMessage('Search term must be a string'),

  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'phone', 'createdAt', 'totalPurchases'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const updateCustomerValidation = [
  param('id')
    .isMongoId()
    .withMessage('Customer ID must be valid'),

  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name must be a non-empty string'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Phone must be a non-empty string'),

  body('address')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Address must be a non-empty string'),

  body('city')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('City must be a non-empty string'),

  body('state')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be a 2-letter code'),

  body('zipCode')
    .optional()
    .isString()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format')
];

export const getCustomerPurchasesValidation = [
  param('id')
    .isMongoId()
    .withMessage('Customer ID must be valid'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
]; 