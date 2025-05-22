import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';
import { Sale } from '../models/sale.model';
import { Customer } from '../models/customer.model';
import { Product } from '../models/product.model';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

export class EmailController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async sendSaleReceipt(req: Request, res: Response) {
    try {
      const { saleId } = req.params;

      const sale = await Sale.findById(saleId);
      if (!sale) {
        throw new BadRequestError('Sale not found');
      }

      const customer = await Customer.findById(sale.customerId);
      if (!customer) {
        throw new BadRequestError('Customer not found');
      }

      const productIds = sale.items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });

      await this.emailService.sendSaleReceipt(sale, customer, products);

      res.json({ message: 'Sale receipt sent successfully' });
    } catch (error) {
      logger.error('Error sending sale receipt:', error);
      throw new BadRequestError('Failed to send sale receipt');
    }
  }

  async sendSalesReport(req: Request, res: Response) {
    try {
      const { email, startDate, endDate } = req.body;

      const query: any = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const sales = await Sale.find(query)
        .sort({ createdAt: -1 })
        .populate('customerId', 'name');

      await this.emailService.sendSalesReport(
        email,
        sales,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      res.json({ message: 'Sales report sent successfully' });
    } catch (error) {
      logger.error('Error sending sales report:', error);
      throw new BadRequestError('Failed to send sales report');
    }
  }

  async sendLowStockAlert(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId);
      if (!product) {
        throw new BadRequestError('Product not found');
      }

      await this.emailService.sendLowStockAlert(product);

      res.json({ message: 'Low stock alert sent successfully' });
    } catch (error) {
      logger.error('Error sending low stock alert:', error);
      throw new BadRequestError('Failed to send low stock alert');
    }
  }

  async sendPasswordReset(req: Request, res: Response) {
    try {
      const { email, resetToken } = req.body;

      await this.emailService.sendPasswordReset(email, resetToken);

      res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new BadRequestError('Failed to send password reset email');
    }
  }
} 