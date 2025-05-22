export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  categories?: string[];
  images?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categories?: string[];
  images?: string[];
  specifications?: Record<string, string>;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  createdAt: Date;
}

export interface StockMovementFilters {
  productId?: string;
  type?: 'IN' | 'OUT' | 'ADJUSTMENT';
  startDate?: Date;
  endDate?: Date;
}

export interface StockMovementResult {
  movements: StockMovement[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductStats {
  total: number;
  totalValue: number;
  averagePrice: number;
  lowStock: number;
  outOfStock: number;
  byCategory: Record<string, number>;
  byPriceRange: Record<string, number>;
} 