import { Router } from 'express';
import { 
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  cancelPayment
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validatePayment, validateCancelPayment } from '../middleware/validation/payment.validation';

const router = Router();

// Public routes
router.get('/verify/:paymentId', verifyPayment);

// Protected routes
router.use(authenticate);

router.get('/', getPayments);
router.get('/:paymentId', getPayment);
router.post('/', validatePayment, createPayment);
router.put('/:paymentId', validatePayment, updatePayment);
router.patch('/:paymentId/cancel', authorize('admin', 'manager'), validateCancelPayment, cancelPayment);

export default router; 