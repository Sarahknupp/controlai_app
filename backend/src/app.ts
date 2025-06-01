import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet'; // Importação correta
import morgan, { StreamOptions } from 'morgan';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import path from 'path';
import { logger, stream } from './utils/logger';
import { errorHandler } from './middleware/error';
import { requestLogger, errorLogger, performanceLogger } from './middleware/logging';
import { compressionMiddleware } from './middleware/compression';

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
// import userRoutes from './routes/user.routes'; // TODO: Create user.routes.ts and uncomment this line

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/controlai_vendas';
const PORT = process.env.PORT || 5000;

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

// Security middleware
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
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

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production' || process.env.REPL_ID) {
  const distPath = path.join(process.cwd(), '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes); // TODO: Create user.routes.ts and uncomment this line
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

export default app; 