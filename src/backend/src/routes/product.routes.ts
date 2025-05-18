/**
 * Product routes configuration
 * @module routes/product
 */

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateProduct } from '../middleware/validators/product.validator';
import { UserRole } from '../types/auth';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor', 'estoquista'] as UserRole[]),
  ProductController.getAllProducts
);

/**
 * @route   GET /api/products/low-stock
 * @desc    Get products with stock below minimum level
 * @access  Private (Admin, Manager)
 */
router.get(
  '/low-stock',
  authenticate,
  authorize(['admin', 'gerente', 'estoquista'] as UserRole[]),
  ProductController.getLowStockProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin', 'gerente', 'vendedor', 'estoquista'] as UserRole[]),
  ProductController.getProduct
);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin, Manager)
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'gerente'] as UserRole[]),
  validateProduct,
  ProductController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Admin, Manager)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin', 'gerente'] as UserRole[]),
  validateProduct,
  ProductController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (soft delete)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin', 'gerente'] as UserRole[]),
  validateProduct,
  ProductController.deleteProduct
);

export const productRoutes = router; 