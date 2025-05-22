import nodemailer from 'nodemailer';
import { compile } from 'handlebars';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { Sale, ISale } from '../models/sale.model';
import { Customer, ICustomer } from '../models/customer.model';
import { Product, IProduct } from '../models/product.model';
import { PDFService } from './pdf.service';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ReportType } from '../types/report';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

export interface ReportNotificationOptions {
  to: string[];
  reportType: ReportType;
  reportName: string;
  attachment: {
    filename: string;
    content: Buffer;
  };
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  template?: string;
  context?: Record<string, any>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private pdfService: PDFService;
  private templatesDir: string;
  private auditService: AuditService;
  private defaultFrom: string;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    });

    this.pdfService = new PDFService();
    this.templatesDir = path.join(process.cwd(), 'templates', 'email');
    this.ensureTemplatesDirectory();
    this.auditService = new AuditService();
    this.defaultFrom = config.from;
  }

  private ensureTemplatesDirectory(): void {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log successful email
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.EMAIL,
        entityId: info.messageId,
        userId: 'system',
        details: `Sent email to ${options.to}`,
        status: 'success'
      });

      logger.info('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending email:', error);

      // Log failed email
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.EMAIL,
        entityId: 'failed',
        userId: 'system',
        details: `Failed to send email to ${options.to}: ${errorMessage}`,
        status: 'error'
      });

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendTemplatedEmail(
    template: string,
    options: Omit<EmailOptions, 'html'> & {
      variables: Record<string, string>;
    }
  ): Promise<void> {
    try {
      // Load and process email template
      const html = await this.processTemplate(template, options.variables);

      await this.sendEmail({
        ...options,
        html
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error sending templated email:', error);
      throw new Error(`Failed to send templated email: ${errorMessage}`);
    }
  }

  private async processTemplate(
    template: string,
    variables: Record<string, string>
  ): Promise<string> {
    try {
      // TODO: Implement template processing logic
      // This could use a template engine like Handlebars or EJS
      let html = template;

      // Simple variable replacement for now
      Object.entries(variables).forEach(([key, value]) => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      return html;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing email template:', error);
      throw new Error(`Failed to process email template: ${errorMessage}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error verifying email connection:', error);
      return false;
    }
  }

  async sendReportNotification(options: ReportNotificationOptions): Promise<void> {
    const emailOptions: EmailOptions = {
      to: options.to,
      subject: `${options.reportType} Report: ${options.reportName}`,
      template: 'report_notification',
      context: {
        reportType: options.reportType,
        reportName: options.reportName,
        generatedAt: new Date().toLocaleString()
      },
      attachments: [{
        filename: options.attachment.filename,
        content: options.attachment.content
      }]
    };

    await this.sendEmail(emailOptions);
  }

  async sendErrorNotification(
    to: string | string[],
    error: Error,
    context: Record<string, any> = {}
  ): Promise<void> {
    const options: EmailOptions = {
      to,
      subject: 'System Error Notification',
      template: 'error_notification',
      context: {
        error: {
          message: error.message,
          stack: error.stack,
          ...context
        },
        timestamp: new Date().toLocaleString()
      }
    };

    await this.sendEmail(options);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const options: EmailOptions = {
      to,
      subject: 'Welcome to Our System',
      template: 'welcome',
      context: {
        name,
        loginUrl: process.env.APP_URL
      }
    };

    await this.sendEmail(options);
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const options: EmailOptions = {
      to,
      subject: 'Password Reset Request',
      template: 'password_reset',
      context: {
        resetUrl: `${process.env.APP_URL}/reset-password?token=${resetToken}`
      }
    };

    await this.sendEmail(options);
  }

  async sendSaleReceipt(sale: ISale, customer: ICustomer, products: IProduct[]): Promise<void> {
    try {
      const pdfBuffer = await this.pdfService.generateReport('sale_receipt', {
        sale,
        customer,
        products
      });

      const emailOptions: EmailOptions = {
        to: customer.email,
        subject: `Receipt for Sale #${sale._id}`,
        html: `
          <h1>Thank you for your purchase!</h1>
          <p>Dear ${customer.name},</p>
          <p>Please find attached the receipt for your recent purchase.</p>
          <p>Sale Details:</p>
          <ul>
            <li>Sale ID: ${sale._id}</li>
            <li>Date: ${formatDate(sale.createdAt)}</li>
            <li>Total: ${formatCurrency(sale.total)}</li>
            <li>Payment Method: ${sale.paymentMethod}</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>Your Store Team</p>
        `,
        attachments: [{
          filename: `receipt-${sale._id}.pdf`,
          content: pdfBuffer
        }]
      };

      await this.sendEmail(emailOptions);
    } catch (error) {
      logger.error('Error sending sale receipt:', error);
      throw error;
    }
  }

  async sendSalesReport(email: string, sales: ISale[], startDate?: Date, endDate?: Date): Promise<void> {
    try {
      const pdfBuffer = await this.pdfService.generateReport('sales', {
        sales,
        startDate,
        endDate
      });

      const emailOptions: EmailOptions = {
        to: email,
        subject: 'Sales Report',
        html: `
          <h1>Sales Report</h1>
          <p>Please find attached the sales report.</p>
          ${startDate && endDate
            ? `<p>Period: ${formatDate(startDate)} - ${formatDate(endDate)}</p>`
            : ''}
          <p>Total Sales: ${sales.length}</p>
          <p>Total Revenue: ${formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))}</p>
          <p>Best regards,<br>Your Store Team</p>
        `,
        attachments: [{
          filename: 'sales-report.pdf',
          content: pdfBuffer
        }]
      };

      await this.sendEmail(emailOptions);
    } catch (error) {
      logger.error('Error sending sales report:', error);
      throw error;
    }
  }

  async sendLowStockAlert(product: IProduct): Promise<void> {
    try {
      const emailOptions: EmailOptions = {
        to: process.env.ADMIN_EMAIL || '',
        subject: `Low Stock Alert: ${product.name}`,
        html: `
          <h1>Low Stock Alert</h1>
          <p>The following product is running low on stock:</p>
          <ul>
            <li>Product: ${product.name}</li>
            <li>SKU: ${product.sku}</li>
            <li>Current Stock: ${product.stock}</li>
            <li>Category: ${product.category}</li>
          </ul>
          <p>Please take necessary action to replenish the stock.</p>
        `
      };

      await this.sendEmail(emailOptions);
    } catch (error) {
      logger.error('Error sending low stock alert:', error);
      throw error;
    }
  }
} 