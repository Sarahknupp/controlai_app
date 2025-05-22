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

// Protect all routes
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', validate(getSalesValidation), getSales);
router.get('/stats', getSalesStats);
router.get('/:id', getSale);

// Routes requiring admin or manager role
router.use(authorize(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', validate(createSaleValidation), createSale);
router.patch('/:id/cancel', validate(cancelSaleValidation), cancelSale);
router.post('/:id/payments', validate(addPaymentValidation), addPayment);

export default router; 