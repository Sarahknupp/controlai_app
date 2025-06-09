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
router.get('/', validate(getCustomersValidation), (req, res, next): void => { getCustomers(req, res, next); });
router.post('/', validate(createCustomerValidation), (req, res, next): void => { createCustomer(req, res, next); });

// Customer-specific routes
router.get('/:customerId', validate(customerIdSchema), (req, res, next): void => { getCustomer(req, res, next); });
router.put('/:customerId', validate({ ...customerIdSchema, body: updateCustomerValidation }), (req, res, next): void => { updateCustomer(req, res, next); });
router.delete('/:customerId', validate(customerIdSchema), (req, res, next): void => { deleteCustomer(req, res, next); });

// Customer purchases
router.get('/:customerId/purchases', validate({ ...customerIdSchema, query: getCustomerPurchasesValidation }), (req, res, next): void => { getCustomerPurchases(req, res, next); });

export default router; 