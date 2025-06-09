import { IPayment } from '../../backend/src/models/Payment';
import { ISale } from '../types/sale';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import QRCode from 'qrcode';
import { ReceiptHistory } from '../../backend/src/models/ReceiptHistory';

interface ReceiptData {
  receiptNumber: string;
  saleDetails: {
    saleId: string;
    date: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
  };
  paymentDetails: {
    method: string;
    amount: number;
    reference?: string;
    date: string;
    processedBy: string;
  };
  company: {
    name: string;
    document: string;
    address: string;
  };
  qrCodeData?: string;
}

export class ReceiptService {
  private static instance: ReceiptService;
  private company = {
    name: 'ControlAI Vendas',
    document: '12.345.678/0001-90',
    address: 'Rua Exemplo, 123 - Centro, Cidade - UF'
  };

  private constructor() {}

  public static getInstance(): ReceiptService {
    if (!ReceiptService.instance) {
      ReceiptService.instance = new ReceiptService();
    }
    return ReceiptService.instance;
  }

  private async generateQRCode(payment: IPayment, receiptNumber: string): Promise<string> {
    const verificationData = {
      receiptNumber,
      paymentId: payment._id.toString(),
      saleId: payment.sale.toString(),
      amount: payment.amount,
      date: payment.transactionDate,
      verificationUrl: `https://controlai.com/verify/${receiptNumber}`
    };

    try {
      return await QRCode.toDataURL(JSON.stringify(verificationData));
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      return '';
    }
  }

  private generateReceiptNumber(payment: IPayment): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REC${year}${month}${random}`;
  }

  private formatPaymentMethod(method: string): string {
    const methods = {
      CASH: 'Dinheiro',
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      BANK_TRANSFER: 'Transferência Bancária',
      CHECK: 'Cheque'
    };
    return methods[method as keyof typeof methods] || method;
  }

  private async recordReceiptHistory(
    payment: IPayment,
    sale: ISale,
    receiptNumber: string,
    qrCodeData: string,
    filePath?: string,
    emailSentTo?: string
  ): Promise<void> {
    try {
      await ReceiptHistory.create({
        payment: payment._id,
        sale: sale._id,
        receiptNumber,
        generatedAt: new Date(),
        generatedBy: payment.processedBy,
        emailSentTo,
        emailSentAt: emailSentTo ? new Date() : undefined,
        qrCodeData,
        filePath
      });
    } catch (error) {
      console.error('Erro ao registrar histórico do recibo:', error);
    }
  }

  public async generateReceiptData(payment: IPayment, sale: ISale): Promise<ReceiptData> {
    // Garantir que os relacionamentos estão populados
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

    const receiptNumber = this.generateReceiptNumber(payment);
    const qrCodeData = await this.generateQRCode(payment, receiptNumber);

    // Registrar no histórico
    await this.recordReceiptHistory(payment, sale, receiptNumber, qrCodeData);

    return {
      receiptNumber,
      saleDetails: {
        saleId: sale._id.toString(),
        date: format(sale.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        customerName: (sale.customer as any).name,
        items: sale.items.map(item => ({
          name: (item.product as any).name,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        })),
        subtotal: sale.subtotal,
        discount: sale.discount,
        total: sale.total
      },
      paymentDetails: {
        method: this.formatPaymentMethod(payment.method),
        amount: payment.amount,
        reference: payment.reference,
        date: format(payment.transactionDate, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        processedBy: (payment.processedBy as any).name
      },
      company: this.company,
      qrCodeData
    };
  }

  public async generateHTMLReceipt(receiptData: ReceiptData): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recibo de Pagamento</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .receipt {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
              position: relative;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f5f5f5;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .qr-code {
              text-align: center;
              margin-top: 20px;
            }
            .qr-code img {
              width: 150px;
              height: 150px;
            }
            .verification-text {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>${receiptData.company.name}</h2>
              <p>CNPJ: ${receiptData.company.document}</p>
              <p>${receiptData.company.address}</p>
              <h1>Recibo de Pagamento</h1>
              <p>Nº ${receiptData.receiptNumber}</p>
            </div>

            <div class="section">
              <h3>Dados da Venda</h3>
              <p>Venda Nº: ${receiptData.saleDetails.saleId}</p>
              <p>Data: ${receiptData.saleDetails.date}</p>
              <p>Cliente: ${receiptData.saleDetails.customerName}</p>
            </div>

            <div class="section">
              <h3>Itens</h3>
              <table class="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${receiptData.saleDetails.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>R$ ${item.price.toFixed(2)}</td>
                      <td>R$ ${item.total.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-top: 10px;">
                <p>Subtotal: R$ ${receiptData.saleDetails.subtotal.toFixed(2)}</p>
                <p>Desconto: R$ ${receiptData.saleDetails.discount.toFixed(2)}</p>
                <p><strong>Total: R$ ${receiptData.saleDetails.total.toFixed(2)}</strong></p>
              </div>
            </div>

            <div class="section">
              <h3>Dados do Pagamento</h3>
              <p>Método: ${receiptData.paymentDetails.method}</p>
              <p>Valor: R$ ${receiptData.paymentDetails.amount.toFixed(2)}</p>
              ${receiptData.paymentDetails.reference ? 
                `<p>Referência: ${receiptData.paymentDetails.reference}</p>` : ''}
              <p>Data: ${receiptData.paymentDetails.date}</p>
              <p>Processado por: ${receiptData.paymentDetails.processedBy}</p>
            </div>

            <div class="footer">
              <div>
                <p>Este recibo é um documento comprobatório de pagamento.</p>
                <p>Emitido em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
              ${receiptData.qrCodeData ? `
                <div class="qr-code">
                  <img src="${receiptData.qrCodeData}" alt="QR Code de verificação" />
                  <p class="verification-text">Escaneie para verificar a autenticidade</p>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  public async generatePDFReceipt(payment: IPayment, sale: ISale): Promise<Buffer> {
    const receiptData = await this.generateReceiptData(payment, sale);
    const html = await this.generateHTMLReceipt(receiptData);
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      });
      
      return pdf;
    } finally {
      await browser.close();
    }
  }

  public async saveReceiptToFile(
    payment: IPayment, 
    sale: ISale, 
    outputDir: string,
    emailSentTo?: string
  ): Promise<string> {
    const pdf = await this.generatePDFReceipt(payment, sale);
    const receiptNumber = this.generateReceiptNumber(payment);
    const fileName = `recibo_${receiptNumber}.pdf`;
    const filePath = path.join(outputDir, fileName);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, pdf);

    // Registrar no histórico com o caminho do arquivo
    const qrCodeData = await this.generateQRCode(payment, receiptNumber);
    await this.recordReceiptHistory(payment, sale, receiptNumber, qrCodeData, filePath, emailSentTo);
    
    return filePath;
  }
} 