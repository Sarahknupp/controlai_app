import { Router } from 'express';
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
  validationController.validateData.bind(validationController)
);

// Get validation status
router.get(
  '/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validationController.getValidationStatus.bind(validationController)
);

export default router; 