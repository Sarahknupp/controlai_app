import nodemailer from 'nodemailer';
import { IPayment } from '../../backend/src/models/Payment';
import { ISale } from '../types/sale';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async generateEmailTemplate(payment: IPayment, sale: ISale, receiptNumber: string): Promise<string> {
    await payment.populate([
      { path: 'processedBy', select: 'name' },
      { 
        path: 'sale',
        populate: [
          { path: 'customer', select: 'name' },
          { path: 'items.product', select: 'name price' }
        ]
      }
    ]);

    const items = sale.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${(item.product as any).name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">R$ ${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recibo de Pagamento - ControlAI Vendas</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0;">
              <img src="https://controlai.com/logo.png" alt="ControlAI Logo" style="max-width: 200px; margin-bottom: 10px;">
              <h1 style="color: #2c3e50; margin: 0;">Recibo de Pagamento</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Nº ${receiptNumber}</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Sale Details -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Detalhes da Venda</h2>
                <p><strong>Venda Nº:</strong> ${sale._id}</p>
                <p><strong>Data:</strong> ${format(sale.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                <p><strong>Cliente:</strong> ${(sale.customer as any).name}</p>
              </div>

              <!-- Items Table -->
              <div style="margin-bottom: 30px; overflow-x: auto;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Itens</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <thead>
                    <tr style="background-color: #f8f9fa;">
                      <th style="padding: 12px; text-align: left;">Item</th>
                      <th style="padding: 12px; text-align: center;">Qtd</th>
                      <th style="padding: 12px; text-align: right;">Preço Unit.</th>
                      <th style="padding: 12px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items}
                  </tbody>
                </table>

                <!-- Totals -->
                <div style="margin-top: 20px; text-align: right;">
                  <p style="margin: 5px 0;"><strong>Subtotal:</strong> R$ ${sale.subtotal.toFixed(2)}</p>
                  <p style="margin: 5px 0;"><strong>Desconto:</strong> R$ ${sale.discount.toFixed(2)}</p>
                  <p style="margin: 5px 0; font-size: 1.2em; color: #2c3e50;"><strong>Total:</strong> R$ ${sale.total.toFixed(2)}</p>
                </div>
              </div>

              <!-- Payment Details -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px;">Dados do Pagamento</h2>
                <p><strong>Método:</strong> ${payment.method}</p>
                <p><strong>Valor:</strong> R$ ${payment.amount.toFixed(2)}</p>
                <p><strong>Data:</strong> ${format(payment.transactionDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                <p><strong>Processado por:</strong> ${(payment.processedBy as any).name}</p>
              </div>

              <!-- Verification Link -->
              <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0; color: #7f8c8d;">Para verificar a autenticidade deste recibo, acesse:</p>
                <a href="https://controlai.com/verify/${receiptNumber}" style="color: #3498db; text-decoration: none; font-weight: bold;">
                  https://controlai.com/verify/${receiptNumber}
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
              <p>Este é um recibo eletrônico gerado automaticamente pelo sistema ControlAI Vendas.</p>
              <p>CNPJ: 12.345.678/0001-90</p>
              <p>&copy; ${new Date().getFullYear()} ControlAI Vendas. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  public async sendReceiptEmail(
    payment: IPayment,
    sale: ISale,
    receiptNumber: string,
    recipientEmail: string,
    pdfAttachment: Buffer
  ): Promise<boolean> {
    try {
      const emailContent = await this.generateEmailTemplate(payment, sale, receiptNumber);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"ControlAI Vendas" <vendas@controlai.com>',
        to: recipientEmail,
        subject: `Recibo de Pagamento #${receiptNumber}`,
        html: emailContent,
        attachments: [
          {
            filename: `recibo-${receiptNumber}.pdf`,
            content: pdfAttachment,
            contentType: 'application/pdf'
          }
        ]
      });

      return true;
    } catch (error) {
      console.error('Error sending receipt email:', error);
      return false;
    }
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Error verifying email connection:', error);
      return false;
    }
  }
} 