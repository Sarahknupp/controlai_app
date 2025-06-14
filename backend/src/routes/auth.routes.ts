import { Router } from 'express';
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

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'publisher').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateDetailsSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

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
router.use(protect);
router.use(authorize(UserRole.ADMIN));
router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router; 