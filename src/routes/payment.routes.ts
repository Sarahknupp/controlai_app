import express from 'express';
import { processPayment, getSalePayments, cancelPayment } from '../controllers/payment.controller';
import { protect, authorize } from '../middleware/auth';
import { 
  validateProcessPayment, 
  validateCancelPayment, 
  validateGetSalePayments 
} from '../middleware/validatePayment';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Rotas de pagamento com validação
router.post('/', validateProcessPayment, processPayment);
router.get('/sale/:saleId', validateGetSalePayments, getSalePayments);
router.patch('/:id/cancel', authorize('admin', 'manager'), validateCancelPayment, cancelPayment);

export default router; 