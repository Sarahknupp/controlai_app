import { Express } from 'express';
import { logger } from '../utils/logger';
import { format, transports } from 'winston';

export const applyMonitoringMiddleware = (app: Express): void => {
  try {
    // Request monitoring middleware
    app.use((req, res, next) => {
      const start = process.hrtime();

      res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;

        logger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration.toFixed(2)}ms`,
          userAgent: req.get('user-agent')
        });
      });

      next();
    });

    logger.info('Monitoring middleware applied successfully');
  } catch (error) {
    logger.error('Error applying monitoring middleware:', error);
    throw error;
  }
};

// Monitor memory usage
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  logger.info('Memory usage', {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
  });
}, 60000); // Every minute

// Monitor CPU usage
setInterval(() => {
  const cpuUsage = process.cpuUsage();
  logger.info('CPU usage', {
    user: `${Math.round(cpuUsage.user / 1000)}ms`,
    system: `${Math.round(cpuUsage.system / 1000)}ms`
  });
}, 60000); // Every minute

// Log application shutdown
process.on('SIGTERM', () => {
  logger.info('Application shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Application shutting down');
  process.exit(0);
}); 