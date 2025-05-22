import { PDFService } from './pdf.service';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { ReportType, ReportStatus, Report } from '../types/report';
import { AuditAction, EntityType } from '../types/audit';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { OrderService } from './order.service';
import { CustomerService } from './customer.service';
import { InventoryService } from './inventory.service';
import { PaymentService } from './payment.service';
import { NotificationService } from './notification.service';
import { OrderStatus, Order, OrderResult, OrderItem } from '../types/order';
import { Product, ProductResult, StockMovement, StockMovementResult } from '../types/product';
import { Customer, CustomerResult, CustomerSegment, CustomerLifetimeValue } from '../types/customer';

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportOptions {
  timeRange?: TimeRange;
  groupBy?: 'day' | 'week' | 'month' | 'year';
  filters?: Record<string, any>;
  format?: 'json' | 'csv' | 'pdf';
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesByPeriod: Array<{
    period: string;
    sales: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: Array<{
    productId: string;
    name: string;
    currentStock: number;
    minimumStock: number;
  }>;
  stockMovements: Array<{
    productId: string;
    name: string;
    in: number;
    out: number;
    net: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    products: number;
    value: number;
  }>;
}

export interface CustomerReport {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerRetention: number;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    name: string;
    orders: number;
    revenue: number;
    lastOrder: Date;
  }>;
  customerLifetimeValue: Array<{
    customerId: string;
    name: string;
    totalRevenue: number;
    averageOrderValue: number;
    orderFrequency: number;
  }>;
}

export interface PaymentReport {
  totalPayments: number;
  totalRevenue: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  refunds: Array<{
    period: string;
    count: number;
    amount: number;
  }>;
  paymentStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

export class ReportService {
  private reports: Map<string, Report>;
  private pdfService: PDFService;
  private emailService: EmailService;
  private auditService: AuditService;
  private orderService: OrderService;
  private customerService: CustomerService;
  private inventoryService: InventoryService;
  private paymentService: PaymentService;
  private notificationService: NotificationService;

  constructor() {
    this.reports = new Map();
    this.pdfService = new PDFService();
    this.emailService = new EmailService();
    this.auditService = new AuditService();
    this.orderService = new OrderService();
    this.customerService = new CustomerService();
    this.inventoryService = new InventoryService();
    this.paymentService = new PaymentService();
    this.notificationService = new NotificationService();
  }

  async generateReport(type: string, options: ReportOptions): Promise<SalesReport | InventoryReport | CustomerReport | PaymentReport> {
    try {
      // Log report generation start
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.EXPORT,
        entityId: `${type}_report`,
        userId: 'system',
        details: `Started generating ${type} report`,
        status: 'success'
      });

      let report: SalesReport | InventoryReport | CustomerReport | PaymentReport;
      switch (type) {
        case 'sales':
          report = await this.generateSalesReport(options);
          break;
        case 'inventory':
          report = await this.generateInventoryReport(options);
          break;
        case 'customer':
          report = await this.generateCustomerReport(options);
          break;
        case 'payment':
          report = await this.generatePaymentReport(options);
          break;
        default:
          throw new Error(`Invalid report type: ${type}`);
      }

