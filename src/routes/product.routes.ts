import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateStock
} from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router
  .route('/')
  .post(protect, authorize('admin'), createProduct)
  .get(protect, getProducts);

router
  .route('/:id')
  .get(protect, getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router
  .route('/:id/stock')
  .patch(protect, updateStock);

export default router; 