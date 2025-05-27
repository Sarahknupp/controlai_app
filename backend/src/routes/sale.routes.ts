import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types/user';
import {
  createSale,
  getSales,
  getSale,
  cancelSale,
  addPayment
} from '../controllers/sale.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { saleValidations } from '../validations/sale.validation';
import { auditMiddleware } from '../middleware/audit.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas para vendedores e administradores
router
  .route('/')
  .post(
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    validateRequest(saleValidations.create),
    auditMiddleware({
      action: 'CREATE_SALE',
      resource: 'sale',
      includeBody: true
    }),
    createSale
  )
  .get(
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    validateRequest(saleValidations.filter),
    auditMiddleware({
      action: 'LIST_SALES',
      resource: 'sale',
      includeQuery: true
    }),
    getSales
  );

router
  .route('/:id')
  .get(
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    validateRequest(saleValidations.id),
    auditMiddleware({
      action: 'GET_SALE',
      resource: 'sale',
      includeParams: true
    }),
    getSale
  )
  .patch(
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    validateRequest(saleValidations.cancel),
    auditMiddleware({
      action: 'CANCEL_SALE',
      resource: 'sale',
      includeParams: true,
      includeBody: true
    }),
    cancelSale
  );

router.post(
  '/:id/payments',
  authorize(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(saleValidations.payment),
  auditMiddleware({
    action: 'ADD_PAYMENT',
    resource: 'sale',
    includeParams: true,
    includeBody: true
  }),
  addPayment
);

export default router; 