/**
 * Main server application file for the ControlAI Sales System
 * @module server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import customerRoutes from './routes/customer.routes';
import { productRoutes } from './routes/product.routes';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

/**
 * Express application instance
 * @const {express.Application}
 */
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.corsOptions));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);

// Error handling
app.use(errorHandler);

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Start the server
 * @function startServer
 * @returns {Promise<void>}
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`Server running in ${config.env} mode on port ${config.port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing server...');
      server.close(async () => {
        await mongoose.connection.close();
        console.log('Server closed and database connections terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 