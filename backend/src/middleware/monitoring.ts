import { Express } from 'express';
import { logger } from './logging';
import { format, transports } from 'winston';

export const applyMonitoringMiddleware = (app: Express) => {
  // Add monitoring logger
  const monitoringLogger = logger.child({ module: 'monitoring' });

  // Log application startup
  monitoringLogger.info('Application starting up');

  // Monitor request performance
  app.use((req: any, res: any, next: any) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      monitoringLogger.info('Request performance', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`
      });
    });

    next();
  });

  // Monitor memory usage
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    monitoringLogger.info('Memory usage', {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    });
  }, 60000); // Every minute

  // Monitor CPU usage
  setInterval(() => {
    const cpuUsage = process.cpuUsage();
    monitoringLogger.info('CPU usage', {
      user: `${Math.round(cpuUsage.user / 1000)}ms`,
      system: `${Math.round(cpuUsage.system / 1000)}ms`
    });
  }, 60000); // Every minute

  // Log application shutdown
  process.on('SIGTERM', () => {
    monitoringLogger.info('Application shutting down');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    monitoringLogger.info('Application shutting down');
    process.exit(0);
  });
}; 