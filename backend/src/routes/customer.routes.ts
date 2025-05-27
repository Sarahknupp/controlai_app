import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/user';
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPurchases
} from '../controllers/customer.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { customerValidations } from '../validations/customer.validation';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas públicas (requerem apenas autenticação)
router.get('/', validateRequest(customerValidations.filter), getCustomers);
router.get('/:id', validateRequest(customerValidations.id), getCustomer);
router.get('/:id/purchases', validateRequest(customerValidations.purchases), getCustomerPurchases);

// Rotas que requerem permissão de admin
router.use(authorize(UserRole.ADMIN));

router.post(
  '/',
  validateRequest(customerValidations.create),
  auditMiddleware({
    action: 'CREATE_CUSTOMER',
    resource: 'customer',
    includeBody: true
  }),
  createCustomer
);

router.put(
  '/:id',
  validateRequest(customerValidations.update),
  auditMiddleware({
    action: 'UPDATE_CUSTOMER',
    resource: 'customer',
    includeParams: true,
    includeBody: true
  }),
  updateCustomer
);

router.delete(
  '/:id',
  validateRequest(customerValidations.id),
  auditMiddleware({
    action: 'DELETE_CUSTOMER',
    resource: 'customer',
    includeParams: true
  }),
  deleteCustomer
);

export default router; 