import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { CustomerService } from './customer.service';
import { AuditAction, EntityType } from '../types/audit';
import { PaymentGatewayService, PaymentGatewayConfig } from './payment-gateway.service';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  PIX = 'PIX',
  WALLET = 'WALLET',
  BOLETO = 'BOLETO'
}

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  paymentDetails: {
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
    bankAccount?: string;
    bankCode?: string;
    pixKey?: string;
    walletId?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentFilters {
  orderId?: string;
  customerId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentResult {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

export class PaymentService {
  private payments: Map<string, Payment>;
  private refunds: Map<string, Refund>;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private customerService: CustomerService;
  private gatewayService: PaymentGatewayService;

  constructor(config: PaymentGatewayConfig) {
    this.payments = new Map();
    this.refunds = new Map();
    this.auditService = new AuditService();
    this.notificationService = new NotificationService();
    this.customerService = new CustomerService();
    this.gatewayService = new PaymentGatewayService(config);
  }

  async processPayment(data: Omit<Payment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    try {
      // Validate payment method
      const isValid = await this.gatewayService.validatePaymentMethod(
        data.method,
        data.paymentDetails
      );

      if (!isValid) {
        throw new Error('Invalid payment method details');
      }

      // Process payment through gateway
      const gatewayResponse = await this.gatewayService.processPayment({
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        description: `Payment for order ${data.orderId}`,
        customer: {
          id: data.customerId,
          name: 'Customer Name', // TODO: Get from customer service
          email: 'customer@email.com' // TODO: Get from customer service
        },
        paymentDetails: data.paymentDetails,
        metadata: {
          orderId: data.orderId
        }
      });

      if (!gatewayResponse.success) {
        throw new Error(gatewayResponse.message || 'Payment processing failed');
      }

      const payment: Payment = {
        id: uuidv4(),
        ...data,
        status: gatewayResponse.status,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.payments.set(payment.id, payment);

      // Log payment creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.PAYMENT,
        entityId: payment.id,
        userId: 'system',
        details: `Processed payment for order ${payment.orderId}`,
        status: 'success'
      });

      // Send notification if payment is successful
      if (payment.status === PaymentStatus.COMPLETED) {
        await this.notificationService.sendUserNotification(
          payment.customerId,
          'Payment Successful',
          `Your payment of ${payment.amount} ${payment.currency} has been processed successfully.`
        );
      }

      return payment;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing payment:', error);
      throw new Error(`Failed to process payment: ${errorMessage}`);
    }
  }

  private async processPaymentByMethod(payment: Payment): Promise<void> {
    switch (payment.method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        await this.processCardPayment(payment);
        break;
      case 'BANK_TRANSFER':
        await this.processBankTransfer(payment);
        break;
      case 'PIX':
        await this.processPixPayment(payment);
        break;
      case 'BOLETO':
        await this.processBoletoPayment(payment);
        break;
      case 'CASH':
        // Cash payments are typically handled in person
        break;
      default:
        throw new Error(`Unsupported payment method: ${payment.method}`);
    }
  }

  private async processCardPayment(payment: Payment): Promise<void> {
    // Implement card payment processing logic
    // This would typically integrate with a payment gateway
    logger.info(`Processing card payment for order ${payment.orderId}`);
  }

  private async processBankTransfer(payment: Payment): Promise<void> {
    // Implement bank transfer processing logic
    logger.info(`Processing bank transfer for order ${payment.orderId}`);
  }

  private async processPixPayment(payment: Payment): Promise<void> {
    // Implement PIX payment processing logic
    logger.info(`Processing PIX payment for order ${payment.orderId}`);
  }

  private async processBoletoPayment(payment: Payment): Promise<void> {
    // Implement Boleto payment processing logic
    logger.info(`Processing Boleto payment for order ${payment.orderId}`);
  }

  async getPayment(id: string): Promise<Payment | null> {
    try {
      const payment = this.payments.get(id);
      return payment || null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting payment:', error);
      throw new Error(`Failed to get payment: ${errorMessage}`);
    }
  }

  async getPayments(filters?: PaymentFilters): Promise<PaymentResult> {
    try {
      let filteredPayments = Array.from(this.payments.values());

      if (filters) {
        if (filters.orderId) {
          filteredPayments = filteredPayments.filter(p => p.orderId === filters.orderId);
        }
        if (filters.customerId) {
          filteredPayments = filteredPayments.filter(p => p.customerId === filters.customerId);
        }
        if (filters.status) {
          filteredPayments = filteredPayments.filter(p => p.status === filters.status);
        }
        if (filters.method) {
          filteredPayments = filteredPayments.filter(p => p.method === filters.method);
        }
        if (filters.startDate) {
          filteredPayments = filteredPayments.filter(p => p.createdAt >= filters.startDate!);
        }
        if (filters.endDate) {
          filteredPayments = filteredPayments.filter(p => p.createdAt <= filters.endDate!);
        }
        if (filters.minAmount) {
          filteredPayments = filteredPayments.filter(p => p.amount >= filters.minAmount!);
        }
        if (filters.maxAmount) {
          filteredPayments = filteredPayments.filter(p => p.amount <= filters.maxAmount!);
        }
      }

      const total = filteredPayments.length;
      const page = 1;
      const limit = 10;

      return {
        payments: filteredPayments,
        total,
        page,
        limit
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting payments:', error);
      throw new Error(`Failed to get payments: ${errorMessage}`);
    }
  }

  async processRefund(
    paymentId: string,
    amount: number,
    reason: string
  ): Promise<Payment> {
    try {
      const payment = this.payments.get(paymentId);
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error(`Cannot refund payment with status: ${payment.status}`);
      }

      if (amount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      // Process refund through gateway
      const gatewayResponse = await this.gatewayService.processRefund(
        paymentId,
        amount,
        reason
      );

      if (!gatewayResponse.success) {
        throw new Error(gatewayResponse.message || 'Refund processing failed');
      }

      payment.status = PaymentStatus.REFUNDED;
      payment.updatedAt = new Date();

      // Log refund
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.PAYMENT,
        entityId: paymentId,
        userId: 'system',
        details: `Processed refund for payment ${paymentId}: ${reason}`,
        status: 'success'
      });

      // Send notification
      await this.notificationService.sendUserNotification(
        payment.customerId,
        'Payment Refunded',
        `Your payment of ${amount} ${payment.currency} has been refunded.`
      );

      return payment;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing refund:', error);
      throw new Error(`Failed to process refund: ${errorMessage}`);
    }
  }

  async cancelPayment(paymentId: string, reason: string): Promise<Payment> {
    try {
      const payment = this.payments.get(paymentId);
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new Error(`Cannot cancel payment with status: ${payment.status}`);
      }

      payment.status = PaymentStatus.CANCELLED;
      payment.updatedAt = new Date();

      // Log cancellation
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.PAYMENT,
        entityId: paymentId,
        userId: 'system',
        details: `Cancelled payment ${paymentId}: ${reason}`,
        status: 'success'
      });

      return payment;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error cancelling payment:', error);
      throw new Error(`Failed to cancel payment: ${errorMessage}`);
    }
  }

  async getRefunds(
    filters: {
      paymentId?: string;
      status?: Refund['status'];
      startDate?: Date;
      endDate?: Date;
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ refunds: Refund[]; total: number; page: number; limit: number }> {
    try {
      let filteredRefunds = Array.from(this.refunds.values());

      // Apply filters
      if (filters.paymentId) {
        filteredRefunds = filteredRefunds.filter(r => r.paymentId === filters.paymentId);
      }
      if (filters.status) {
        filteredRefunds = filteredRefunds.filter(r => r.status === filters.status);
      }
      if (filters.startDate) {
        filteredRefunds = filteredRefunds.filter(r => r.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredRefunds = filteredRefunds.filter(r => r.createdAt <= filters.endDate!);
      }

      // Sort by creation date (newest first)
      filteredRefunds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRefunds = filteredRefunds.slice(startIndex, endIndex);

      return {
        refunds: paginatedRefunds,
        total: filteredRefunds.length,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error getting refunds:', error);
      throw error;
    }
  }

  async getPaymentStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    byStatus: Record<PaymentStatus, { count: number; amount: number }>;
    byMethod: Record<PaymentMethod, { count: number; amount: number }>;
  }> {
    try {
      const payments = Array.from(this.payments.values())
        .filter(p => p.createdAt >= startDate && p.createdAt <= endDate);

      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

      const byStatus: Record<PaymentStatus, { count: number; amount: number }> = {} as any;
      const byMethod: Record<PaymentMethod, { count: number; amount: number }> = {} as any;

      payments.forEach(payment => {
        // Aggregate by status
        if (!byStatus[payment.status]) {
          byStatus[payment.status] = { count: 0, amount: 0 };
        }
        byStatus[payment.status].count++;
        byStatus[payment.status].amount += payment.amount;

        // Aggregate by method
        if (!byMethod[payment.method]) {
          byMethod[payment.method] = { count: 0, amount: 0 };
        }
        byMethod[payment.method].count++;
        byMethod[payment.method].amount += payment.amount;
      });

      return {
        totalPayments,
        totalAmount,
        averageAmount,
        byStatus,
        byMethod
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting payment stats:', error);
      throw new Error(`Failed to get payment stats: ${errorMessage}`);
    }
  }
} 