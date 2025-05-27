import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import path from 'path';
import { logger, stream } from './utils/logger';
import { errorHandler } from './middleware/error';
import { requestLogger, errorLogger, performanceLogger } from './middleware/logging';
import { compressionMiddleware } from './middleware/compression';
import { applySecurityMiddleware } from './config/security';
import { protect, authorize } from './middleware/auth.middleware';
import { UserRole } from './types/user';
import { IUserDocument } from './models/User';

// Import routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import customerRoutes from './routes/customer.routes';
import saleRoutes from './routes/sale.routes';
import ocrRoutes from './routes/ocr.routes';
import auditRoutes from './routes/audit.routes';
import metricsRoutes from './routes/metrics.routes';
import pdfRoutes from './routes/pdf.routes';
import emailRoutes from './routes/email.routes';
import receiptRoutes from './routes/receipt.routes';
import notificationRoutes from './routes/notification.routes';
import backupRoutes from './routes/backup.routes';
import reportRoutes from './routes/report.routes';
import scheduledReportRoutes from './routes/scheduled-report.routes';
import exportRoutes from './routes/export.routes';
import importRoutes from './routes/import.routes';
import syncRoutes from './routes/sync.routes';
import validationRoutes from './routes/validation.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/controlai_vendas';
const PORT = process.env.PORT || 5000;


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
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

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

// Start server
if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
} 