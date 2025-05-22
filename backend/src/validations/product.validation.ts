import { body } from 'express-validator';
import { Product } from '../types/product';

export const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('sku')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens and underscores'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 8, max: 14 })
    .withMessage('Barcode must be between 8 and 14 characters')
    .matches(/^[0-9]+$/)
    .withMessage('Barcode must contain only numbers')
];

export const updateStockValidation = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer'),
  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['add', 'subtract'])
    .withMessage('Operation must be either add or subtract')
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateProduct = (product: Product): ValidationResult => {
  const errors: string[] = [];

  // Validação do código
  if (!product.code) {
    errors.push('Código do produto é obrigatório');
  }

  // Validação do nome
  if (!product.name) {
    errors.push('Nome do produto é obrigatório');
  } else if (product.name.length < 3) {
    errors.push('Nome do produto deve ter pelo menos 3 caracteres');
  }

  // Validação do preço
  if (typeof product.price !== 'number' || isNaN(product.price)) {
    errors.push('Preço do produto deve ser um número válido');
  } else if (product.price < 0) {
    errors.push('Preço do produto não pode ser negativo');
  }

  // Validação da quantidade
  if (typeof product.quantity !== 'number' || isNaN(product.quantity)) {
    errors.push('Quantidade do produto deve ser um número válido');
  } else if (product.quantity < 0) {
    errors.push('Quantidade do produto não pode ser negativa');
  }

  // Validação da categoria
  if (product.category && product.category.length < 2) {
    errors.push('Categoria do produto deve ter pelo menos 2 caracteres');
  }

  // Validação da marca
  if (product.brand && product.brand.length < 2) {
    errors.push('Marca do produto deve ter pelo menos 2 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 