import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { OrderService } from './order.service';
import { CustomerService } from './customer.service';
import { InventoryService } from './inventory.service';
import { PaymentService } from './payment.service';
import { ShippingService } from './shipping.service';
import { AuditAction, EntityType } from '../types/audit';

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: {
    period: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  topCustomers: {
    customerId: string;
    name: string;
    orders: number;
    revenue: number;
  }[];
}

export interface InventoryMetrics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  stockByCategory: {
    category: string;
    items: number;
    value: number;
  }[];
  stockMovements: {
    period: string;
    in: number;
    out: number;
    adjustments: number;
  }[];
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerRetention: number;
  customerLifetimeValue: number;
  customerSegments: {
    segment: string;
    count: number;
    revenue: number;
  }[];
}

export interface PaymentMetrics {
  totalPayments: number;
  totalRevenue: number;
  averageTransactionValue: number;
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
  refunds: {
    period: string;
    count: number;
    amount: number;
  }[];
}

export interface ShippingMetrics {
  totalShipments: number;
  deliveredShipments: number;
  averageDeliveryTime: number;
  carriers: {
    carrier: string;
    shipments: number;
    delivered: number;
    averageTime: number;
  }[];
}

export class AnalyticsService {
  private auditService: AuditService;
  private orderService: OrderService;
  private customerService: CustomerService;
  private inventoryService: InventoryService;
  private paymentService: PaymentService;
  private shippingService: ShippingService;

  constructor() {
    this.auditService = new AuditService();
    this.orderService = new OrderService();
    this.customerService = new CustomerService();
    this.inventoryService = new InventoryService();
    this.paymentService = new PaymentService();
    this.shippingService = new ShippingService();
  }

  async getSalesMetrics(timeRange: TimeRange): Promise<SalesMetrics> {
    try {
      const orderStats = await this.orderService.getOrderStats(timeRange.startDate, timeRange.endDate);
      const orders = await this.orderService.getOrders({}, 1, 1000); // Get all orders for the period

      // Calculate revenue by period (monthly)
      const revenueByPeriod = this.calculateRevenueByPeriod(orders.orders, timeRange);

      // Get top products
      const topProducts = await this.calculateTopProducts(orders.orders);

      // Get top customers
      const topCustomers = await this.calculateTopCustomers(orders.orders);

      return {
        totalRevenue: orderStats.totalRevenue,
        totalOrders: orderStats.totalOrders,
        averageOrderValue: orderStats.averageOrderValue,
        revenueByPeriod,
        topProducts,
        topCustomers
      };
    } catch (error) {
      logger.error('Error getting sales metrics:', error);
      throw error;
    }
  }

  async getInventoryMetrics(timeRange: TimeRange): Promise<InventoryMetrics> {
    try {
      const productsResult = await this.inventoryService.getProducts();
      const lowStockProducts = await this.inventoryService.getLowStockProducts();
      const stockMovementsResult = await this.inventoryService.getStockMovements();

      // Calculate inventory value
      const totalValue = productsResult.products.reduce((sum: number, product) => 
        sum + (product.price * product.stock), 0
      );

      // Group by category
      const stockByCategory = this.groupInventoryByCategory(productsResult.products);

      // Calculate stock movements by period
      const movementsByPeriod = this.calculateStockMovementsByPeriod(stockMovementsResult.movements, timeRange);

      return {
        totalProducts: productsResult.products.length,
        totalValue,
        lowStockItems: lowStockProducts.length,
        stockByCategory,
        stockMovements: movementsByPeriod
      };
    } catch (error) {
      logger.error('Error getting inventory metrics:', error);
      throw error;
    }
  }

  async getCustomerMetrics(timeRange: TimeRange): Promise<CustomerMetrics> {
    try {
      const customersResult = await this.customerService.getCustomers();
      const orders = await this.orderService.getOrders({}, 1, 1000);

      // Calculate new customers in the period
      const newCustomers = customersResult.customers.filter((c: any) => 
        c.createdAt >= timeRange.startDate && c.createdAt <= timeRange.endDate
      ).length;

      // Calculate active customers (made at least one order in the period)
      const activeCustomers = new Set(
        orders.orders
          .filter(o => o.createdAt >= timeRange.startDate && o.createdAt <= timeRange.endDate)
          .map(o => o.customerId)
      ).size;

      // Calculate customer retention
      const retention = this.calculateCustomerRetention(customersResult.customers, orders.orders, timeRange);

      // Calculate customer lifetime value
      const lifetimeValue = this.calculateCustomerLifetimeValue(customersResult.customers, orders.orders);

      // Segment customers
      const segments = this.segmentCustomers(customersResult.customers, orders.orders);

      return {
        totalCustomers: customersResult.customers.length,
        newCustomers,
        activeCustomers,
        customerRetention: retention,
        customerLifetimeValue: lifetimeValue,
        customerSegments: segments
      };
    } catch (error) {
      logger.error('Error getting customer metrics:', error);
      throw error;
    }
  }

