import { ICustomer } from '../models/Customer';
import { IUserDocument } from '../models/User';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PIX = 'PIX'
}

export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED'
}

export interface ISaleItem {
  product: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
  notes?: string;
}

export interface IPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  date: Date;
  processedBy: string | IUserDocument;
  installments?: number;
  notes?: string;
  status: PaymentStatus;
}

export interface ISale {
  _id: string;
  customer: string | ICustomer;
  seller: string | IUserDocument;
  items: ISaleItem[];
  payments: IPayment[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  installments?: number;
  cancelledAt?: Date;
  cancelledBy?: string | IUserDocument;
  cancellationReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSaleDto {
  customer: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
  paymentMethod: PaymentMethod;
  installments?: number;
  discount?: number;
  notes?: string;
}

export interface UpdateSaleDto {
  status?: SaleStatus;
  cancellationReason?: string;
  notes?: string;
}

export interface AddPaymentDto {
  amount: number;
  method: PaymentMethod;
  installments?: number;
  notes?: string;
}

export interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  customer?: string;
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface SaleResult {
  sales: ISale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 