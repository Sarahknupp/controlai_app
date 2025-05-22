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
  deleteUser
} from '../controllers/auth.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation
} from '../validations/auth.validation';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.post('/login', validate(loginValidation), login);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/updatedetails', validate(updateDetailsValidation), updateDetails);
router.put('/updatepassword', validate(updatePasswordValidation), updatePassword);

// Admin only routes
router.use(authorize(UserRole.ADMIN));

router.post('/register', validate(registerValidation), register);
router.get('/users', getUsers);
router.route('/users/:id')
  .get(getUser)
  .put(validate(updateDetailsValidation), updateUser)
  .delete(deleteUser);

export default router; 