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
router.get('/', validate(getSalesValidation), (req, res, next): void => {
  getSales(req, res, next);
});

router.get('/stats', (req, res, next): void => {
  getSalesStats(req, res, next);
});

router.get('/:id', (req, res, next): void => {
  getSale(req, res, next);
});

// Routes requiring admin or manager role
router.use(authorize(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', validate(createSaleValidation), (req, res, next): void => {
  createSale(req, res, next);
});

router.patch('/:id/cancel', validate(cancelSaleValidation), (req, res, next): void => {
  cancelSale(req, res, next);
});

router.post('/:id/payments', validate(addPaymentValidation), (req, res, next): void => {
  addPayment(req, res, next);
});

export default router; 