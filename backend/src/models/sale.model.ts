import mongoose, { Document, Schema } from 'mongoose';

export interface ISale extends Document {
  customerId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix';
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit', 'debit', 'pix'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
saleSchema.index({ customerId: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ createdAt: 1 });
saleSchema.index({ 'items.productId': 1 });

export const Sale = mongoose.model<ISale>('Sale', saleSchema); 