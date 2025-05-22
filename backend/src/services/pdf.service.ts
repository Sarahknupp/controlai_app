import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream/promises';
import { logger } from '../utils/logger';

export interface PDFOptions {
  content: Buffer;
  title: string;
  author: string;
  subject: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface ReportData {
  [key: string]: any;
}

interface Sale {
  _id: string;
  createdAt: Date;
  customer: {
    name: string;
  };
  total: number;
  status: string;
}

interface InventoryItem {
  name: string;
  category: string;
  quantity: number;
  price: number;
  status: string;
  minStock: number;
}

interface Customer {
  name: string;
  email: string;
  status: string;
  totalOrders: number;
  totalSpent: number;
}

interface FinancialItem {
  type: 'REVENUE' | 'EXPENSE';
  category: string;
  date: Date;
  amount: number;
  description: string;
  status: string;
}

interface SaleReceipt {
  _id: string;
  createdAt: Date;
  paymentMethod: string;
  total: number;
}

interface Product {
  name: string;
  quantity: number;
  price: number;
}

export class PDFService {
  private pdfDir: string;
  private defaultOptions: PDFOptions = {
    content: Buffer.from(''),
    title: 'Report',
    author: 'System',
    subject: 'Generated Report',
    includeHeader: true,
    includeFooter: true,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  };

  constructor() {
    this.pdfDir = path.join(process.cwd(), 'reports', 'pdf');
    this.ensurePDFDirectory();
  }

  private ensurePDFDirectory(): void {
    if (!fs.existsSync(this.pdfDir)) {
      fs.mkdirSync(this.pdfDir, { recursive: true });
    }
  }

  async generateReport(type: string, data: ReportData): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add content based on report type
      switch (type) {
        case 'sales':
          this.addSalesContent(doc, data);
          break;
        case 'inventory':
          this.addInventoryContent(doc, data);
          break;
        case 'customer':
          this.addCustomerContent(doc, data);
          break;
        case 'financial':
          this.addFinancialContent(doc, data);
          break;
        case 'sale_receipt':
          this.addSaleReceiptContent(doc, data);
          break;
        default:
          throw new Error(`Unsupported report type: ${type}`);
      }

