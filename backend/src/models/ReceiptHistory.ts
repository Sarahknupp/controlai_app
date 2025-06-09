import mongoose, { Schema, Document } from 'mongoose';

export interface IReceiptHistory extends Document {
  receiptId: string;
  action: string;
  timestamp: Date;
}

const ReceiptHistorySchema: Schema = new Schema({
  receiptId: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const ReceiptHistory = mongoose.model<IReceiptHistory>('ReceiptHistory', ReceiptHistorySchema); 