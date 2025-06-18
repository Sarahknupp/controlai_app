import { Router, Request, Response, NextFunction } from 'express';
import { PDFController } from '../controllers/pdf.controller';
import { validateRequest } from '../middleware/validation';
import { pdfValidation } from '../validations/pdf.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();
const pdfController = new PDFController();

// Generate sale receipt
router.get(
  '/receipt/:saleId',
  authenticate,
  authorize(['admin', 'manager', 'cashier']),
  (req: Request, res: Response, next: NextFunction): void => {
    pdfController.generateSaleReceipt.bind(pdfController)(req, res, next);
  }
);

// Generate sales report
router.get(
  '/report',
  authenticate,
  authorize(['admin', 'manager']),
  validateRequest(pdfValidation.generateReport),
  (req: Request, res: Response, next: NextFunction): void => {
    pdfController.generateSalesReport.bind(pdfController)(req, res, next);
  }
);

export default router; 