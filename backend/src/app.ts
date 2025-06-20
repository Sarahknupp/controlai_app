import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import morgan from 'morgan';

import { logger, stream } from './utils/logger';

import { requestLogger, errorLogger, performanceLogger } from './middleware/logging';
import { compressionMiddleware } from './middleware/compression';
import { rateLimiter } from './middleware/rateLimit';
import { applySecurityMiddleware } from './middleware/security';
import { protect, authorize } from './middleware/auth.middleware';
import { UserRole } from './types/user';


// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import reportRoutes from './routes/report.routes';
import dashboardRoutes from './routes/dashboard.routes';
import auditRoutes from './routes/audit.routes';
import metricsRoutes from './routes/metrics.routes';
import notificationRoutes from './routes/notification.routes';
import backupRoutes from './routes/backup.routes';
import exportRoutes from './routes/export.routes';
import importRoutes from './routes/import.routes';
import validationRoutes from './routes/validation.routes';

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/controlai_vendas';

export const createApp = (): Express => {
  const app = express();

  // Connect to MongoDB
  mongoose.connect(MONGODB_URI)
    .then(() => {
      logger.info('Connected to MongoDB');
    })
    .catch((err) => {
      logger.error('MongoDB connection error:', err);
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    });

  // Apply security middleware
  applySecurityMiddleware(app);

  // Parse JSON bodies
  app.use(express.json());

  // Rate limiting
  app.use('/api/', rateLimiter);

  // Body parsing middleware
  app.use(express.urlencoded({ extended: true }));

  // Compression middleware
  app.use(compressionMiddleware);

  // Logging middleware
  app.use(morgan('combined', { stream }));
  app.use(requestLogger);
  app.use(errorLogger);
  app.use(performanceLogger);

  // Serve static files
  app.use('/reports', express.static(path.join(process.cwd(), 'reports')));
  app.use('/exports', express.static(path.join(process.cwd(), 'exports')));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/validation', validationRoutes);
  app.use('/api/backup', backupRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/import', importRoutes);
  // app.use('/api/categories', categoriesRoutes); // Commented out until categoriesRoutes is defined

  // Protected route for testing
  app.get('/api/protected', protect as any, (req: Request, res: Response) => {
    res.json({ message: 'Protected route accessed successfully' });
  });

  // Admin route for testing
  app.get('/api/admin', protect as any, authorize(UserRole.ADMIN) as any, (req: Request, res: Response) => {
    res.json({ message: 'Admin route accessed successfully' });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  // 404 handler
  app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });

  });

  return app;
};

const app = createApp();
export default app;

