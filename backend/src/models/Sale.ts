import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product';
import { ICustomer } from './Customer';
import { IUser } from './User';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK'
}

export interface IPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  date: Date;
}

export interface ISaleItem {
  product: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  price: number;
  discount: number;
}

export interface ISale extends Document {
  customer: mongoose.Types.ObjectId | ICustomer;
  seller: mongoose.Types.ObjectId | IUser;
  items: ISaleItem[];
  payments: IPayment[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId | IUser;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  totalPaid: number; // Virtual
}

const SaleSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    }
  }],
  payments: [{
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: [true, 'Payment method is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0']
    },
    reference: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total payments with type safety
SaleSchema.virtual('totalPaid').get(function(this: ISale): number {
  return this.payments.reduce((total, payment) => total + payment.amount, 0);
});

// Update status based on payments with type safety
SaleSchema.pre('save', function(this: ISale, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.status !== PaymentStatus.CANCELLED) {
    const totalPaid = this.payments.reduce((total, payment) => total + payment.amount, 0);
    
    if (totalPaid >= this.total) {
      this.status = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      this.status = PaymentStatus.PARTIALLY_PAID;
    } else {
      this.status = PaymentStatus.PENDING;
    }
  }
  next();
});

// Index for improved search performance
SaleSchema.index({ 
  customer: 1, 
  seller: 1, 
  createdAt: -1, 
  status: 1 
});

export const Sale = mongoose.model<ISale>('Sale', SaleSchema); 