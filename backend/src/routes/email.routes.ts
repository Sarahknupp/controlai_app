import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { validateRequest } from '../middleware/validation';
import { emailValidation } from '../validations/email.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();
const emailController = new EmailController();

// Send sale receipt
router.post(
  '/receipt/:saleId',
  authenticate,
  authorize(['admin', 'manager', 'cashier']),
  emailController.sendSaleReceipt.bind(emailController)
);

// Send sales report
router.post(
  '/report',
  authenticate,
  authorize(['admin', 'manager']),
  validateRequest(emailValidation.sendReport),
  emailController.sendSalesReport.bind(emailController)
);

// Send low stock alert
router.post(
  '/alert/stock/:productId',
  authenticate,
  authorize(['admin', 'manager']),
  emailController.sendLowStockAlert.bind(emailController)
);

// Send password reset
router.post(
  '/password-reset',
  validateRequest(emailValidation.sendPasswordReset),
  emailController.sendPasswordReset.bind(emailController)
);

export default router; 