import { IProduct } from '../../types/product';

export const mockProductRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateStock: jest.fn(),
  addImages: jest.fn(),
  removeImage: jest.fn(),
};

export const mockProduct: IProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test description',
  price: 99.99,
  stock: 10,
  categories: ['test'],
  images: ['image1.jpg'],
  specifications: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default mockProductRepository; 