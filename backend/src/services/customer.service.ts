import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { AuditAction, EntityType } from '../types/audit';
import { Customer, CustomerResult, CustomerFilters } from '../types/customer';

export interface CustomerOrder {
  id: string;
  customerId: string;
  orderNumber: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  shippingAddress?: Customer['address'];
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerService {
  private customers: Map<string, Customer>;
  private orders: Map<string, CustomerOrder>;
  private auditService: AuditService;
  private notificationService: NotificationService;

  constructor() {
    this.customers = new Map();
    this.orders = new Map();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
  }

  async getCustomers(filters?: CustomerFilters): Promise<CustomerResult> {
    try {
      // TODO: Implement actual database query
      const customers: Customer[] = [];
      const total = customers.length;
      const page = 1;
      const limit = 10;

      return { customers, total, page, limit };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting customers:', error);
      throw new Error(`Failed to get customers: ${errorMessage}`);
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      // TODO: Implement actual database query
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting customer by id:', error);
      throw new Error(`Failed to get customer: ${errorMessage}`);
    }
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      // TODO: Implement actual database query
      const newCustomer: Customer = {
        ...customer,
        id: 'temp-id',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.CUSTOMER,
        entityId: newCustomer.id,
        userId: 'system',
        details: 'Created new customer',
        status: 'success'
      });

      return newCustomer;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${errorMessage}`);
    }
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      // TODO: Implement actual database query
      const updatedCustomer: Customer = {
        id,
        name: 'temp-name',
        email: 'temp@email.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.CUSTOMER,
        entityId: id,
        userId: 'system',
        details: 'Updated customer',
        status: 'success'
      });

      return updatedCustomer;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${errorMessage}`);
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      // TODO: Implement actual database query
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.CUSTOMER,
        entityId: id,
        userId: 'system',
        details: 'Deleted customer',
        status: 'success'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${errorMessage}`);
    }
  }

  async createOrder(data: Omit<CustomerOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerOrder> {
    try {
      const customer = this.customers.get(data.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${data.customerId}`);
      }

      const order: CustomerOrder = {
        id: uuidv4(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.orders.set(order.id, order);

      // Log the order creation
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
    status: CustomerOrder['status']
  ): Promise<CustomerOrder> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const customer = this.customers.get(order.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${order.customerId}`);
      }

      const updatedOrder: CustomerOrder = {
        ...order,
        status,
        updatedAt: new Date()
      };

      this.orders.set(orderId, updatedOrder);

      // Log the order status update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.ORDER,
        entityId: orderId,
        userId: 'system',
        details: `Updated order ${order.orderNumber} status to ${status}`,
        status: 'success'
      });

      // Send status update notification if enabled
      if (customer.preferences?.notifications) {
        await this.notificationService.sendUserNotification(
          customer.id,
          'Order Status Update',
          `Your order ${order.orderNumber} status has been updated to ${status}.`
        );
      }

      return updatedOrder;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  async getCustomerOrders(
    customerId: string,
    filters: {
      status?: CustomerOrder['status'];
      startDate?: Date;
      endDate?: Date;
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: CustomerOrder[]; total: number; page: number; limit: number }> {
    try {
      let filteredOrders = Array.from(this.orders.values())
        .filter(order => order.customerId === customerId);

      // Apply filters
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      if (filters.startDate) {
        filteredOrders = filteredOrders.filter(order => order.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredOrders = filteredOrders.filter(order => order.createdAt <= filters.endDate!);
      }

      // Sort by creation date (newest first)
      filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        total: filteredOrders.length,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error getting customer orders:', error);
      throw error;
    }
  }

  async getCustomerStats(customerId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  }> {
    try {
      const customerOrders = Array.from(this.orders.values())
        .filter(order => order.customerId === customerId && order.status === 'COMPLETED');

      const totalOrders = customerOrders.length;
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = customerOrders.length > 0
        ? new Date(Math.max(...customerOrders.map(order => order.createdAt.getTime())))
        : undefined;

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate
      };
    } catch (error) {
      logger.error('Error getting customer stats:', error);
      throw error;
    }
  }
} 