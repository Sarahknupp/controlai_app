export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  notes?: string;
}

export interface CustomerFilters {
  search?: string;
  email?: string;
  document?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'totalPurchases';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerResult {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  averageOrderValue: number;
  orderFrequency: number;
}

export interface CustomerLifetimeValue {
  customerId: string;
  name: string;
  totalRevenue: number;
  averageOrderValue: number;
  orderFrequency: number;
  lastOrder?: Date;
  segment?: string;
  lifetimeValue: number;
}

export interface CustomerPurchaseHistory {
  customerId: string;
  purchases: {
    id: string;
    date: Date;
    total: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    items: {
      product: string;
      quantity: number;
      price: number;
    }[];
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 