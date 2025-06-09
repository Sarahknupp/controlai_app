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
router.post('/login', validate(loginValidation), (req, res, next): void => {
  login(req, res, next);
});

// Protected routes
router.use(protect);

router.get('/me', (req, res, next): void => {
  getMe(req, res, next);
});
router.put('/updatedetails', validate(updateDetailsValidation), (req, res, next): void => {
  updateDetails(req, res, next);
});
router.put('/updatepassword', validate(updatePasswordValidation), (req, res, next): void => {
  updatePassword(req, res, next);
});

// Admin only routes
router.use(authorize(UserRole.ADMIN));

router.post('/register', validate(registerValidation), (req, res, next): void => {
  register(req, res, next);
});
router.get('/users', (req, res, next): void => {
  getUsers(req, res, next);
});
router.route('/users/:id')
  .get((req, res, next): void => {
    getUser(req, res, next);
  })
  .put((req, res, next): void => {
    updateUser(req, res, next);
  })
  .delete((req, res, next): void => {
    deleteUser(req, res, next);
  });

export default router; 