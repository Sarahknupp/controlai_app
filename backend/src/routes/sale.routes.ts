import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createSale,
  getSales,
  getSale,
  cancelSale,
  addPayment,
  getSalesStats
} from '../controllers/sale.controller';
import { validate } from '../middleware/validation/validate';
import {
  createSaleValidation,
  getSalesValidation,
  cancelSaleValidation,
  addPaymentValidation
} from '../middleware/validation/sale.validation';
import { UserRole } from '../models/User';
import { authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Validation schemas
const saleIdSchema = {
  params: {
    saleId: { type: 'number' as const, required: true, min: 1 }
  }
};

// Protect all routes
router.use(protect);

// Base routes
router.get('/', validate({ query: getSalesValidation }), getSales);
router.get('/stats', getSalesStats);
router.post('/', validate({ body: createSaleValidation }), createSale);

// Sale-specific routes
router.get('/:saleId', validate(saleIdSchema), getSale);
router.patch('/:saleId/cancel', validate({ ...saleIdSchema, body: cancelSaleValidation }), cancelSale);
router.post('/:saleId/payments', validate({ ...saleIdSchema, body: addPaymentValidation }), addPayment);

export default router; 