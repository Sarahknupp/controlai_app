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
router.get('/', validate(getCustomersValidation), getCustomers);
router.get('/:id', getCustomer);
router.get('/:id/purchases', validate(getCustomerPurchasesValidation), getCustomerPurchases);

// Routes accessible only by admin
router.use(authorize(UserRole.ADMIN));
router.post('/', validate(createCustomerValidation), createCustomer);
router.put('/:id', validate(updateCustomerValidation), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router; 