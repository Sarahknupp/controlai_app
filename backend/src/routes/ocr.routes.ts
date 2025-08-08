import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ocrValidation } from '../validations/ocr.validation';
import { ocrController } from '../controllers/ocr.controller';

const router = Router();

// OCR routes
router.post('/scan', authenticate, (req: Request, res: Response, next: NextFunction): void => {
  ocrController.scanDocument(req, res, next);
});

router.post('/process', authenticate, (req: Request, res: Response, next: NextFunction): void => {
  ocrController.processImage(req, res, next);
});

router.get('/stats', authenticate, (req: Request, res: Response, next: NextFunction): void => {
  ocrController.getStats(req, res, next);
});

router.get('/history', authenticate, (req: Request, res: Response, next: NextFunction): void => {
  ocrController.getHistory(req, res, next);
});

export default router; 