import { IProduct } from '../../types/product';

export const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockProductRepository = {
  findById: jest.fn().mockResolvedValue(mockProduct),
  findAll: jest.fn().mockResolvedValue([mockProduct]),
  create: jest.fn().mockResolvedValue(mockProduct),
  update: jest.fn().mockResolvedValue(mockProduct),
  delete: jest.fn().mockResolvedValue(true),
  findByCategory: jest.fn().mockResolvedValue([mockProduct]),
  updateStock: jest.fn().mockResolvedValue(mockProduct)
};

export const ProductRepository = jest.fn(() => mockProductRepository); 