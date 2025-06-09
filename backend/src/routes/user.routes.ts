import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/auth.controller';

const router = Router();

// Admin only routes
router.use(authorize(UserRole.ADMIN));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router; 