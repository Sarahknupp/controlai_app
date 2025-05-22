import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ocrValidation } from '../validations/ocr.validation';
import { ocrController } from '../controllers/ocr.controller';

const router = Router();

// OCR routes
router.post(
  '/scan',
  authenticate,
  validate(ocrValidation.scanDocument),
  ocrController.scanDocument
);

router.post(
  '/process',
  authenticate,
  validate(ocrValidation.processImage),
  ocrController.processImage
);

router.get(
  '/stats',
  authenticate,
  ocrController.getStats
);

router.get(
  '/history',
  authenticate,
  validate(ocrValidation.getHistory),
  ocrController.getHistory
);

export default router; 