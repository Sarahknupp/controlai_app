import { ICustomer } from '../models/Customer';
import { IUser } from '../models/User';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  PIX = 'PIX'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled'
}

export interface ISaleItem {
  product: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface IPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  date: Date;
  processedBy: string | IUser;
}

export interface ISale {
  _id: string;
  customer: string | ICustomer;
  seller: string | IUser;
  items: ISaleItem[];
  payments: IPayment[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  cancelledAt?: Date;
  cancelledBy?: string | IUser;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
} 