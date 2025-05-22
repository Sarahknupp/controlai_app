import mongoose from 'mongoose';

export interface IProduct {
  name: string;
  description: string;
  price: number;
  cost: number;
  barcode?: string;
  sku: string;
  stock: number;
  minStock: number;
  category: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  cost: {
    type: Number,
    required: [true, 'Custo é obrigatório'],
    min: [0, 'Custo não pode ser negativo']
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU é obrigatório'],
    unique: true,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Estoque é obrigatório'],
    default: 0,
    min: [0, 'Estoque não pode ser negativo']
  },
  minStock: {
    type: Number,
    required: [true, 'Estoque mínimo é obrigatório'],
    default: 1,
    min: [0, 'Estoque mínimo não pode ser negativo']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das buscas
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ barcode: 1 }, { unique: true, sparse: true });

export const Product = mongoose.model<IProduct>('Product', productSchema); 