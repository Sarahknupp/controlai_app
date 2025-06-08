import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { logger } from '../utils/logger';
import { IUser } from '../types/user';

const { format, transports } = winston;

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/monitoring.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Metrics interface
interface Metric {
  timestamp: number;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
  userId?: string;
  error?: string;
}

interface RequestMetrics {
  count: number;
  totalTime: number;
  minTime: number;
  maxTime: number;
}

// Store metrics in memory (in production, use a proper metrics database)
const metrics: { [key: string]: RequestMetrics } = {};

// Clean up old metrics every hour
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  const index = Object.keys(metrics).findIndex(key => metrics[key].timestamp > oneHourAgo);
  if (index > 0) {
    const keys = Object.keys(metrics).slice(0, index);
    keys.forEach(key => delete metrics[key]);
  }
}, 3600000);

// Monitoring middleware
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;

  // Initialize metrics for this path if not exists
  if (!metrics[path]) {
    metrics[path] = {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0
    };
  }

  // Log request start
  logger.info('Request started', {
    method: req.method,
    path,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - start;

    // Update metrics
    metrics[path].count++;
    metrics[path].totalTime += duration;
    metrics[path].minTime = Math.min(metrics[path].minTime, duration);
    metrics[path].maxTime = Math.max(metrics[path].maxTime, duration);

    // Log request completion
    logger.info('Request completed', {
      method: req.method,
      path,
      statusCode: res.statusCode,
      duration,
      metrics: {
        count: metrics[path].count,
        avgTime: metrics[path].totalTime / metrics[path].count,
        minTime: metrics[path].minTime,
        maxTime: metrics[path].maxTime
      }
    });
  });

  next();
};

// Error monitoring middleware
export const errorMonitoringMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const metric: Metric = {
    timestamp: Date.now(),
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    responseTime: 0,
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
    userId: req.user?.id,
    error: error.message
  };

  metrics.push(metric);
  logger.error('Error metric', metric);

  next(error);
};

// Get metrics
export const getMetrics = () => {
  return Object.entries(metrics).reduce((acc, [path, data]) => {
    acc[path] = {
      ...data,
      avgTime: data.totalTime / data.count
    };
    return acc;
  }, {} as { [key: string]: RequestMetrics & { avgTime: number } });
};

// Get metrics summary
export const getMetricsSummary = () => {
  const summary = {
    totalRequests: metrics.length,
    errors: metrics.filter(m => m.error).length,
    averageResponseTime: metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length || 0,
    requestsByMethod: {} as Record<string, number>,
    requestsByPath: {} as Record<string, number>,
    requestsByStatusCode: {} as Record<string, number>
  };

  metrics.forEach(metric => {
    summary.requestsByMethod[metric.method] = (summary.requestsByMethod[metric.method] || 0) + 1;
    summary.requestsByPath[metric.path] = (summary.requestsByPath[metric.path] || 0) + 1;
    summary.requestsByStatusCode[metric.statusCode] = (summary.requestsByStatusCode[metric.statusCode] || 0) + 1;
  });

  return summary;
}; 