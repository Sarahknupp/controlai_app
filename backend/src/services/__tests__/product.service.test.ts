import { ProductService } from '../product.service';
import { createError } from '../../utils/error';
import { mockProductRepository, mockProduct } from '../../__mocks__/repositories/product.repository';

jest.mock('../../repositories/product.repository', () => ({
  ProductRepository: jest.fn(() => mockProductRepository),
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const validProduct = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 99.99,
      stock: 10,
      categories: ['test'],
      images: ['image1.jpg'],
      specifications: {
        color: 'red',
        size: 'medium',
      },
    };

    it('should create a product successfully', async () => {
      mockProductRepository.create.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(validProduct);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(validProduct);
    });

    it('should throw error when required fields are missing', async () => {
      const invalidProduct = {
        name: 'Test Product',
        // Missing required fields
      };

      await expect(productService.createProduct(invalidProduct as any)).rejects.toThrow(
        createError(400, 'O campo description é obrigatório')
      );
    });

    it('should throw error when string fields have invalid length', async () => {
      const invalidProduct = {
        ...validProduct,
        name: 'Te', // Too short
      };

      await expect(productService.createProduct(invalidProduct)).rejects.toThrow(
        createError(400, 'O campo name deve ter no mínimo 3 caracteres')
      );
    });

    it('should throw error when number fields are negative', async () => {
      const invalidProduct = {
        ...validProduct,
        price: -10,
      };

      await expect(productService.createProduct(invalidProduct)).rejects.toThrow(
        createError(400, 'O campo price deve ser maior ou igual a 0')
      );
    });
  });

  describe('updateProduct', () => {
    const validUpdate = {
      name: 'Updated Product',
      price: 149.99,
    };

    it('should update a product successfully', async () => {
      const updatedProduct = { ...mockProduct, ...validUpdate };
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct(1, validUpdate);

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepository.update).toHaveBeenCalledWith(1, validUpdate);
    });

    it('should throw error when ID is invalid', async () => {
      await expect(productService.updateProduct(0, validUpdate)).rejects.toThrow(
        createError(400, 'O campo id deve ser maior ou igual a 1')
      );
    });

    it('should throw error when update data is invalid', async () => {
      const invalidUpdate = {
        name: 'Te', // Too short
      };

      await expect(productService.updateProduct(1, invalidUpdate)).rejects.toThrow(
        createError(400, 'O campo name deve ter no mínimo 3 caracteres')
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockProductRepository.delete.mockResolvedValue(undefined);

      await productService.deleteProduct(1);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error when ID is invalid', async () => {
      await expect(productService.deleteProduct(0)).rejects.toThrow(
        createError(400, 'O campo id deve ser maior ou igual a 1')
      );
    });
  });

  describe('getProduct', () => {
    it('should get a product successfully', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProduct(1);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when ID is invalid', async () => {
      await expect(productService.getProduct(0)).rejects.toThrow(
        createError(400, 'O campo id deve ser maior ou igual a 1')
      );
    });
  });

  describe('getProducts', () => {
    const mockResponse = {
      data: [mockProduct],
      total: 1,
    };

    it('should get products successfully with default filter', async () => {
      mockProductRepository.findAll.mockResolvedValue(mockResponse);

      const result = await productService.getProducts({});

      expect(result).toEqual(mockResponse);
      expect(mockProductRepository.findAll).toHaveBeenCalledWith({});
    });

    it('should get products successfully with custom filter', async () => {
      const filter = {
        search: 'test',
        minPrice: 50,
        maxPrice: 100,
        categories: ['test'],
        page: 1,
        limit: 10,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
      };

      mockProductRepository.findAll.mockResolvedValue(mockResponse);

      const result = await productService.getProducts(filter);

      expect(result).toEqual(mockResponse);
      expect(mockProductRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should throw error when search term is too short', async () => {
      const filter = {
        search: 'te',
      };

      await expect(productService.getProducts(filter)).rejects.toThrow(
        createError(400, 'O campo search deve ter no mínimo 3 caracteres')
      );
    });

    it('should throw error when price range is invalid', async () => {
      const filter = {
        minPrice: -10,
      };

      await expect(productService.getProducts(filter)).rejects.toThrow(
        createError(400, 'O campo minPrice deve ser maior ou igual a 0')
      );
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const mockResponse = {
        id: 1,
        name: 'Test Product',
        stock: 15,
        // ... other fields
      };
      jest.spyOn(productService as any, 'put').mockResolvedValue(mockResponse);

      const result = await productService.updateStock(1, 15);

      expect(result).toEqual(mockResponse);
      expect(productService.put).toHaveBeenCalledWith('/products/1/stock', { quantity: 15 });
    });

    it('should throw error when ID is invalid', async () => {
      await expect(productService.updateStock(0, 15)).rejects.toThrow(
        createError(400, 'O campo id deve ser maior ou igual a 1')
      );
    });
  });

  describe('addImages', () => {
    const images = ['image1.jpg', 'image2.jpg'];

    it('should add images successfully', async () => {
      const mockResponse = {
        id: 1,
        name: 'Test Product',
        images: ['image1.jpg', 'image2.jpg'],
        // ... other fields
      };
      jest.spyOn(productService as any, 'post').mockResolvedValue(mockResponse);

      const result = await productService.addImages(1, images);

      expect(result).toEqual(mockResponse);
      expect(productService.post).toHaveBeenCalledWith('/products/1/images', { images });
    });

    it('should throw error when ID is invalid', async () => {
      await expect(productService.addImages(0, images)).rejects.toThrow(
        createError(400, 'O campo id deve ser maior ou igual a 1')
      );
    });

    it('should throw error when images array is empty', async () => {
      await expect(productService.addImages(1, [])).rejects.toThrow(
        createError(400, 'O campo images deve ter no mínimo 1 item')
      );
    });
  });

  describe('removeImage', () => {
    it('should remove image successfully', async () => {
      const mockResponse = {
        id: 1,
        name: 'Test Product',
        images: ['image2.jpg'],
        // ... other fields
      };
      jest.spyOn(productService as any, 'delete').mockResolvedValue(mockResponse);

      const result = await productService.removeImage(1, 1);

      expect(result).toEqual(mockResponse);
      expect(productService.delete).toHaveBeenCalledWith('/products/1/images/1');
    });

    it('should throw error when product ID is invalid', async () => {
      await expect(productService.removeImage(0, 1)).rejects.toThrow(
        createError(400, 'O campo id deve ser maior ou igual a 1')
      );
    });

    it('should throw error when image ID is invalid', async () => {
      await expect(productService.removeImage(1, 0)).rejects.toThrow(
        createError(400, 'O campo imageId deve ser maior ou igual a 1')
      );
    });
  });
}); 