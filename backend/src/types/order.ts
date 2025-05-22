export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFilters {
  customerId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
}

export interface OrderResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
} 