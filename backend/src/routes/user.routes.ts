import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import { validate } from '../middleware/validation/validate';
import {
  createUserValidation,
  updateUserValidation
} from '../middleware/validation/user.validation';

const router = express.Router();

// Validation schemas
const userIdSchema = {
  params: {
    userId: { type: 'number' as const, required: true, min: 1 }
  }
};

// Protect all routes
router.use(protect);

// Admin only routes
router.use(authorize(UserRole.ADMIN));

// Base routes
router.get('/', getUsers);
router.post('/', validate(createUserValidation), createUser);

// User-specific routes
router.get('/:userId', validate(userIdSchema), getUser);
router.put('/:userId', validate({ ...userIdSchema, body: updateUserValidation }), updateUser);
router.delete('/:userId', validate(userIdSchema), deleteUser);

export default router; 