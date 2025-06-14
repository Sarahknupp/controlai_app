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
  (req, res, next): void => {
    receiptController.generateReceipt.bind(receiptController)(req, res, next);
  }
);

// Send receipt
router.post(
  '/:saleId/send',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]),
  (req, res, next): void => {
    receiptController.sendReceipt.bind(receiptController)(req, res, next);
  }
);

// Get receipt history
router.get(
  '/:saleId/history',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  (req, res, next): void => {
    receiptController.getReceiptHistory.bind(receiptController)(req, res, next);
  }
);

export default router; 