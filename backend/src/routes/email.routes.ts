import { Router, Request, Response, NextFunction } from 'express';
import { EmailController } from '../controllers/email.controller';
import { validateRequest } from '../middleware/validation';
import { emailValidation } from '../validations/email.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../models/user.model';

const router = Router();
const emailController = new EmailController();

// Send sale receipt
router.post('/receipt', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]), (req: Request, res: Response, next: NextFunction): void => {
  emailController.sendReceiptEmail(req, res, next);
});

// Send sales report
router.post('/report', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req: Request, res: Response, next: NextFunction): void => {
  emailController.sendReportEmail(req, res, next);
});

// Send low stock alert
router.post('/low-stock', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), (req: Request, res: Response, next: NextFunction): void => {
  emailController.sendLowStockAlert(req, res, next);
});

// Send password reset
router.post('/reset-password', (req: Request, res: Response, next: NextFunction): void => {
  emailController.sendPasswordResetEmail(req, res, next);
});

export default router; 