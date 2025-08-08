import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  method: string;
  status: string;
  date: Date;
}

const PaymentSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema); 