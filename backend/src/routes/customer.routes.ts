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

// Validation schemas
const customerIdSchema = {
  params: {
    customerId: { type: 'number' as const, required: true, min: 1 }
  }
};

// Protect all routes
router.use(protect);

// Base routes
router.get('/', validate(getCustomersValidation), getCustomers);
router.post('/', validate(createCustomerValidation), createCustomer);

// Customer-specific routes
router.get('/:customerId', validate(customerIdSchema), getCustomer);
router.put('/:customerId', validate({ ...customerIdSchema, body: updateCustomerValidation }), updateCustomer);
router.delete('/:customerId', validate(customerIdSchema), deleteCustomer);

// Customer purchases
router.get('/:customerId/purchases', validate({ ...customerIdSchema, query: getCustomerPurchasesValidation }), getCustomerPurchases);

export default router; 