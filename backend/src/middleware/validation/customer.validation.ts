import { body, query, param } from 'express-validator';
import Joi from 'joi';

export const createCustomerValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string()
});

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

export const updateCustomerValidation = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  address: Joi.string()
});

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