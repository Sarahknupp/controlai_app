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
router.post('/login', validate(loginValidation), (req, res): void => {
  login(req, res);
});

// Protected routes
router.use(protect);

router.get('/me', (req, res): void => {
  getMe(req, res);
});

router.put('/updatedetails', validate(updateDetailsValidation), (req, res): void => {
  updateDetails(req, res);
});

router.put('/updatepassword', validate(updatePasswordValidation), (req, res): void => {
  updatePassword(req, res);
});

// Admin only routes
router.use(authorize(UserRole.ADMIN));

router.post('/register', validate(registerValidation), (req, res): void => {
  register(req, res);
});

router.get('/users', (req, res): void => {
  getUsers(req, res);
});

router.route('/users/:id')
  .get((req, res): void => {
    getUser(req, res);
  })
  .put((req, res): void => {
    updateUser(req, res);
  })
  .delete((req, res): void => {
    deleteUser(req, res);
  });

export default router; 