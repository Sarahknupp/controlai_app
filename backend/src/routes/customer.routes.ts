import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchases
} from '../controllers/customer.controller';
import { validate } from '../middleware/validation/validate';
import {
  createCustomerValidation,
  getCustomersValidation,
  updateCustomerValidation,
  getCustomerPurchasesValidation
} from '../middleware/validation/customer.validation';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', validate(getCustomersValidation), (req, res, next): void => {
  getCustomers(req, res, next);
});

router.get('/:id', (req, res, next): void => {
  getCustomer(req, res, next);
});

router.get('/:id/purchases', validate(getCustomerPurchasesValidation), (req, res, next): void => {
  getCustomerPurchases(req, res, next);
});

// Routes accessible only by admin
router.use(authorize(UserRole.ADMIN));
router.post('/', validate(createCustomerValidation), (req, res, next): void => {
  createCustomer(req, res, next);
});

router.put('/:id', validate(updateCustomerValidation), (req, res, next): void => {
  updateCustomer(req, res, next);
});

router.delete('/:id', (req, res, next): void => {
  deleteCustomer(req, res, next);
});

export default router; 