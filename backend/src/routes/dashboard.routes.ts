import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validate } from '../middleware/validation/validate';
import {
  getDashboardStats,
  getSalesOverview,
  getTopProducts,
  getRecentSales
} from '../controllers/dashboard.controller';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get dashboard statistics
router.get('/stats', authorize([UserRole.ADMIN, UserRole.MANAGER]), async (req, res, next): Promise<void> => {
  await getDashboardStats(req, res, next);
});

// Get sales overview
router.get('/sales-overview', authorize([UserRole.ADMIN, UserRole.MANAGER]), async (req, res, next): Promise<void> => {
  await getSalesOverview(req, res, next);
});

// Get top products
router.get('/top-products', authorize([UserRole.ADMIN, UserRole.MANAGER]), async (req, res, next): Promise<void> => {
  await getTopProducts(req, res, next);
});

// Get recent sales
router.get('/recent-sales', authorize([UserRole.ADMIN, UserRole.MANAGER]), async (req, res, next): Promise<void> => {
  await getRecentSales(req, res, next);
});

export default router; 