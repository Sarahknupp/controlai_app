import { BaseService } from './base.service';
import { Product, CreateProductDto, UpdateProductDto, ProductFilter } from '../types/product';
import { validateRequired, validateString, validateNumber, validateArray, validateObject } from '../utils/data';
import { createError } from '../utils/error';

export class ProductService extends BaseService {
  constructor() {
    super();
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    // Validate required fields
    validateRequired(data.name, 'name');
    validateRequired(data.description, 'description');
    validateRequired(data.price, 'price');
    validateRequired(data.stock, 'stock');

    // Validate field types and constraints
    validateString(data.name, 'name', { minLength: 3, maxLength: 100 });
    validateString(data.description, 'description', { minLength: 10, maxLength: 1000 });
    validateNumber(data.price, 'price', { min: 0 });
    validateNumber(data.stock, 'stock', { min: 0 });

    // Validate optional fields if present
    if (data.categories) {
      validateArray(data.categories, 'categories', { minLength: 1 });
    }

    if (data.images) {
      validateArray(data.images, 'images', { minLength: 1 });
    }

    if (data.specifications) {
      validateObject(data.specifications, 'specifications');
    }

    try {
      const response = await this.post<Product>('/products', data);
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao criar produto', error);
    }
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    // Validate ID
    validateNumber(id, 'id', { min: 1 });

    // Validate fields if present
    if (data.name !== undefined) {
      validateString(data.name, 'name', { minLength: 3, maxLength: 100 });
    }

    if (data.description !== undefined) {
      validateString(data.description, 'description', { minLength: 10, maxLength: 1000 });
    }

    if (data.price !== undefined) {
      validateNumber(data.price, 'price', { min: 0 });
    }

    if (data.stock !== undefined) {
      validateNumber(data.stock, 'stock', { min: 0 });
    }

    if (data.categories !== undefined) {
      validateArray(data.categories, 'categories', { minLength: 1 });
    }

    if (data.images !== undefined) {
      validateArray(data.images, 'images', { minLength: 1 });
    }

    if (data.specifications !== undefined) {
      validateObject(data.specifications, 'specifications');
    }

    try {
      const response = await this.put<Product>(`/products/${id}`, data);
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao atualizar produto', error);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    // Validate ID
    validateNumber(id, 'id', { min: 1 });

    try {
      await this.delete(`/products/${id}`);
    } catch (error) {
      throw createError(500, 'Erro ao excluir produto', error);
    }
  }

  async getProduct(id: number): Promise<Product> {
    // Validate ID
    validateNumber(id, 'id', { min: 1 });

    try {
      const response = await this.get<Product>(`/products/${id}`);
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao buscar produto', error);
    }
  }

  async getProducts(filter: ProductFilter): Promise<{ data: Product[]; total: number }> {
    // Validate filter fields if present
    if (filter.search !== undefined) {
      validateString(filter.search, 'search', { minLength: 3 });
    }

    if (filter.minPrice !== undefined) {
      validateNumber(filter.minPrice, 'minPrice', { min: 0 });
    }

    if (filter.maxPrice !== undefined) {
      validateNumber(filter.maxPrice, 'maxPrice', { min: 0 });
    }

    if (filter.categories !== undefined) {
      validateArray(filter.categories, 'categories', { minLength: 1 });
    }

    if (filter.page !== undefined) {
      validateNumber(filter.page, 'page', { min: 1 });
    }

    if (filter.limit !== undefined) {
      validateNumber(filter.limit, 'limit', { min: 1, max: 100 });
    }

    try {
      const response = await this.get<{ data: Product[]; total: number }>('/products', { params: filter });
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao buscar produtos', error);
    }
  }

  async updateStock(id: number, quantity: number): Promise<Product> {
    // Validate ID and quantity
    validateNumber(id, 'id', { min: 1 });
    validateNumber(quantity, 'quantity');

    try {
      const response = await this.put<Product>(`/products/${id}/stock`, { quantity });
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao atualizar estoque', error);
    }
  }

  async addImages(id: number, images: string[]): Promise<Product> {
    // Validate ID and images
    validateNumber(id, 'id', { min: 1 });
    validateArray(images, 'images', { minLength: 1 });

    try {
      const response = await this.post<Product>(`/products/${id}/images`, { images });
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao adicionar imagens', error);
    }
  }

  async removeImage(id: number, imageId: number): Promise<Product> {
    // Validate IDs
    validateNumber(id, 'id', { min: 1 });
    validateNumber(imageId, 'imageId', { min: 1 });

    try {
      const response = await this.delete<Product>(`/products/${id}/images/${imageId}`);
      return response;
    } catch (error) {
      throw createError(500, 'Erro ao remover imagem', error);
    }
  }
} 