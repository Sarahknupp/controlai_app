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
router.get('/', validate(getCustomersValidation), async (req, res, next): Promise<void> => {
  await getCustomers(req, res, next);
});

router.post('/', validate(createCustomerValidation), async (req, res, next): Promise<void> => {
  await createCustomer(req, res, next);
});

// Customer-specific routes
router.get('/:customerId', validate(customerIdSchema), async (req, res, next): Promise<void> => {
  await getCustomer(req, res, next);
});

router.put('/:customerId', validate({ ...customerIdSchema, body: updateCustomerValidation }), async (req, res, next): Promise<void> => {
  await updateCustomer(req, res, next);
});

router.delete('/:customerId', validate(customerIdSchema), async (req, res, next): Promise<void> => {
  await deleteCustomer(req, res, next);
});

// Customer purchases
router.get('/:customerId/purchases', validate({ ...customerIdSchema, query: getCustomerPurchasesValidation }), async (req, res, next): Promise<void> => {
  await getCustomerPurchases(req, res, next);
});

export default router; 