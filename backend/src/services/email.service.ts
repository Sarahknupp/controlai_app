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

    // Create default templates if they don't exist
    this.createDefaultTemplates();
  }

  private createDefaultTemplates(): void {
    const templates = {
      'email-verification': {
        subject: 'Verifique seu email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Verificação de Email</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h2>Verificação de Email</h2>
            <p>Olá,</p>
            <p>Obrigado por se cadastrar! Por favor, clique no botão abaixo para verificar seu email:</p>
            <a href="{{verificationUrl}}" class="button">Verificar Email</a>
            <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
            <p>{{verificationUrl}}</p>
            <p>Este link expirará em 24 horas.</p>
            <div class="footer">
              <p>Se você não solicitou esta verificação, por favor ignore este email.</p>
            </div>
          </body>
          </html>
        `
      },
      'password-reset': {
        subject: 'Recuperação de Senha',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Recuperação de Senha</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h2>Recuperação de Senha</h2>
            <p>Olá,</p>
            <p>Você solicitou a recuperação de senha. Clique no botão abaixo para redefinir sua senha:</p>
            <a href="{{resetUrl}}" class="button">Redefinir Senha</a>
            <p>Se o botão não funcionar, você pode copiar e colar o seguinte link no seu navegador:</p>
            <p>{{resetUrl}}</p>
            <p>Este link expirará em 10 minutos.</p>
            <div class="footer">
              <p>Se você não solicitou a recuperação de senha, por favor ignore este email.</p>
            </div>
          </body>
          </html>
        `
      }
    };

    Object.entries(templates).forEach(([name, template]) => {
      const templatePath = path.join(this.templatesDir, `${name}.html`);
      if (!fs.existsSync(templatePath)) {
        fs.writeFileSync(templatePath, template.html);
      }
    });
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
      const templatePath = path.join(this.templatesDir, `${template}.html`);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template ${template} not found`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = compile(templateContent);
      return compiledTemplate(variables);
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

  async sendEmailVerification(to: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await this.sendTemplatedEmail('email-verification', {
      to,
      subject: 'Verifique seu email',
      variables: {
        verificationUrl
      }
    });
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.sendTemplatedEmail('password-reset', {
      to,
      subject: 'Recuperação de Senha',
      variables: {
        resetUrl
      }
    });
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