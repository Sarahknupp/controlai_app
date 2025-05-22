import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from './Payment';
import { ISale } from '../types/sale';

export interface IReceiptHistory extends Document {
  payment: mongoose.Types.ObjectId | IPayment;
  sale: mongoose.Types.ObjectId | ISale;
  receiptNumber: string;
  generatedAt: Date;
  generatedBy: mongoose.Types.ObjectId;
  qrCodeData: string;
  verificationUrl: string;
  filePath?: string;
  emailSentTo?: string;
  emailSentAt?: Date;
  emailStatus?: 'sent' | 'failed' | 'pending';
  emailError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptHistorySchema = new Schema({
  payment: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: [true, 'Payment reference is required']
  },
  sale: {
    type: Schema.Types.ObjectId,
    ref: 'Sale',
    required: [true, 'Sale reference is required']
  },
  receiptNumber: {
    type: String,
    required: [true, 'Receipt number is required'],
    unique: true,
    trim: true
  },
  generatedAt: {
    type: Date,
    required: [true, 'Generation date is required'],
    default: Date.now
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who generated the receipt is required']
  },
  qrCodeData: {
    type: String,
    required: [true, 'QR code data is required']
  },
  verificationUrl: {
    type: String,
    required: [true, 'Verification URL is required']
  },
  filePath: {
    type: String,
    trim: true
  },
  emailSentTo: {
    type: String,
    trim: true
  },
  emailSentAt: {
    type: Date
  },
  emailStatus: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  emailError: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para melhor performance em consultas
ReceiptHistorySchema.index({ receiptNumber: 1 }, { unique: true });
ReceiptHistorySchema.index({ payment: 1 });
ReceiptHistorySchema.index({ sale: 1 });
ReceiptHistorySchema.index({ generatedAt: -1 });
ReceiptHistorySchema.index({ emailSentTo: 1, emailSentAt: -1 });

export const ReceiptHistory = mongoose.model<IReceiptHistory>('ReceiptHistory', ReceiptHistorySchema); 