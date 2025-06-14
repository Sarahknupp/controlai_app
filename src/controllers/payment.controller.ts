import { Request, Response } from 'express';
import { Payment } from '../../backend/src/models/Payment';
import { Sale } from '../../backend/src/models/Sale';
import { PaymentStatus, ISale } from '../types/sale';
import { ReceiptService } from '../services/receipt.service';
import { EmailService } from '../services/email.service';
import { ReceiptHistory } from '../../backend/src/models/ReceiptHistory';
import path from 'path';

// @desc    Processar novo pagamento
// @route   POST /api/payments
// @access  Private
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { saleId, amount, method, reference, notes, sendEmail } = req.body;

    // Verificar se a venda existe
    const sale = await Sale.findById(saleId).populate('customer') as ISale;
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar se o valor do pagamento é válido
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor do pagamento deve ser maior que zero'
      });
    }

    // Criar o pagamento
    const payment = await Payment.create({
      sale: saleId,
      amount,
      method,
      reference,
      notes,
      processedBy: req.user._id,
      status: PaymentStatus.PAID
    });

    // Atualizar o status da venda
    const totalPaid = await Payment.aggregate([
      { $match: { sale: sale._id, status: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = totalPaid[0]?.total || 0;
    
    if (paidAmount >= sale.total) {
      sale.status = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      sale.status = PaymentStatus.PARTIALLY_PAID;
    }
    
    await sale.save();

    // Gerar recibo em PDF
    const receiptService = ReceiptService.getInstance();
    const receiptData = await receiptService.generateReceiptData(payment, sale);
    const receiptBuffer = await receiptService.generatePDFReceipt(payment, sale);

    // Salvar histórico do recibo
    const receiptHistory = await ReceiptHistory.create({
      payment: payment._id,
      sale: sale._id,
      receiptNumber: receiptData.receiptNumber,
      generatedAt: new Date(),
      generatedBy: req.user._id,
      qrCodeData: receiptData.qrCodeData,
      verificationUrl: `https://controlai.com/verify/${receiptData.receiptNumber}`,
      filePath: path.join('receipts', `${receiptData.receiptNumber}.pdf`)
    });

    // Enviar email se solicitado e se o cliente tiver email
    if (sendEmail && (sale.customer as any).email) {
      const emailService = EmailService.getInstance();
      const emailSent = await emailService.sendReceiptEmail(
        payment,
        sale,
        receiptData.receiptNumber,
        (sale.customer as any).email,
        receiptBuffer
      );

      if (emailSent) {
        receiptHistory.emailSentTo = (sale.customer as any).email;
        receiptHistory.emailSentAt = new Date();
        receiptHistory.emailStatus = 'sent';
      } else {
        receiptHistory.emailStatus = 'failed';
        receiptHistory.emailError = 'Failed to send email';
      }
      await receiptHistory.save();
    }

    // Retornar o pagamento com dados relacionados
    await payment.populate([
      { path: 'sale', select: 'total status' },
      { path: 'processedBy', select: 'name' }
    ]);

    // Enviar o PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment._id}.pdf`);
    return res.send(receiptBuffer);

  } catch (error: any) {
    console.error('Error processing payment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Gerar recibo de um pagamento existente
// @route   GET /api/payments/:id/receipt
// @access  Private
export const getPaymentReceipt = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    const sale = await Sale.findById(payment.sale).populate('customer');
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda relacionada não encontrada'
      });
    }

    // Check if receipt already exists
    const existingReceipt = await ReceiptHistory.findOne({ payment: payment._id });
    let receiptBuffer: Buffer;

    if (existingReceipt && existingReceipt.filePath) {
      try {
        receiptBuffer = await require('fs').promises.readFile(existingReceipt.filePath);
      } catch (error) {
        // If file not found, generate new receipt
        const receiptService = ReceiptService.getInstance();
        receiptBuffer = await receiptService.generatePDFReceipt(payment, sale);
      }
    } else {
      // Generate new receipt
      const receiptService = ReceiptService.getInstance();
      receiptBuffer = await receiptService.generatePDFReceipt(payment, sale);
    }

    // Enviar email se solicitado
    if (req.query.sendEmail === 'true' && (sale.customer as any).email) {
      const emailService = EmailService.getInstance();
      const emailSent = await emailService.sendReceiptEmail(
        payment,
        sale,
        (sale.customer as any).email,
        (sale.customer as any).name
      );

      if (!emailSent) {
        console.warn('Não foi possível enviar o email do recibo');
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${payment._id}.pdf`);
    res.send(receiptBuffer);

  } catch (error: any) {
    console.error('Error getting payment receipt:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Listar pagamentos de uma venda
// @route   GET /api/payments/sale/:saleId
// @access  Private
export const getSalePayments = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ sale: req.params.saleId })
      .populate('processedBy', 'name')
      .sort('-transactionDate');

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancelar pagamento
// @route   PATCH /api/payments/:id/cancel
// @access  Private/Admin
export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      return res.status(400).json({
        success: false,
        message: 'Pagamento já está cancelado'
      });
    }

    // Atualizar status do pagamento
    payment.status = PaymentStatus.CANCELLED;
    await payment.save();

    // Recalcular status da venda
    const sale = await Sale.findById(payment.sale);
    if (sale) {
      const totalPaid = await Payment.aggregate([
        { $match: { sale: sale._id, status: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const paidAmount = totalPaid[0]?.total || 0;
      
      if (paidAmount >= sale.total) {
        sale.status = PaymentStatus.PAID;
      } else if (paidAmount > 0) {
        sale.status = PaymentStatus.PARTIALLY_PAID;
      } else {
        sale.status = PaymentStatus.PENDING;
      }
      
      await sale.save();
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend receipt email
// @route   POST /api/payments/:id/resend-receipt
// @access  Private
export const resendReceiptEmail = async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const sale = await Sale.findById(payment.sale).populate('customer');
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Related sale not found'
      });
    }

    if (!(sale.customer as any).email) {
      return res.status(400).json({
        success: false,
        message: 'Customer has no email address'
      });
    }

    // Get or generate receipt
    const receiptService = ReceiptService.getInstance();
    const receiptData = await receiptService.generateReceiptData(payment, sale);
    const receiptBuffer = await receiptService.generatePDFReceipt(payment, sale);

    // Send email
    const emailService = EmailService.getInstance();
    const emailSent = await emailService.sendReceiptEmail(
      payment,
      sale,
      receiptData.receiptNumber,
      (sale.customer as any).email,
      receiptBuffer
    );

    // Update receipt history
    const receiptHistory = await ReceiptHistory.findOne({ payment: payment._id });
    if (receiptHistory) {
      receiptHistory.emailSentTo = (sale.customer as any).email;
      receiptHistory.emailSentAt = new Date();
      receiptHistory.emailStatus = emailSent ? 'sent' : 'failed';
      if (!emailSent) {
        receiptHistory.emailError = 'Failed to resend email';
      }
      await receiptHistory.save();
    }

    res.json({
      success: true,
      data: {
        emailSent,
        receiptNumber: receiptData.receiptNumber
      }
    });

  } catch (error: any) {
    console.error('Error resending receipt email:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 