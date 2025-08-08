import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  sku: string;
  barcode?: string;
  active: boolean;
  images: string[];
  lastStockUpdate: Date;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost: {
    type: Number,
    required: [true, 'Product cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 5
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true
  },
  active: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: 'Image URL must be a valid URL'
    }
  }],
  lastStockUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for improved search performance
productSchema.index({ name: 'text', description: 'text', barcode: 1 });

// Pre-save middleware to update lastStockUpdate
productSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    this.lastStockUpdate = new Date();
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema); 