import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../types/sale';

export interface IPayment extends Document {
  sale: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  transactionDate: Date;
  processedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema({
  sale: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
    required: [true, 'Venda relacionada é obrigatória']
  },
  amount: {
    type: Number,
    required: [true, 'Valor do pagamento é obrigatório'],
    min: [0, 'Valor do pagamento deve ser maior que zero']
  },
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: [true, 'Método de pagamento é obrigatório']
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  reference: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário que processou o pagamento é obrigatório']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance em consultas
PaymentSchema.index({ sale: 1, transactionDate: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ method: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema); 