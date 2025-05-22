export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFilters {
  search?: string;
  email?: string;
  document?: string;
  city?: string;
  state?: string;
}

export interface CustomerResult {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
}

export interface CustomerLifetimeValue {
  customerId: string;
  name: string;
  totalRevenue: number;
  averageOrderValue: number;
  orderFrequency: number;
  lastOrder?: Date;
} 