      doc.end();
    });
  }

  private addSalesContent(doc: PDFKit.PDFDocument, data: ReportData): void {
    const { sales, startDate, endDate } = data;

    // Add header
    doc
      .fontSize(20)
      .text('Sales Report', { align: 'center' })
      .moveDown();

    if (startDate && endDate) {
      doc
        .fontSize(12)
        .text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' })
        .moveDown();
    }

    // Add summary
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);

    doc
      .fontSize(14)
      .text('Summary')
      .moveDown()
      .fontSize(12)
      .text(`Total Sales: ${totalSales}`)
      .text(`Total Revenue: $${totalRevenue.toFixed(2)}`)
      .moveDown();

    // Add sales details
    doc
      .fontSize(14)
      .text('Sales Details')
      .moveDown();

    sales.forEach((sale: Sale, index: number) => {
      doc
        .fontSize(12)
        .text(`Sale #${index + 1}`)
        .fontSize(10)
        .text(`Date: ${sale.createdAt.toLocaleDateString()}`)
        .text(`Customer: ${sale.customer.name}`)
        .text(`Total: $${sale.total.toFixed(2)}`)
        .text(`Status: ${sale.status}`)
        .moveDown();
    });
  }

  private addInventoryContent(doc: PDFKit.PDFDocument, data: ReportData): void {
    const { inventory } = data;

    // Add header
    doc
      .fontSize(20)
      .text('Inventory Report', { align: 'center' })
      .moveDown();

    // Add summary
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum: number, item: InventoryItem) => sum + (item.price * item.quantity), 0);
    const lowStockItems = inventory.filter((item: InventoryItem) => item.quantity <= item.minStock).length;

    doc
      .fontSize(14)
      .text('Summary')
      .moveDown()
      .fontSize(12)
      .text(`Total Items: ${totalItems}`)
      .text(`Total Value: $${totalValue.toFixed(2)}`)
      .text(`Low Stock Items: ${lowStockItems}`)
      .moveDown();

    // Add inventory details
    doc
      .fontSize(14)
      .text('Inventory Details')
      .moveDown();

    inventory.forEach((item: InventoryItem) => {
      doc
        .fontSize(12)
        .text(item.name)
        .fontSize(10)
        .text(`Category: ${item.category}`)
        .text(`Quantity: ${item.quantity}`)
        .text(`Price: $${item.price.toFixed(2)}`)
        .text(`Status: ${item.status}`)
        .moveDown();
    });
  }

  private addCustomerContent(doc: PDFKit.PDFDocument, data: ReportData): void {
    const { customers } = data;

    // Add header
    doc
      .fontSize(20)
      .text('Customer Report', { align: 'center' })
      .moveDown();

    // Add summary
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c: Customer) => c.status === 'ACTIVE').length;

    doc
      .fontSize(14)
      .text('Summary')
      .moveDown()
      .fontSize(12)
      .text(`Total Customers: ${totalCustomers}`)
      .text(`Active Customers: ${activeCustomers}`)
      .moveDown();

    // Add customer details
    doc
      .fontSize(14)
      .text('Customer Details')
      .moveDown();

    customers.forEach((customer: Customer) => {
      doc
        .fontSize(12)
        .text(customer.name)
        .fontSize(10)
        .text(`Email: ${customer.email}`)
        .text(`Status: ${customer.status}`)
        .text(`Total Orders: ${customer.totalOrders}`)
        .text(`Total Spent: $${customer.totalSpent.toFixed(2)}`)
        .moveDown();
    });
  }

  private addFinancialContent(doc: PDFKit.PDFDocument, data: ReportData): void {
    const { financialData } = data;

    // Add header
    doc
      .fontSize(20)
      .text('Financial Report', { align: 'center' })
      .moveDown();

    // Add summary
    const totalRevenue = financialData
      .filter((item: FinancialItem) => item.type === 'REVENUE')
      .reduce((sum: number, item: FinancialItem) => sum + item.amount, 0);

    const totalExpenses = financialData
      .filter((item: FinancialItem) => item.type === 'EXPENSE')
      .reduce((sum: number, item: FinancialItem) => sum + item.amount, 0);

    const netIncome = totalRevenue - totalExpenses;

    doc
      .fontSize(14)
      .text('Summary')
      .moveDown()
      .fontSize(12)
      .text(`Total Revenue: $${totalRevenue.toFixed(2)}`)
      .text(`Total Expenses: $${totalExpenses.toFixed(2)}`)
      .text(`Net Income: $${netIncome.toFixed(2)}`)
      .moveDown();

    // Add transaction details
    doc
      .fontSize(14)
      .text('Transaction Details')
      .moveDown();

    financialData.forEach((item: FinancialItem) => {
      doc
        .fontSize(12)
        .text(`${item.type}: ${item.category}`)
        .fontSize(10)
        .text(`Date: ${item.date.toLocaleDateString()}`)
        .text(`Amount: $${item.amount.toFixed(2)}`)
        .text(`Description: ${item.description}`)
        .text(`Status: ${item.status}`)
        .moveDown();
    });
  }

  private addSaleReceiptContent(doc: PDFKit.PDFDocument, data: ReportData): void {
    const { sale, customer, products } = data;

    // Add header
    doc
      .fontSize(20)
      .text('Sale Receipt', { align: 'center' })
      .moveDown();

    // Add customer info
    doc
      .fontSize(14)
      .text('Customer Information')
      .moveDown()
      .fontSize(12)
      .text(`Name: ${customer.name}`)
      .text(`Email: ${customer.email}`)
      .moveDown();

    // Add sale details
    doc
      .fontSize(14)
      .text('Sale Details')
      .moveDown()
      .fontSize(12)
      .text(`Sale ID: ${sale._id}`)
      .text(`Date: ${sale.createdAt.toLocaleDateString()}`)
      .text(`Payment Method: ${sale.paymentMethod}`)
      .moveDown();

    // Add products
    doc
      .fontSize(14)
      .text('Products')
      .moveDown();

    products.forEach((product: Product) => {
      doc
        .fontSize(12)
        .text(product.name)
        .fontSize(10)
        .text(`Quantity: ${product.quantity}`)
        .text(`Price: $${product.price.toFixed(2)}`)
        .text(`Subtotal: $${(product.quantity * product.price).toFixed(2)}`)
        .moveDown();
    });

    // Add total
    doc
      .fontSize(14)
      .text(`Total: $${sale.total.toFixed(2)}`, { align: 'right' })
      .moveDown();

    // Add footer
    doc
      .fontSize(10)
      .text('Thank you for your purchase!', { align: 'center' })
      .text('Please keep this receipt for your records.', { align: 'center' });
  }

  async generatePDF(options: PDFOptions): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add content
      doc.text(options.content.toString());

      doc.end();
    });
  }
} 