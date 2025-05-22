export interface Ingredient {
  id: string;
  name: string;
  unitCost: number;
  unitType: string;
  quantity: number;
  inventoryId: string;
}

export interface Recipe {
  id: string;
  name: string;
  steps: string[];
  preparationTime: number;
  yield: number;
  ingredients: Ingredient[];
}

export interface Product {
  id?: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  outOfStock: number;
  lowStock: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
  brands: Array<{
    name: string;
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  sku: string;
  barcode?: string;
  active: boolean;
  images: string[];
  lastStockUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}