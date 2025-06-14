import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ocrValidation } from '../validations/ocr.validation';
import { ocrController } from '../controllers/ocr.controller';

const router = Router();

// OCR routes
router.post('/scan', authenticate, (req, res, next): void => {
  ocrController.scanDocument(req, res, next);
});

router.post('/process', authenticate, (req, res, next): void => {
  ocrController.processImage(req, res, next);
});

router.get('/stats', authenticate, (req, res, next): void => {
  ocrController.getStats(req, res, next);
});

router.get('/history', authenticate, (req, res, next): void => {
  ocrController.getHistory(req, res, next);
});

export default router; 