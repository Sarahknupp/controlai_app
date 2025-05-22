import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';
import { IUser } from '../types/user';

// Create logger instance
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/metrics.log' }),
  ],
});

// Metrics interface
interface Metrics {
  timestamp: number;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}

// Store metrics in memory (in production, use a proper metrics database)
const metrics: Metrics[] = [];

// Clean up old metrics every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  const index = metrics.findIndex(m => m.timestamp > oneHourAgo);
  if (index > 0) {
    metrics.splice(0, index);
  }
}, 3600000);

// Monitoring middleware
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Capture request start time
  const start = Date.now();

  // Capture response
  const originalJson = res.json;
  res.json = function (body: any): Response {
    // Calculate response time
    const responseTime = Date.now() - start;

    // Create metrics object
    const metric: Metrics = {
      timestamp: Date.now(),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userId: (req.user as IUser)?.id,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    // Add to metrics array
    metrics.push(metric);

    // Log metric
    logger.info('Request metric', metric);

    // Restore original json function
    res.json = originalJson;
    return res.json(body);
  };

  next();
};

// Error monitoring middleware
export const errorMonitoringMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Create error metric
  const metric: Metrics = {
    timestamp: Date.now(),
    method: req.method,
    path: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: 0,
    userId: (req.user as IUser)?.id,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    error: error.message,
  };

  // Add to metrics array
  metrics.push(metric);

  // Log error metric
  logger.error('Error metric', metric);

  next(error);
};

// Get metrics
export const getMetrics = () => {
  return metrics;
};

// Get metrics summary
export const getMetricsSummary = () => {
  const summary = {
    totalRequests: metrics.length,
    averageResponseTime: 0,
    requestsByMethod: {} as Record<string, number>,
    requestsByPath: {} as Record<string, number>,
    requestsByStatusCode: {} as Record<number, number>,
    errors: 0,
  };

  if (metrics.length > 0) {
    // Calculate average response time
    const totalResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0);
    summary.averageResponseTime = totalResponseTime / metrics.length;

    // Count requests by method
    metrics.forEach(m => {
      summary.requestsByMethod[m.method] = (summary.requestsByMethod[m.method] || 0) + 1;
    });

    // Count requests by path
    metrics.forEach(m => {
      summary.requestsByPath[m.path] = (summary.requestsByPath[m.path] || 0) + 1;
    });

    // Count requests by status code
    metrics.forEach(m => {
      summary.requestsByStatusCode[m.statusCode] = (summary.requestsByStatusCode[m.statusCode] || 0) + 1;
    });

    // Count errors
    summary.errors = metrics.filter(m => m.error).length;
  }

  return summary;
}; 