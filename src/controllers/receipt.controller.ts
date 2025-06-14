import { Request, Response } from 'express';
import { ReceiptHistory } from '../../backend/src/models/ReceiptHistory';
import { Payment } from '../../backend/src/models/Payment';
import { Sale } from '../../backend/src/models/Sale';
import { ReceiptService } from '../services/ReceiptService';

// @desc    Listar histórico de recibos
// @route   GET /api/receipts
// @access  Private
export const getReceiptHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const emailSentTo = req.query.emailSentTo as string;

    // Construir query
    const query: any = {};
    
    if (startDate && endDate) {
      query.generatedAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (emailSentTo) {
      query.emailSentTo = emailSentTo;
    }

    // Executar query com paginação
    const [receipts, total] = await Promise.all([
      ReceiptHistory.find(query)
        .sort({ generatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate([
          { path: 'payment', select: 'amount method reference' },
          { path: 'sale', select: 'total status' },
          { path: 'generatedBy', select: 'name' }
        ]),
      ReceiptHistory.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: receipts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar recibo por número
// @route   GET /api/receipts/:number
// @access  Public
export const getReceiptByNumber = async (req: Request, res: Response) => {
  try {
    const receipt = await ReceiptHistory.findOne({ receiptNumber: req.params.number })
      .populate([
        { path: 'payment', select: 'amount method reference transactionDate' },
        { path: 'sale', select: 'total status createdAt' },
        { path: 'generatedBy', select: 'name' }
      ]);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Recibo não encontrado'
      });
    }

    res.json({
      success: true,
      data: receipt
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify receipt authenticity
// @route   GET /api/receipts/verify/:receiptNumber
// @access  Public
export const verifyReceipt = async (req: Request, res: Response) => {
  try {
    const { receiptNumber } = req.params;

    // Find receipt in history
    const receipt = await ReceiptHistory.findOne({ receiptNumber })
      .populate({
        path: 'payment',
        select: 'amount method transactionDate reference processedBy',
        populate: {
          path: 'processedBy',
          select: 'name'
        }
      })
      .populate({
        path: 'sale',
        select: 'items subtotal discount total createdAt customer',
        populate: {
          path: 'customer',
          select: 'name'
        }
      });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Format verification response
    const verificationData = {
      receiptNumber: receipt.receiptNumber,
      generatedAt: receipt.generatedAt,
      sale: {
        items: receipt.sale.items.map(item => ({
          name: (item.product as any).name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: receipt.sale.subtotal,
        discount: receipt.sale.discount,
        total: receipt.sale.total,
        date: receipt.sale.createdAt,
        customer: (receipt.sale.customer as any).name
      },
      payment: {
        method: receipt.payment.method,
        amount: receipt.payment.amount,
        date: receipt.payment.transactionDate,
        reference: receipt.payment.reference,
        processedBy: (receipt.payment.processedBy as any).name
      },
      qrCodeData: receipt.qrCodeData
    };

    res.json({
      success: true,
      data: verificationData
    });

  } catch (error: any) {
    console.error('Error verifying receipt:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get receipt statistics
// @route   GET /api/receipts/stats
// @access  Private
export const getReceiptStats = async (req: Request, res: Response) => {
  try {
    const stats = await ReceiptHistory.aggregate([
      {
        $facet: {
          totalReceipts: [{ $count: 'count' }],
          emailStats: [
            {
              $group: {
                _id: '$emailStatus',
                count: { $sum: 1 }
              }
            }
          ],
          dailyGeneration: [
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$generatedAt'
                  }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id': -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);

    const formattedStats = {
      totalReceipts: stats[0].totalReceipts[0]?.count || 0,
      emailStats: stats[0].emailStats.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      dailyGeneration: stats[0].dailyGeneration
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error: any) {
    console.error('Error getting receipt statistics:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download receipt PDF
// @route   GET /api/receipts/:number/download
// @access  Private
export const downloadReceipt = async (req: Request, res: Response) => {
  try {
    const receipt = await ReceiptHistory.findOne({ receiptNumber: req.params.number })
      .populate([
        { 
          path: 'payment',
          select: 'amount method reference transactionDate processedBy',
          populate: { path: 'processedBy', select: 'name' }
        },
        { 
          path: 'sale',
          select: 'items subtotal discount total createdAt customer',
          populate: { path: 'customer', select: 'name email' }
        }
      ]);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Recibo não encontrado'
      });
    }

    // Verificar se o arquivo existe
    if (receipt.filePath) {
      try {
        const fileBuffer = await require('fs').promises.readFile(receipt.filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
        return res.send(fileBuffer);
      } catch (error) {
        console.warn('Arquivo do recibo não encontrado, gerando novo PDF');
      }
    }

    // Se o arquivo não existe ou não foi encontrado, gerar novo PDF
    const receiptService = ReceiptService.getInstance();
    const pdfBuffer = await receiptService.generatePDFReceipt(receipt.payment, receipt.sale);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('Error downloading receipt:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 