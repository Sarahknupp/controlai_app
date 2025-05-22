import mongoose, { Document, Schema } from 'mongoose';
import { ISale } from './Sale';

export interface IAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  document: string;  // CPF/CNPJ
  type: 'individual' | 'company';
  addresses: IAddress[];
  active: boolean;
  totalPurchases: number;
  lastPurchase?: Date;
  notes?: string;
  creditLimit?: number;
  paymentTerms?: number;  // in days
  createdAt: Date;
  updatedAt: Date;
  purchases: ISale[];  // Virtual field type
}

const addressSchema = new Schema({
  street: {
    type: String,
    required: [true, 'Street is required'],
    trim: true
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
    trim: true
  },
  complement: {
    type: String,
    trim: true
  },
  neighborhood: {
    type: String,
    required: [true, 'Neighborhood is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 2
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const customerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  document: {
    type: String,
    required: [true, 'Document (CPF/CNPJ) is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['individual', 'company'],
    required: [true, 'Customer type is required']
  },
  addresses: [addressSchema],
  active: {
    type: Boolean,
    default: true
  },
  totalPurchases: {
    type: Number,
    default: 0,
    min: [0, 'Total purchases cannot be negative']
  },
  lastPurchase: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  creditLimit: {
    type: Number,
    min: [0, 'Credit limit cannot be negative']
  },
  paymentTerms: {
    type: Number,
    min: [0, 'Payment terms cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one default address
customerSchema.pre('save', function(next) {
  const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
  if (defaultAddresses.length > 1) {
    next(new Error('Only one default address is allowed'));
  }
  if (this.addresses.length > 0 && defaultAddresses.length === 0) {
    this.addresses[0].isDefault = true;
  }
  next();
});

// Index for improved search performance
customerSchema.index({ 
  name: 'text', 
  email: 1, 
  document: 1, 
  phone: 1 
});

// Virtual field for purchases with proper typing
customerSchema.virtual('purchases', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'customer',
  justOne: false
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema); 