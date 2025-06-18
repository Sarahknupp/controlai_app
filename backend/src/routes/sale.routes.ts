import { Router, Request, Response, NextFunction } from 'express';
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


// Validation schemas
const saleIdSchema = {
  params: {
    saleId: { type: 'number' as const, required: true, min: 1 }
  }
};

// Protect all routes
router.use(protect);


// Routes accessible by all authenticated users
router.get('/', validate(getSalesValidation), (req: Request, res: Response, next: NextFunction): void => {
  getSales(req, res, next);
});

router.get('/stats', (req: Request, res: Response, next: NextFunction): void => {
  getSalesStats(req, res, next);
});

router.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  getSale(req, res, next);
});

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

router.post('/', validate(createSaleValidation), (req: Request, res: Response, next: NextFunction): void => {
  createSale(req, res, next);
});

router.patch('/:id/cancel', validate(cancelSaleValidation), (req: Request, res: Response, next: NextFunction): void => {
  cancelSale(req, res, next);
});

router.post('/:id/payments', validate(addPaymentValidation), (req: Request, res: Response, next: NextFunction): void => {
  addPayment(req, res, next);
});

// Base routes
router.get('/', validate({ query: getSalesValidation }), getSales);
router.get('/stats', getSalesStats);
router.post('/', validate({ body: createSaleValidation }), createSale);

// Sale-specific routes
router.get('/:saleId', validate(saleIdSchema), getSale);
router.patch('/:saleId/cancel', validate({ ...saleIdSchema, body: cancelSaleValidation }), cancelSale);
router.post('/:saleId/payments', validate({ ...saleIdSchema, body: addPaymentValidation }), addPayment);


export default router; 