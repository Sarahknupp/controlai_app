import { Sale } from '../models/sale.model';
import { Product } from '../models/product.model';
import { Customer } from '../models/customer.model';
import { User } from '../models/user.model';
import { AuditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import { NotificationService } from './notification.service';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import os from 'os';
import mongoose from 'mongoose';
import { createLogger, format, transports } from 'winston';
import { join } from 'path';

interface MetricsOptions {
  type: 'system' | 'business' | 'all';
  userId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
  network: {
    connections: number;
    bytesIn: number;
    bytesOut: number;
  };
  database: {
    connections: number;
    operations: number;
    latency: number;
  };
  uptime: number;
}

interface BusinessMetrics {
  sales: {
    total: number;
    revenue: number;
    averageTicket: number;
    byPeriod: Array<{
      period: string;
      total: number;
      revenue: number;
    }>;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
    topSelling: Array<{
      product: string;
      quantity: number;
      revenue: number;
    }>;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    topSpending: Array<{
      customer: string;
      total: number;
      orders: number;
    }>;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
}

interface MetricsResult {
  metricsId: string;
  type: string;
  timestamp: Date;
  status: 'success' | 'error';
  details: {
    system?: SystemMetrics;
    business?: BusinessMetrics;
  };
}

const { combine, timestamp, printf } = format;

// Configuração do logger de métricas
const metricsLogger = createLogger({
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      });
    })
  ),
  transports: [
    new transports.File({
      filename: join('logs', 'metrics.log'),
      level: 'info'
    })
  ]
});

export class MetricsService extends EventEmitter {
  private auditService: AuditService;
  private notificationService: NotificationService;
  private metricsInProgress: boolean;
  private static instance: MetricsService;
  private metrics: Map<string, number> = new Map();
  private readonly ALERT_THRESHOLD = 1000; // 1 segundo