  async getPaymentMetrics(timeRange: TimeRange): Promise<PaymentMetrics> {
    try {
      const payments = await this.paymentService.getPayments();
      const refunds = await this.paymentService.getRefunds();

      // Filter payments and refunds by time range
      const periodPayments = payments.filter(p => 
        p.createdAt >= timeRange.startDate && p.createdAt <= timeRange.endDate
      );
      const periodRefunds = refunds.filter(r => 
        r.createdAt >= timeRange.startDate && r.createdAt <= timeRange.endDate
      );

      // Calculate total revenue
      const totalRevenue = periodPayments.reduce((sum, p) => sum + p.amount, 0);

      // Group by payment method
      const paymentMethods = this.groupPaymentsByMethod(periodPayments);

      // Calculate refunds by period
      const refundsByPeriod = this.calculateRefundsByPeriod(periodRefunds, timeRange);

      return {
        totalPayments: periodPayments.length,
        totalRevenue,
        averageTransactionValue: totalRevenue / periodPayments.length || 0,
        paymentMethods,
        refunds: refundsByPeriod
      };
    } catch (error) {
      logger.error('Error getting payment metrics:', error);
      throw error;
    }
  }

  async getShippingMetrics(timeRange: TimeRange): Promise<ShippingMetrics> {
    try {
      const shippingStats = await this.shippingService.getShippingStats(
        timeRange.startDate,
        timeRange.endDate
      );

      return {
        totalShipments: shippingStats.totalShipments,
        deliveredShipments: shippingStats.deliveredShipments,
        averageDeliveryTime: shippingStats.averageDeliveryTime,
        carriers: Object.entries(shippingStats.byCarrier).map(([carrier, stats]) => ({
          carrier,
          shipments: stats.count,
          delivered: stats.delivered,
          averageTime: stats.averageTime
        }))
      };
    } catch (error) {
      logger.error('Error getting shipping metrics:', error);
      throw error;
    }
  }

