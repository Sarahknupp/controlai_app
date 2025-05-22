import { Router } from 'express';
import { ReceiptController } from '../controllers/receipt.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../types/user';

const router = Router();
const receiptController = new ReceiptController();

// Generate receipt
router.get(
  '/:saleId/generate',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]),
  receiptController.generateReceipt.bind(receiptController)
);

// Send receipt
router.post(
  '/:saleId/send',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]),
  receiptController.sendReceipt.bind(receiptController)
);

// Get receipt history
router.get(
  '/:saleId/history',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  receiptController.getReceiptHistory.bind(receiptController)
);

export default router; 