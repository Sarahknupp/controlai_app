import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger, stream } from './utils/logger';
import { requestLogger, errorLogger, performanceLogger } from './middleware/logging';
import { compressionMiddleware } from './middleware/compression';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';
import { applySecurityMiddleware } from './middleware/security';
import { applyCacheMiddleware } from './middleware/cache';
import { applyMonitoringMiddleware } from './middleware/monitoring';
import { applyDocsMiddleware } from './middleware/docs';

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

// Create Express app
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

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream }));
app.use(compressionMiddleware);
app.use(rateLimiter);
app.use(requestLogger);
app.use(performanceLogger);

// Apply security middleware
applySecurityMiddleware(app);

// Apply cache middleware
applyCacheMiddleware(app);

// Apply monitoring middleware
applyMonitoringMiddleware(app);

// Apply documentation middleware
applyDocsMiddleware(app);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/import', importRoutes);

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// 404 handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default app; 