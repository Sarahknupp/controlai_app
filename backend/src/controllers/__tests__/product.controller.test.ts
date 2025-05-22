import { Request, Response, NextFunction } from 'express';
import { ProductController } from '../product.controller';
import { ProductService } from '../../services/product.service';
import { createError } from '../../utils/error';

jest.mock('../../services/product.service');

describe('ProductController', () => {
  let productController: ProductController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    productController = new ProductController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('createProduct', () => {
    const validProduct = {
      name: 'Test Product',
      description: 'Test description',
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
      const mockProduct = { ...validProduct, id: 1, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(ProductService.prototype, 'createProduct').mockResolvedValue(mockProduct);

      mockRequest.body = validProduct;

      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle errors', async () => {
      const error = createError(400, 'Invalid product data');
      jest.spyOn(ProductService.prototype, 'createProduct').mockRejectedValue(error);

      mockRequest.body = validProduct;

      await productController.createProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    const validUpdate = {
      name: 'Updated Product',
      price: 149.99,
    };

    it('should update a product successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Updated Product',
        description: 'Original description',
        price: 149.99,
        stock: 10,
        categories: ['test'],
        images: ['image1.jpg'],
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(ProductService.prototype, 'updateProduct').mockResolvedValue(mockProduct);

      mockRequest.params = { id: '1' };
      mockRequest.body = validUpdate;

      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle errors', async () => {
      const error = createError(404, 'Product not found');
      jest.spyOn(ProductService.prototype, 'updateProduct').mockRejectedValue(error);

      mockRequest.params = { id: '1' };
      mockRequest.body = validUpdate;

      await productController.updateProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      jest.spyOn(ProductService.prototype, 'deleteProduct').mockResolvedValue();

      mockRequest.params = { id: '1' };

      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = createError(404, 'Product not found');
      jest.spyOn(ProductService.prototype, 'deleteProduct').mockRejectedValue(error);

      mockRequest.params = { id: '1' };

      await productController.deleteProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getProduct', () => {
    const mockProduct = {
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

    it('should get a product successfully', async () => {
      jest.spyOn(ProductService.prototype, 'getProduct').mockResolvedValue(mockProduct);

      mockRequest.params = { id: '1' };

      await productController.getProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle errors', async () => {
      const error = createError(404, 'Product not found');
      jest.spyOn(ProductService.prototype, 'getProduct').mockRejectedValue(error);

      mockRequest.params = { id: '1' };

      await productController.getProduct(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getProducts', () => {
    const mockProductsResponse = {
      data: [
        {
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
        },
      ],
      total: 1,
    };

    it('should get products successfully with default filter', async () => {
      jest.spyOn(ProductService.prototype, 'getProducts').mockResolvedValue(mockProductsResponse);

      mockRequest.query = {};

      await productController.getProducts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProductsResponse);
    });

    it('should get products successfully with custom filter', async () => {
      jest.spyOn(ProductService.prototype, 'getProducts').mockResolvedValue(mockProductsResponse);

      mockRequest.query = {
        search: 'test',
        minPrice: '50',
        maxPrice: '100',
        categories: 'test,other',
        page: '1',
        limit: '10',
        sortBy: 'name',
        sortOrder: 'asc',
      };

      await productController.getProducts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProductsResponse);
    });

    it('should handle errors', async () => {
      const error = createError(400, 'Invalid filter parameters');
      jest.spyOn(ProductService.prototype, 'getProducts').mockRejectedValue(error);

      mockRequest.query = {};

      await productController.getProducts(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stock: 15,
        categories: ['test'],
        images: ['image1.jpg'],
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(ProductService.prototype, 'updateStock').mockResolvedValue(mockProduct);

      mockRequest.params = { id: '1' };
      mockRequest.body = { quantity: 15 };

      await productController.updateStock(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle invalid quantity', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { quantity: 'invalid' };

      await productController.updateStock(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A quantidade deve ser um número válido',
          status: 400,
        })
      );
    });

    it('should handle errors', async () => {
      const error = createError(404, 'Product not found');
      jest.spyOn(ProductService.prototype, 'updateStock').mockRejectedValue(error);

      mockRequest.params = { id: '1' };
      mockRequest.body = { quantity: 15 };

      await productController.updateStock(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('addImages', () => {
    const images = ['image1.jpg', 'image2.jpg'];

    it('should add images successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stock: 10,
        categories: ['test'],
        images: ['image1.jpg', 'image2.jpg'],
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(ProductService.prototype, 'addImages').mockResolvedValue(mockProduct);

      mockRequest.params = { id: '1' };
      mockRequest.body = { images };

      await productController.addImages(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle invalid images array', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { images: 'not an array' };

      await productController.addImages(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'O campo images deve ser um array',
          status: 400,
        })
      );
    });

    it('should handle errors', async () => {
      const error = createError(404, 'Product not found');
      jest.spyOn(ProductService.prototype, 'addImages').mockRejectedValue(error);

      mockRequest.params = { id: '1' };
      mockRequest.body = { images };

      await productController.addImages(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('removeImage', () => {
    it('should remove image successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        stock: 10,
        categories: ['test'],
        images: ['image2.jpg'],
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(ProductService.prototype, 'removeImage').mockResolvedValue(mockProduct);

      mockRequest.params = { id: '1', imageId: '1' };

      await productController.removeImage(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle errors', async () => {
      const error = createError(404, 'Product or image not found');
      jest.spyOn(ProductService.prototype, 'removeImage').mockRejectedValue(error);

      mockRequest.params = { id: '1', imageId: '1' };

      await productController.removeImage(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
}); 