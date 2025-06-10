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
import { validateRequest } from '../middleware/validate.middleware';
import Joi from 'joi';
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
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgotpassword', validateRequest(forgotPasswordSchema), forgotPassword);
router.put('/resetpassword/:resettoken', validateRequest(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validateRequest(updateDetailsSchema), updateDetails);
router.put('/updatepassword', protect, validateRequest(updatePasswordSchema), updatePassword);

// Admin only routes
router.use(protect);
router.use(authorize(UserRole.ADMIN));
router.post('/register', validateRequest(registerSchema), register);
router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router; 