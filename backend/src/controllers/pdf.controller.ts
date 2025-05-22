import { Request, Response } from 'express';
import { PDFService } from '../services/pdf.service';
import { Sale } from '../models/sale.model';
import { Customer } from '../models/customer.model';
import { Product } from '../models/product.model';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger';

export class PDFController {
  private pdfService: PDFService;

  constructor() {
    this.pdfService = new PDFService();
  }

  async generateSaleReceipt(req: Request, res: Response) {
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

      const pdfBuffer = await this.pdfService.generateSaleReceipt(sale, customer, products);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sale-receipt-${saleId}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Error generating sale receipt:', error);
      throw new BadRequestError('Failed to generate sale receipt');
    }
  }

  async generateSalesReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const options = {
        title: 'Sales Report',
        subtitle: startDate && endDate
          ? `Period: ${new Date(startDate as string).toLocaleDateString()} - ${new Date(endDate as string).toLocaleDateString()}`
          : undefined,
        footer: `Generated on ${new Date().toLocaleDateString()}`,
        orientation: 'landscape' as const,
      };

      const query: any = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      const sales = await Sale.find(query)
        .sort({ createdAt: -1 })
        .populate('customerId', 'name');

      const pdfBuffer = await this.pdfService.generateSalesReport(sales, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Error generating sales report:', error);
      throw new BadRequestError('Failed to generate sales report');
    }
  }
} 