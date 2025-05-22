import { Router } from 'express';
import {
  createSale,
  getSales,
  getSale,
  cancelSale
} from '../controllers/sale.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router
  .route('/')
  .post(protect, createSale)
  .get(protect, getSales);

router
  .route('/:id')
  .get(protect, getSale);

router
  .route('/:id/cancel')
  .patch(protect, authorize('admin'), cancelSale);

export default router; 