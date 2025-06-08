import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation/validate';
import {
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from '../middleware/validation/auth.validation';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', validate(updateDetailsValidation), updateDetails);
router.patch('/update-password', validate(updatePasswordValidation), updatePassword);

// Admin only routes
router.use(authorize(UserRole.ADMIN));

router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(validate(updateDetailsValidation), updateUser)
  .delete(deleteUser);

export default router; 