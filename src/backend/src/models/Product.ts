/**
 * Product model for the ControlAI Sales System
 * @module models/Product
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing a product category
 * @interface ProductCategory
 */
export interface ProductCategory {
  /** Unique identifier for the category */
  id: string;
  /** Name of the category */
  name: string;
  /** Optional description of the category */
  description?: string;
}

/**
 * Interface representing a product document in MongoDB
 * @interface ProductDocument
 * @extends Document
 */
export interface ProductDocument extends Document {
  /** Name of the product */
  name: string;
  /** Description of the product */
  description: string;
  /** SKU (Stock Keeping Unit) code */
  sku: string;
  /** Barcode (EAN/UPC) */
  barcode?: string;
  /** Product price */
  price: number;
  /** Cost price */
  costPrice: number;
  /** Current stock quantity */
  stockQuantity: number;
  /** Minimum stock level */
  minimumStock: number;
  /** Unit of measurement */
  unit: string;
  /** Product category */
  category: ProductCategory;
  /** Whether the product is active */
  isActive: boolean;
  /** Creation date */
  createdAt: Date;
  /** Last update date */
  updatedAt: Date;
  /** Product images URLs */
  images: string[];
  /** Tax information */
  tax: {
    /** Tax rate percentage */
    rate: number;
    /** Tax code */
    code: string;
  };
}

interface IProductMethods {
  isLowStock(): boolean;
  updateStock(quantity: number): Promise<void>;
}

type ProductModel = Model<ProductDocument, {}, IProductMethods>;

/**
 * Product schema definition
 * @const {Schema}
 */
const productSchema = new Schema<ProductDocument, ProductModel, IProductMethods>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Product description cannot exceed 500 characters'],
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'SKU cannot exceed 50 characters'],
  },
  barcode: {
    type: String,
    trim: true,
    maxlength: [50, 'Barcode cannot exceed 50 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    default: 0,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['un', 'kg', 'g', 'l', 'ml'],
  },
  category: {
    id: {
      type: String,
      required: [true, 'Category ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
    },
    description: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  images: [{
    type: String,
    validate: {
      validator: (v: string) => /^https?:\/\/.+/.test(v),
      message: 'Invalid image URL',
    },
  }],
  tax: {
    rate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
    code: {
      type: String,
      required: [true, 'Tax code is required'],
      trim: true,
    },
  },
}, {
  timestamps: true,
  versionKey: false,
});

/**
 * Index definitions for optimized queries
 */
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ barcode: 1 }, { sparse: true });
productSchema.index({ 'category.id': 1 });
productSchema.index({ isActive: 1 });

/**
 * Virtual field for profit margin calculation
 * @returns {number} Profit margin percentage
 */
productSchema.virtual('profitMargin').get(function(this: ProductDocument): number {
  return ((this.price - this.costPrice) / this.price) * 100;
});

/**
 * Method to check if stock is low
 * @returns {boolean} Whether the stock is below minimum level
 */
productSchema.method('isLowStock', function(): boolean {
  return this.stockQuantity <= this.minimumStock;
});

/**
 * Method to update stock
 * @param {number} quantity - The quantity to add to the stock
 * @returns {Promise<void>}
 */
productSchema.method('updateStock', async function(quantity: number): Promise<void> {
  const newStock = this.stockQuantity + quantity;
  if (newStock < 0) {
    throw new Error('Estoque insuficiente');
  }
  this.stockQuantity = newStock;
  await this.save();
});

/**
 * Pre-save middleware to validate price and cost
 */
productSchema.pre('save', function(next) {
  if (this.costPrice > this.price) {
    next(new Error('Cost price cannot be greater than selling price'));
  }
  if (this.stockQuantity < 0) {
    next(new Error('Stock quantity cannot be negative'));
  }
  next();
});

/**
 * Product model
 * @const {Model<ProductDocument>}
 */
export const Product = mongoose.model<ProductDocument, ProductModel>('Product', productSchema); 