  private calculateRevenueByPeriod(orders: any[], timeRange: TimeRange) {
    const periods: { [key: string]: { revenue: number; orders: number } } = {};
    const months = this.getMonthsBetween(timeRange.startDate, timeRange.endDate);

    // Initialize periods
    months.forEach(month => {
      periods[month] = { revenue: 0, orders: 0 };
    });

    // Aggregate revenue and orders by period
    orders.forEach(order => {
      const month = this.formatMonth(order.createdAt);
      if (periods[month]) {
        periods[month].revenue += order.total;
        periods[month].orders++;
      }
    });

    return Object.entries(periods).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orders: data.orders
    }));
  }

  private async calculateTopProducts(orders: any[]) {
    const productCounts: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

    // Aggregate product data
    for (const order of orders) {
      for (const item of order.items) {
        const product = await this.inventoryService.getProduct(item.productId);
        if (product) {
          if (!productCounts[item.productId]) {
            productCounts[item.productId] = {
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productCounts[item.productId].quantity += item.quantity;
          productCounts[item.productId].revenue += item.price * item.quantity;
        }
      }
    }

    // Convert to array and sort by revenue
    return Object.entries(productCounts)
      .map(([productId, data]) => ({
        productId,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private async calculateTopCustomers(orders: any[]) {
    const customerData: { [key: string]: { name: string; orders: number; revenue: number } } = {};

    // Aggregate customer data
    for (const order of orders) {
      const customer = await this.customerService.getCustomer(order.customerId);
      if (customer) {
        if (!customerData[order.customerId]) {
          customerData[order.customerId] = {
            name: customer.name,
            orders: 0,
            revenue: 0
          };
        }
        customerData[order.customerId].orders++;
        customerData[order.customerId].revenue += order.total;
      }
    }

    // Convert to array and sort by revenue
    return Object.entries(customerData)
      .map(([customerId, data]) => ({
        customerId,
        ...data
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private groupInventoryByCategory(products: any[]) {
    const categories: { [key: string]: { items: number; value: number } } = {};

    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = { items: 0, value: 0 };
      }
      categories[category].items++;
      categories[category].value += product.price * product.stock;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      ...data
    }));
  }

  private calculateStockMovementsByPeriod(movements: any[], timeRange: TimeRange) {
    const periods: { [key: string]: { in: number; out: number; adjustments: number } } = {};
    const months = this.getMonthsBetween(timeRange.startDate, timeRange.endDate);

    // Initialize periods
    months.forEach(month => {
      periods[month] = { in: 0, out: 0, adjustments: 0 };
    });

    // Aggregate movements by period
    movements.forEach(movement => {
      const month = this.formatMonth(movement.timestamp);
      if (periods[month]) {
        if (movement.type === 'IN') {
          periods[month].in += movement.quantity;
        } else if (movement.type === 'OUT') {
          periods[month].out += movement.quantity;
        } else {
          periods[month].adjustments += movement.quantity;
        }
      }
    });

    return Object.entries(periods).map(([period, data]) => ({
      period,
      ...data
    }));
  }

  private calculateCustomerRetention(customers: any[], orders: any[], timeRange: TimeRange) {
    const previousPeriod = {
      startDate: new Date(timeRange.startDate.getTime() - (timeRange.endDate.getTime() - timeRange.startDate.getTime())),
      endDate: timeRange.startDate
    };

    const currentPeriodCustomers = new Set(
      orders
        .filter(o => o.createdAt >= timeRange.startDate && o.createdAt <= timeRange.endDate)
        .map(o => o.customerId)
    );

    const previousPeriodCustomers = new Set(
      orders
        .filter(o => o.createdAt >= previousPeriod.startDate && o.createdAt <= previousPeriod.endDate)
        .map(o => o.customerId)
    );

    const returningCustomers = new Set(
      Array.from(currentPeriodCustomers).filter(id => previousPeriodCustomers.has(id))
    );

    return previousPeriodCustomers.size > 0
      ? (returningCustomers.size / previousPeriodCustomers.size) * 100
      : 0;
  }

  private calculateCustomerLifetimeValue(customers: any[], orders: any[]) {
    const customerRevenue: { [key: string]: number } = {};

    orders.forEach(order => {
      if (!customerRevenue[order.customerId]) {
        customerRevenue[order.customerId] = 0;
      }
      customerRevenue[order.customerId] += order.total;
    });

    const totalRevenue = Object.values(customerRevenue).reduce((sum, revenue) => sum + revenue, 0);
    return customers.length > 0 ? totalRevenue / customers.length : 0;
  }

  private segmentCustomers(customers: any[], orders: any[]) {
    const segments: { [key: string]: { count: number; revenue: number } } = {
      'High Value': { count: 0, revenue: 0 },
      'Medium Value': { count: 0, revenue: 0 },
      'Low Value': { count: 0, revenue: 0 }
    };

    const customerRevenue: { [key: string]: number } = {};

    // Calculate revenue per customer
    orders.forEach(order => {
      if (!customerRevenue[order.customerId]) {
        customerRevenue[order.customerId] = 0;
      }
      customerRevenue[order.customerId] += order.total;
    });

    // Segment customers based on revenue
    Object.entries(customerRevenue).forEach(([customerId, revenue]) => {
      if (revenue >= 1000) {
        segments['High Value'].count++;
        segments['High Value'].revenue += revenue;
      } else if (revenue >= 500) {
        segments['Medium Value'].count++;
        segments['Medium Value'].revenue += revenue;
      } else {
        segments['Low Value'].count++;
        segments['Low Value'].revenue += revenue;
      }
    });

    return Object.entries(segments).map(([segment, data]) => ({
      segment,
      ...data
    }));
  }

  private groupPaymentsByMethod(payments: any[]) {
    const methods: { [key: string]: { count: number; amount: number } } = {};

    payments.forEach(payment => {
      if (!methods[payment.method]) {
        methods[payment.method] = { count: 0, amount: 0 };
      }
      methods[payment.method].count++;
      methods[payment.method].amount += payment.amount;
    });

    return Object.entries(methods).map(([method, data]) => ({
      method,
      ...data
    }));
  }

  private calculateRefundsByPeriod(refunds: any[], timeRange: TimeRange) {
    const periods: { [key: string]: { count: number; amount: number } } = {};
    const months = this.getMonthsBetween(timeRange.startDate, timeRange.endDate);

    // Initialize periods
    months.forEach(month => {
      periods[month] = { count: 0, amount: 0 };
    });

    // Aggregate refunds by period
    refunds.forEach(refund => {
      const month = this.formatMonth(refund.createdAt);
      if (periods[month]) {
        periods[month].count++;
        periods[month].amount += refund.amount;
      }
    });

    return Object.entries(periods).map(([period, data]) => ({
      period,
      ...data
    }));
  }

  private getMonthsBetween(startDate: Date, endDate: Date): string[] {
    const months: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      months.push(this.formatMonth(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  private formatMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
} 