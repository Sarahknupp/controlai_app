import mongoose from 'mongoose';

export interface ICustomer {
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new mongoose.Schema<ICustomer>({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true
  },
  document: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    number: {
      type: String,
      trim: true
    },
    complement: {
      type: String,
      trim: true
    },
    neighborhood: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das buscas
customerSchema.index({ name: 'text' });
customerSchema.index({ document: 1 }, { unique: true, sparse: true });
customerSchema.index({ email: 1 }, { unique: true, sparse: true });
customerSchema.index({ phone: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema); 