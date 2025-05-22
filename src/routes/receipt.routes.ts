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
router.get('/', authenticate, getReceiptHistory);
router.get('/stats', authenticate, getReceiptStats);
router.get('/:number', authenticate, getReceiptByNumber);
router.get('/:number/download', authenticate, downloadReceipt);

export default router; 