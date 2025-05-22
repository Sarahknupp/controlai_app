import { Sale, ISale } from '../models/sale.model';
import { Customer, ICustomer } from '../models/customer.model';
import { Product, IProduct } from '../models/product.model';
import { PDFService } from './pdf.service';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { EntityType, AuditAction } from '../types/audit';
import logger from '../utils/logger';
import { formatCurrency, formatDate } from '../utils/formatters';

export class ReceiptService {
  private pdfService: PDFService;
  private emailService: EmailService;
  private auditService: AuditService;

  constructor() {
    this.pdfService = new PDFService();
    this.emailService = new EmailService();
    this.auditService = new AuditService();
  }

  async generateReceipt(saleId: string, userId: string): Promise<Buffer> {
    try {
      const sale = await Sale.findById(saleId)
        .populate('customerId')
        .populate('items.productId');

      if (!sale) {
        throw new Error('Sale not found');
      }

      const customer = sale.customerId as ICustomer;
      const products = sale.items.map(item => item.productId as IProduct);

      const pdfBuffer = await this.pdfService.generateSaleReceipt(sale, customer, products);

      await this.auditService.logAction({
        action: AuditAction.GENERATE,
        entityType: EntityType.RECEIPT,
        entityId: saleId,
        userId,
        details: `Generated receipt for sale ${saleId}`,
        status: 'success'
      });

      return pdfBuffer;
    } catch (error) {
      logger.error('Error generating receipt:', error);
      await this.auditService.logAction({
        action: AuditAction.GENERATE,
        entityType: EntityType.RECEIPT,
        entityId: saleId,
        userId,
        details: `Failed to generate receipt for sale ${saleId}`,
        status: 'error'
      });
      throw error;
    }
  }

  async sendReceipt(saleId: string, userId: string): Promise<void> {
    try {
      const sale = await Sale.findById(saleId)
        .populate('customerId')
        .populate('items.productId');

      if (!sale) {
        throw new Error('Sale not found');
      }

      const customer = sale.customerId as ICustomer;
      const products = sale.items.map(item => item.productId as IProduct);

      await this.emailService.sendSaleReceipt(sale, customer, products);

      await this.auditService.logAction({
        action: AuditAction.SEND,
        entityType: EntityType.RECEIPT,
        entityId: saleId,
        userId,
        details: `Sent receipt for sale ${saleId} to ${customer.email}`,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error sending receipt:', error);
      await this.auditService.logAction({
        action: AuditAction.SEND,
        entityType: EntityType.RECEIPT,
        entityId: saleId,
        userId,
        details: `Failed to send receipt for sale ${saleId}`,
        status: 'error'
      });
      throw error;
    }
  }

  async getReceiptHistory(saleId: string): Promise<any[]> {
    try {
      const auditLogs = await this.auditService.getAuditLogs({
        entityType: EntityType.RECEIPT,
        entityId: saleId
      });

      return auditLogs.map(log => ({
        action: log.action,
        timestamp: log.timestamp,
        status: log.status,
        details: log.details
      }));
    } catch (error) {
      logger.error('Error getting receipt history:', error);
      throw error;
    }
  }
} 