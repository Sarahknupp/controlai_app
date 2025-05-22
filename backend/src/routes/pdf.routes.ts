import { Router } from 'express';
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
  pdfController.generateSaleReceipt.bind(pdfController)
);

// Generate sales report
router.get(
  '/report',
  authenticate,
  authorize(['admin', 'manager']),
  validateRequest(pdfValidation.generateReport),
  pdfController.generateSalesReport.bind(pdfController)
);

export default router; 