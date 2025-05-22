import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { CustomerService } from './customer.service';
import { InventoryService } from './inventory.service';
import { PaymentService } from './payment.service';
import { AuditAction, EntityType } from '../types/audit';
import { Order, OrderStatus, OrderFilters, OrderResult, OrderItem } from '../types/order';

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'PICKUP';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  shippingMethod: ShippingMethod;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderService {
  private orders: Map<string, Order>;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private customerService: CustomerService;
  private inventoryService: InventoryService;
  private paymentService: PaymentService;

  constructor() {
    this.orders = new Map();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.customerService = new CustomerService();
    this.inventoryService = new InventoryService();
    this.paymentService = new PaymentService();
  }

  async createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      // Validate customer
      const customer = await this.customerService.getCustomer(data.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${data.customerId}`);
      }

      // Validate products and check stock
      for (const item of data.items) {
        const product = await this.inventoryService.getProduct(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }
      }

      // Generate order number (format: ORD-YYYYMMDD-XXXX)
      const date = new Date();
      const orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const order: Order = {
        id: uuidv4(),
        orderNumber,
        ...data,
        status: 'PENDING',
        createdAt: date,
        updatedAt: date
      };

      this.orders.set(order.id, order);

      // Log order creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.ORDER,
        entityId: order.id,
        userId: 'system',
        details: `Created order ${order.orderNumber} for customer: ${customer.name}`,
        status: 'success'
      });

      // Send order confirmation if notifications are enabled
      if (customer.preferences?.notifications) {
        await this.notificationService.sendUserNotification(
          customer.id,
          'Order Confirmation',
          `Your order ${order.orderNumber} has been received and is being processed.`
        );
      }

      return order;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string = 'system'
  ): Promise<Order> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const customer = await this.customerService.getCustomer(order.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${order.customerId}`);
      }

      const previousStatus = order.status;
      order.status = status;
      order.updatedAt = new Date();

      this.orders.set(orderId, order);

      // Handle status-specific actions
      switch (status) {
        case 'CONFIRMED':
          await this.handleOrderConfirmation(order);
          break;
        case 'PROCESSING':
          await this.handleOrderProcessing(order);
          break;
        case 'SHIPPED':
          await this.handleOrderShipped(order);
          break;
        case 'DELIVERED':
          await this.handleOrderDelivered(order);
          break;
        case 'CANCELLED':
          await this.handleOrderCancellation(order);
          break;
        case 'REFUNDED':
          await this.handleOrderRefund(order);
          break;
      }

      // Log status update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.ORDER,
        entityId: orderId,
        userId,
        details: `Updated order ${order.orderNumber} status from ${previousStatus} to ${status}`,
        status: 'success'
      });

      // Send notification if enabled
      if (customer.preferences?.notifications) {
        await this.notificationService.sendUserNotification(
          customer.id,
          'Order Status Update',
          `Your order ${order.orderNumber} status has been updated to ${status.toLowerCase()}.`
        );
      }

      return order;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  private async handleOrderConfirmation(order: Order): Promise<void> {
    // Reserve inventory
    for (const item of order.items) {
      await this.inventoryService.removeStock(
        item.productId,
        item.quantity,
        `Order ${order.orderNumber}`,
        'system'
      );
    }
  }

  private async handleOrderProcessing(order: Order): Promise<void> {
    // Additional processing logic if needed
    logger.info(`Processing order ${order.orderNumber}`);
  }

  private async handleOrderShipped(order: Order): Promise<void> {
    // Shipping logic
    logger.info(`Order ${order.orderNumber} has been shipped`);
  }

  private async handleOrderDelivered(order: Order): Promise<void> {
    // Delivery confirmation logic
    logger.info(`Order ${order.orderNumber} has been delivered`);
  }

  private async handleOrderCancellation(order: Order): Promise<void> {
    // Return items to inventory
    for (const item of order.items) {
      await this.inventoryService.addStock(
        item.productId,
        item.quantity,
        `Cancelled order ${order.orderNumber}`,
        'system'
      );
    }

    // Cancel payment if exists
    if (order.paymentId) {
      try {
        await this.paymentService.processRefund(
          order.paymentId,
          order.total,
          `Order ${order.orderNumber} cancelled`
        );
      } catch (error) {
        logger.error(`Error processing refund for cancelled order ${order.orderNumber}:`, error);
      }
    }
  }

  private async handleOrderRefund(order: Order): Promise<void> {
    // Return items to inventory
    for (const item of order.items) {
      await this.inventoryService.addStock(
        item.productId,
        item.quantity,
        `Refunded order ${order.orderNumber}`,
        'system'
      );
    }

    // Process refund if payment exists
    if (order.paymentId) {
      try {
        await this.paymentService.processRefund(
          order.paymentId,
          order.total,
          `Order ${order.orderNumber} refunded`
        );
      } catch (error) {
        logger.error(`Error processing refund for order ${order.orderNumber}:`, error);
      }
    }
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(filters?: OrderFilters): Promise<OrderResult> {
    try {
      // TODO: Implement actual database query
      const orders: Order[] = [];
      const total = orders.length;
      const page = 1;
      const limit = 10;

      return { orders, total, page, limit };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting orders:', error);
      throw new Error(`Failed to get orders: ${errorMessage}`);
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      // TODO: Implement actual database query
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting order by id:', error);
      throw new Error(`Failed to get order: ${errorMessage}`);
    }
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    try {
      // TODO: Implement actual database query
      const updatedOrder: Order = {
        id,
        customerId: 'temp-customer-id',
        items: [],
        total: 0,
        status: OrderStatus.PENDING,
        paymentMethod: 'CASH',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.ORDER,
        entityId: id,
        userId: 'system',
        details: 'Updated order',
        status: 'success'
      });

      return updatedOrder;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating order:', error);
      throw new Error(`Failed to update order: ${errorMessage}`);
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      // TODO: Implement actual database query
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.ORDER,
        entityId: id,
        userId: 'system',
        details: 'Deleted order',
        status: 'success'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting order:', error);
      throw new Error(`Failed to delete order: ${errorMessage}`);
    }
  }

  async getOrderStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    byStatus: Record<OrderStatus, { count: number; revenue: number }>;
    byShippingMethod: Record<ShippingMethod, { count: number; revenue: number }>;
  }> {
    try {
      const orders = Array.from(this.orders.values())
        .filter(o => o.createdAt >= startDate && o.createdAt <= endDate);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const byStatus: Record<OrderStatus, { count: number; revenue: number }> = {} as any;
      const byShippingMethod: Record<ShippingMethod, { count: number; revenue: number }> = {} as any;

      orders.forEach(order => {
        // Aggregate by status
        if (!byStatus[order.status]) {
          byStatus[order.status] = { count: 0, revenue: 0 };
        }
        byStatus[order.status].count++;
        byStatus[order.status].revenue += order.total;

        // Aggregate by shipping method
        if (!byShippingMethod[order.shippingMethod]) {
          byShippingMethod[order.shippingMethod] = { count: 0, revenue: 0 };
        }
        byShippingMethod[order.shippingMethod].count++;
        byShippingMethod[order.shippingMethod].revenue += order.total;
      });

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        byStatus,
        byShippingMethod
      };
    } catch (error) {
      logger.error('Error getting order stats:', error);
      throw error;
    }
  }
} 