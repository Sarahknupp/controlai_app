import { Request, Response } from 'express';
import { Sale, ISale, PaymentStatus, IPayment, PaymentMethod } from '../models/Sale';
import { Product } from '../models/Product';
import { Customer } from '../models/Customer';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest<P = {}> extends Request<P> {
  user?: IUser;
}

interface SaleQuery {
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  customer?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

interface SaleStatsQuery {
  startDate?: string;
  endDate?: string;
}

interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
export const createSale = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer, items, payments, ...saleData } = req.body;

    // Validate stock availability and update product stock
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Create sale
    const sale = await Sale.create([{
      ...saleData,
      customer,
      items,
      payments,
      seller: req.user?._id,
      status: PaymentStatus.PENDING
    }], { session });

    // Update customer purchase history
    await Customer.findByIdAndUpdate(
      customer,
      {
        $inc: { totalPurchases: 1 },
        lastPurchase: new Date()
      },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: sale[0]
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
export const getSales = async (req: Request<{}, {}, {}, SaleQuery>, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      status,
      customer,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query: Record<string, any> = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    if (customer) {
      query.customer = new mongoose.Types.ObjectId(customer);
    }

    if (minAmount || maxAmount) {
      query.total = {};
      if (minAmount) query.total.$gte = Number(minAmount);
      if (maxAmount) query.total.$lte = Number(maxAmount);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sales = await Sale.find(query)
      .populate('customer', 'name email')
      .populate('seller', 'name')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Sale.countDocuments(query);

    res.json({
      success: true,
      count: sales.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: sales
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
export const getSale = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('seller', 'name')
      .populate('items.product', 'name price')
      .populate('cancelledBy', 'name');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel sale
// @route   PATCH /api/sales/:id/cancel
// @access  Private
export const cancelSale = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const sale = await Sale.findById(id);
    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status === PaymentStatus.CANCELLED) {
      throw new Error('Sale is already cancelled');
    }

    // Restore product stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Update customer purchase count
    await Customer.findByIdAndUpdate(
      sale.customer,
      { $inc: { totalPurchases: -1 } },
      { session }
    );

    // Cancel sale
    sale.status = PaymentStatus.CANCELLED;
    sale.cancelledAt = new Date();
    sale.cancelledBy = req.user?._id;
    sale.cancellationReason = reason;
    await sale.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Add payment to sale
// @route   POST /api/sales/:id/payments
// @access  Private
export const addPayment = async (req: Request<{ id: string }, {}, PaymentRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const payment: IPayment = {
      method: req.body.method,
      amount: req.body.amount,
      reference: req.body.reference,
      date: new Date()
    };

    const sale = await Sale.findById(id);
    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status === PaymentStatus.CANCELLED) {
      throw new Error('Cannot add payment to cancelled sale');
    }

    sale.payments.push(payment);
    await sale.save();

    res.json({
      success: true,
      data: sale
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Private
export const getSalesStats = async (req: Request<{}, {}, {}, SaleStatsQuery>, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const query: Record<string, any> = {
      status: { $ne: PaymentStatus.CANCELLED }
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageTicket: { $avg: '$total' },
          totalItems: { $sum: { $size: '$items' } }
        }
      }
    ]);

    const paymentMethods = await Sale.aggregate([
      { $match: query },
      { $unwind: '$payments' },
      {
        $group: {
          _id: '$payments.method',
          count: { $sum: 1 },
          total: { $sum: '$payments.amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalSales: 0,
          totalRevenue: 0,
          averageTicket: 0,
          totalItems: 0
        },
        paymentMethods
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 