      // Log report generation complete
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.EXPORT,
        entityId: `${type}_report`,
        userId: 'system',
        details: `Completed generating ${type} report`,
        status: 'success'
      });

      return report;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error generating ${type} report:`, error);

      // Log report generation failure
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.EXPORT,
        entityId: `${type}_report`,
        userId: 'system',
        details: `Failed to generate ${type} report: ${errorMessage}`,
        status: 'error'
      });

      throw error;
    }
  }

  private async generateSalesReport(options: ReportOptions): Promise<SalesReport> {
    try {
      const { timeRange, groupBy = 'month' } = options;
      const ordersResult = await this.orderService.getOrders({
        startDate: timeRange?.startDate,
        endDate: timeRange?.endDate
      });

      const orders = ordersResult.orders.map(order => ({
        ...order,
        paymentMethod: order.paymentMethod || 'CASH'
      }));

      // Calculate total sales and revenue
      const totalSales = orders.length;
      const totalRevenue = orders.reduce((sum: number, order) => sum + order.total, 0);
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Group sales by period
      const salesByPeriod = this.groupSalesByPeriod(orders, groupBy);

      // Get top products
      const topProducts = await this.getTopProducts(orders);

      // Get top customers
      const topCustomers = await this.getTopCustomers(orders);

      // Get payment methods breakdown
      const paymentMethods = this.getPaymentMethodsBreakdown(orders);

      const report: SalesReport = {
        totalSales,
        totalRevenue,
        averageOrderValue,
        salesByPeriod,
        topProducts,
        topCustomers,
        paymentMethods
      };

      // Log report generation
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.EXPORT,
        entityId: 'sales_report',
        userId: 'system',
        details: 'Generated sales report',
        status: 'success'
      });

      return report;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating sales report:', error);
      throw new Error(`Failed to generate sales report: ${errorMessage}`);
    }
  }

  private async generateInventoryReport(options: ReportOptions): Promise<InventoryReport> {
    try {
      const { timeRange } = options;
      const productsResult = await this.inventoryService.getProducts();
      const movementsResult = await this.inventoryService.getStockMovements({
        startDate: timeRange?.startDate,
        endDate: timeRange?.endDate
      });

      const products = productsResult.products;
      const movements = movementsResult.movements.map(movement => ({
        ...movement,
        createdAt: movement.createdAt || new Date()
      }));

      // Calculate total products and value
      const totalProducts = products.length;
      const totalValue = products.reduce((sum: number, product) => sum + (product.price * product.stock), 0);

      // Get low stock items
      const lowStockItems = products
        .filter(product => product.stock <= product.minStock)
        .map(product => ({
          productId: product.id,
          name: product.name,
          currentStock: product.stock,
          minimumStock: product.minStock
        }));

      // Calculate stock movements
      const stockMovements = this.calculateStockMovements(products, movements);

      // Get category breakdown
      const categoryBreakdown = this.getCategoryBreakdown(products);

      const report: InventoryReport = {
        totalProducts,
        totalValue,
        lowStockItems,
        stockMovements,
        categoryBreakdown
      };

      // Log report generation
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.EXPORT,
        entityId: 'inventory_report',
        userId: 'system',
        details: 'Generated inventory report',
        status: 'success'
      });

      return report;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating inventory report:', error);
      throw new Error(`Failed to generate inventory report: ${errorMessage}`);
    }
  }

  private async generateCustomerReport(options: ReportOptions): Promise<CustomerReport> {
    try {
      const { timeRange } = options;
      const customersResult = await this.customerService.getCustomers();
      const ordersResult = await this.orderService.getOrders({
        startDate: timeRange?.startDate,
        endDate: timeRange?.endDate
      });

      const customers = customersResult.customers.map(customer => ({
        ...customer,
        address: customer.address ? {
          street: customer.address.street,
          number: customer.address.number || '',
          complement: customer.address.complement || '',
          neighborhood: customer.address.neighborhood || '',
          city: customer.address.city,
          state: customer.address.state,
          zipCode: customer.address.zipCode
        } : undefined
      }));
      const orders = ordersResult.orders.map(order => ({
        ...order,
        paymentMethod: order.paymentMethod || 'CASH'
      }));

      // Calculate customer metrics
      const totalCustomers = customers.length;
      const newCustomers = customers.filter(c => 
        c.createdAt >= (timeRange?.startDate || new Date(0))
      ).length;
      const activeCustomers = new Set(orders.map(o => o.customerId)).size;
      const customerRetention = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

      // Get customer segments
      const customerSegments = this.getCustomerSegments(customers, orders);

      // Get top customers
      const topCustomers = await this.getTopCustomers(orders);

      // Calculate customer lifetime value
      const customerLifetimeValue = this.calculateCustomerLifetimeValue(customers, orders);

      const report: CustomerReport = {
        totalCustomers,
        newCustomers,
        activeCustomers,
        customerRetention,
        customerSegments,
        topCustomers,
        customerLifetimeValue
      };

      // Log report generation
      await this.auditService.logAction({
        action: AuditAction.READ,
        entityType: EntityType.EXPORT,
        entityId: 'customer_report',
        userId: 'system',
        details: 'Generated customer report',
        status: 'success'
      });

      return report;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating customer report:', error);
      throw new Error(`Failed to generate customer report: ${errorMessage}`);
    }
  }

  private async generatePaymentReport(options: ReportOptions): Promise<PaymentReport> {
    // Implementation of generatePaymentReport method
    throw new Error('Method not implemented');
  }

  private updateReportStatus(
    reportId: string,
    status: ReportStatus,
    error?: string
  ): void {
    const report = this.reports.get(reportId);
    if (report) {
      report.status = status;
      report.updatedAt = new Date();
      if (error) {
        report.error = error;
      }
      this.reports.set(reportId, report);
    }
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReports(
    filters: {
      type?: ReportType;
      status?: ReportStatus;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{ reports: Report[]; total: number; page: number; limit: number }> {
    let reports = Array.from(this.reports.values());

    if (filters.type) {
      reports = reports.filter(report => report.type === filters.type);
    }
    if (filters.status) {
      reports = reports.filter(report => report.status === filters.status);
    }
    if (filters.userId) {
      reports = reports.filter(report => report.userId === filters.userId);
    }
    if (filters.startDate) {
      reports = reports.filter(report => report.createdAt >= filters.startDate!);
    }
    if (filters.endDate) {
      reports = reports.filter(report => report.createdAt <= filters.endDate!);
    }

    const total = reports.length;
    const paginatedReports = reports.slice((page - 1) * limit, page * limit);

    return {
      reports: paginatedReports,
      total,
      page,
      limit
    };
  }

  async deleteReport(id: string): Promise<void> {
    const report = this.reports.get(id);
    if (!report) {
      throw new Error(`Report not found: ${id}`);
    }

    this.reports.delete(id);

    // Log report deletion
    await this.auditService.logAction({
      action: AuditAction.DELETE,
      entityType: EntityType.REPORT,
      entityId: id,
      details: `Report ${report.name} deleted`,
      status: 'success',
      userId: report.userId,
      metadata: {
        reportType: report.type,
        reportName: report.name
      }
    });
  }

  // Helper Methods
  private groupSalesByPeriod(orders: Order[], groupBy: string): Array<{ period: string; sales: number; revenue: number }> {
    const grouped = new Map<string, { sales: number; revenue: number }>();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let period: string;

      switch (groupBy) {
        case 'day':
          period = date.toISOString().split('T')[0];
          break;
        case 'week':
          const week = this.getWeekNumber(date);
          period = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          period = date.getFullYear().toString();
          break;
        default:
          period = date.toISOString().split('T')[0];
      }

      const current = grouped.get(period) || { sales: 0, revenue: 0 };
      grouped.set(period, {
        sales: current.sales + 1,
        revenue: current.revenue + order.total
      });
    });

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      ...data
    }));
  }

  private async getTopProducts(orders: Order[]): Promise<Array<{ productId: string; name: string; quantity: number; revenue: number }>> {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const current = productMap.get(item.productId) || {
          name: item.product?.name || 'Unknown',
          quantity: 0,
          revenue: 0
        };

        productMap.set(item.productId, {
          name: current.name,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price * item.quantity)
        });
      });
    });

    return Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getTopCustomers(orders: Order[]): Promise<Array<{ customerId: string; name: string; orders: number; revenue: number; lastOrder: Date }>> {
    const customerMap = new Map<string, { name: string; orders: number; revenue: number; lastOrder: Date }>();

    orders.forEach(order => {
      const current = customerMap.get(order.customerId) || {
        name: order.customerName || 'Unknown',
        orders: 0,
        revenue: 0,
        lastOrder: order.createdAt
      };

      customerMap.set(order.customerId, {
        name: current.name,
        orders: current.orders + 1,
        revenue: current.revenue + order.total,
        lastOrder: order.createdAt > current.lastOrder ? order.createdAt : current.lastOrder
      });
    });

    return Array.from(customerMap.entries())
      .map(([customerId, data]) => ({
        customerId,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private getPaymentMethodsBreakdown(orders: Order[]): Array<{ method: string; count: number; revenue: number }> {
    const methodMap = new Map<string, { count: number; revenue: number }>();

    orders.forEach(order => {
      const current = methodMap.get(order.paymentMethod) || { count: 0, revenue: 0 };
      methodMap.set(order.paymentMethod, {
        count: current.count + 1,
        revenue: current.revenue + order.total
      });
    });

    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private calculateStockMovements(products: Product[], movements: StockMovement[]): Array<{ productId: string; name: string; in: number; out: number; net: number }> {
    const movementMap = new Map<string, { name: string; in: number; out: number }>();

    // Initialize with products
    products.forEach(product => {
      movementMap.set(product.id, { name: product.name, in: 0, out: 0 });
    });

    // Calculate movements
    movements.forEach(movement => {
      const current = movementMap.get(movement.productId);
      if (current) {
        if (movement.type === 'IN') {
          current.in += movement.quantity;
        } else {
          current.out += movement.quantity;
        }
      }
    });

    return Array.from(movementMap.entries())
      .map(([productId, data]) => ({
        productId,
        ...data,
        net: data.in - data.out
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }

  private getCategoryBreakdown(products: Product[]): Array<{ category: string; products: number; value: number }> {
    const categoryMap = new Map<string, { products: number; value: number }>();

    products.forEach(product => {
      const current = categoryMap.get(product.category) || { products: 0, value: 0 };
      categoryMap.set(product.category, {
        products: current.products + 1,
        value: current.value + (product.price * product.stock)
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        ...data
      }))
      .sort((a, b) => b.value - a.value);
  }

  private getCustomerSegments(customers: Customer[], orders: Order[]): CustomerSegment[] {
    const segments = new Map<string, { count: number; revenue: number }>();

    customers.forEach(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const totalRevenue = customerOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = customerOrders.length;

      let segment: string;
      if (orderCount === 0) {
        segment = 'Inactive';
      } else if (orderCount === 1) {
        segment = 'One-time';
      } else if (orderCount <= 3) {
        segment = 'Occasional';
      } else if (orderCount <= 10) {
        segment = 'Regular';
      } else {
        segment = 'VIP';
      }

      const current = segments.get(segment) || { count: 0, revenue: 0 };
      segments.set(segment, {
        count: current.count + 1,
        revenue: current.revenue + totalRevenue
      });
    });

    return Array.from(segments.entries())
      .map(([segment, data]) => ({
        segment,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private calculateCustomerLifetimeValue(customers: Customer[], orders: Order[]): CustomerLifetimeValue[] {
    return customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const totalRevenue = customerOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = customerOrders.length;
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      // Calculate order frequency (orders per month)
      const firstOrder = customerOrders[0]?.createdAt;
      const lastOrder = customerOrders[customerOrders.length - 1]?.createdAt;
      const monthsActive = firstOrder && lastOrder
        ? (new Date(lastOrder).getTime() - new Date(firstOrder).getTime()) / (1000 * 60 * 60 * 24 * 30)
        : 0;
      const orderFrequency = monthsActive > 0 ? orderCount / monthsActive : 0;

      return {
        customerId: customer.id,
        name: customer.name,
        totalRevenue,
        averageOrderValue,
        orderFrequency,
        lastOrder: lastOrder
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  private getRefundsByPeriod(payments: any[], groupBy: string): Array<{ period: string; count: number; amount: number }> {
    const refunds = payments.filter(p => p.status === 'REFUNDED');
    const grouped = new Map<string, { count: number; amount: number }>();

    refunds.forEach(refund => {
      const date = new Date(refund.updatedAt);
      let period: string;

      switch (groupBy) {
        case 'day':
          period = date.toISOString().split('T')[0];
          break;
        case 'week':
          const week = this.getWeekNumber(date);
          period = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          period = date.getFullYear().toString();
          break;
        default:
          period = date.toISOString().split('T')[0];
      }

      const current = grouped.get(period) || { count: 0, amount: 0 };
      grouped.set(period, {
        count: current.count + 1,
        amount: current.amount + refund.amount
      });
    });

    return Array.from(grouped.entries())
      .map(([period, data]) => ({
        period,
        ...data
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private getPaymentStatusBreakdown(payments: any[]): Array<{ status: string; count: number; amount: number }> {
    const statusMap = new Map<string, { count: number; amount: number }>();

    payments.forEach(payment => {
      const current = statusMap.get(payment.status) || { count: 0, amount: 0 };
      statusMap.set(payment.status, {
        count: current.count + 1,
        amount: current.amount + payment.amount
      });
    });

    return Array.from(statusMap.entries())
      .map(([status, data]) => ({
        status,
        ...data
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
} 