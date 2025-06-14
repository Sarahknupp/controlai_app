import { Router } from 'express';
import { 
  verifyReceipt, 
  getReceiptStats, 
  getReceiptHistory, 
  getReceiptByNumber,
  downloadReceipt 
} from '../controllers/receipt.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public routes
router.get('/verify/:receiptNumber', verifyReceipt);

// Protected routes
router.use(authenticate);

router.get('/stats', getReceiptStats);
router.get('/history', getReceiptHistory);
router.get('/:receiptNumber', getReceiptByNumber);
router.get('/:receiptNumber/download', downloadReceipt);

export default router; 