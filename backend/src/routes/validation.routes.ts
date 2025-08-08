import { Router, Request, Response, NextFunction } from 'express';
import { ValidationController } from '../controllers/validation.controller';
import { validateRequest } from '../middleware/validation';
import { validationValidation } from '../validations/validation.validation';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorization';
import { UserRole } from '../types/user';

const router = Router();
const validationController = new ValidationController();

// Validate data
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateRequest(validationValidation.validateData),
  (req: Request, res: Response, next: NextFunction): void => {
    validationController.validateData.bind(validationController)(req, res, next);
  }
);

// Get validation status
router.get(
  '/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  (req: Request, res: Response, next: NextFunction): void => {
    validationController.getValidationStatus.bind(validationController)(req, res, next);
  }
);

export default router; 