  constructor() {
    super();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.metricsInProgress = false;
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  async collectMetrics(options: MetricsOptions): Promise<MetricsResult> {
    if (this.metricsInProgress) {
      throw new Error('Metrics collection already in progress');
    }

    const timestamp = new Date();
    const metricsId = `metrics_${options.type}_${timestamp.getTime()}`;
    this.metricsInProgress = true;

    try {
      const result = await this.performMetricsCollection(options);

      // Log the metrics collection
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.METRICS,
        entityId: metricsId,
        userId: options.userId,
        details: `Collected ${options.type} metrics`,
        status: 'success'
      });

      // Emit metrics complete event
      this.emit('metricsComplete', {
        type: options.type,
        timestamp,
        result
      });

      // Send notification
      await this.notificationService.sendNotification({
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Metrics Collection Complete',
        message: `Successfully collected ${options.type} metrics`,
        metadata: {
          metricsId,
          type: options.type,
          timestamp: timestamp.toISOString()
        }
      });

      return {
        metricsId,
        type: options.type,
        timestamp,
        status: 'success',
        details: result
      };
    } catch (error) {
      logger.error('Error collecting metrics:', error);

      // Log failure
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.METRICS,
        entityId: metricsId,
        userId: options.userId,
        details: `Failed to collect ${options.type} metrics: ${error.message}`,
        status: 'error'
      });

      // Send failure notification
      await this.notificationService.sendNotification({
        type: 'ERROR',
        priority: 'HIGH',
        title: 'Metrics Collection Failed',
        message: `Failed to collect ${options.type} metrics`,
        metadata: {
          metricsId,
          type: options.type,
          error: error.message,
          timestamp: timestamp.toISOString()
        }
      });

      throw error;
    } finally {
      this.metricsInProgress = false;
    }
  }

  private async performMetricsCollection(options: MetricsOptions): Promise<{
    system?: SystemMetrics;
    business?: BusinessMetrics;
  }> {
    const result: {
      system?: SystemMetrics;
      business?: BusinessMetrics;
    } = {};

    if (options.type === 'system' || options.type === 'all') {
      result.system = await this.collectSystemMetrics();
    }

    if (options.type === 'business' || options.type === 'all') {
      result.business = await this.collectBusinessMetrics(options.timeRange);
    }

    return result;
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    // Get database metrics
    const dbStats = await mongoose.connection.db.stats();
    const dbConnections = await mongoose.connection.db.admin().serverStatus();

    return {
      cpu: {
        usage: cpuUsage[0],
        cores: os.cpus().length,
        loadAverage: cpuUsage
      },
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        usagePercentage: (usedMemory / totalMemory) * 100
      },
      disk: {
        total: 0, // Would need to implement disk space checking
        free: 0,
        used: 0,
        usagePercentage: 0
      },
      network: {
        connections: dbConnections.connections.current,
        bytesIn: dbStats.network.bytesIn,
        bytesOut: dbStats.network.bytesOut
      },
      database: {
        connections: dbConnections.connections.current,
        operations: dbStats.opcounters.total,
        latency: dbStats.opLatencies.reads.latency
      },
      uptime: os.uptime()
    };
  }

  private async collectBusinessMetrics(timeRange?: { start: Date; end: Date }): Promise<BusinessMetrics> {
    const query = timeRange ? {
      createdAt: {
        $gte: timeRange.start,
        $lte: timeRange.end
      }
    } : {};

    // Get sales metrics
    const sales = await Sale.find(query).populate('product customer');
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    // Get product metrics
    const products = await Product.find();
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => p.stock < lowStockThreshold);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    // Get customer metrics
    const customers = await Customer.find();
    const activeCustomers = await Sale.distinct('customer', query);
    const newCustomers = await Customer.find({
      createdAt: timeRange ? {
        $gte: timeRange.start,
        $lte: timeRange.end
      } : {}
    });

    // Get user metrics
    const users = await User.find();
    const activeUsers = await Sale.distinct('user', query);
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate top selling products
    const productSales = sales.reduce((acc, sale) => {
      const productId = sale.product._id.toString();
      if (!acc[productId]) {
        acc[productId] = {
          product: sale.product.name,
          quantity: 0,
          revenue: 0
        };
      }
      acc[productId].quantity += sale.quantity;
      acc[productId].revenue += sale.total;
      return acc;
    }, {} as Record<string, { product: string; quantity: number; revenue: number }>);

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate top spending customers
    const customerSpending = sales.reduce((acc, sale) => {
      const customerId = sale.customer._id.toString();
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: sale.customer.name,
          total: 0,
          orders: 0
        };
      }
      acc[customerId].total += sale.total;
      acc[customerId].orders += 1;
      return acc;
    }, {} as Record<string, { customer: string; total: number; orders: number }>);

    const topSpendingCustomers = Object.values(customerSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      sales: {
        total: sales.length,
        revenue: totalRevenue,
        averageTicket: sales.length > 0 ? totalRevenue / sales.length : 0,
        byPeriod: [] // Would need to implement period grouping
      },
      products: {
        total: products.length,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        topSelling: topSellingProducts
      },
      customers: {
        total: customers.length,
        active: activeCustomers.length,
        new: newCustomers.length,
        topSpending: topSpendingCustomers
      },
      users: {
        total: users.length,
        active: activeUsers.length,
        byRole: usersByRole
      }
    };
  }

  isMetricsInProgress(): boolean {
    return this.metricsInProgress;
  }

  public logRequestTime(path: string, method: string, duration: number): void {
    const key = `${method}:${path}`;
    this.metrics.set(key, duration);

    metricsLogger.info('Request time', {
      path,
      method,
      duration,
      timestamp: new Date().toISOString()
    });

    if (duration > this.ALERT_THRESHOLD) {
      this.logSlowRequest(path, method, duration);
    }
  }

  public logErrorRate(path: string, method: string, errorCount: number): void {
    const key = `error:${method}:${path}`;
    this.metrics.set(key, errorCount);

    metricsLogger.info('Error rate', {
      path,
      method,
      errorCount,
      timestamp: new Date().toISOString()
    });
  }

  public logMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    metricsLogger.info('Memory usage', {
      ...memoryUsage,
      timestamp: new Date().toISOString()
    });
  }

  public logDatabaseQueryTime(operation: string, duration: number): void {
    metricsLogger.info('Database query time', {
      operation,
      duration,
      timestamp: new Date().toISOString()
    });

    if (duration > this.ALERT_THRESHOLD) {
      this.logSlowQuery(operation, duration);
    }
  }

  private logSlowRequest(path: string, method: string, duration: number): void {
    metricsLogger.warn('Slow request detected', {
      path,
      method,
      duration,
      threshold: this.ALERT_THRESHOLD,
      timestamp: new Date().toISOString()
    });
  }

  private logSlowQuery(operation: string, duration: number): void {
    metricsLogger.warn('Slow query detected', {
      operation,
      duration,
      threshold: this.ALERT_THRESHOLD,
      timestamp: new Date().toISOString()
    });
  }

  public getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  public resetMetrics(): void {
    this.metrics.clear();
  }
} 