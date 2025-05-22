import request from 'supertest';
import express from 'express';
import productRoutes from '../product.routes';
import { ProductController } from '../../controllers/product.controller';
import { createError } from '../../utils/error';

jest.mock('../../controllers/product.controller');

describe('Product Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/products', productRoutes);
  });

  describe('POST /products', () => {
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
      const mockProduct = { ...validProduct, id: 1, createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(ProductController.prototype, 'createProduct').mockImplementation(async (req, res, next) => {
        res.status(201).json(mockProduct);
      });

      const response = await request(app).post('/products').send(validProduct);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 400 for invalid product data', async () => {
      const invalidProduct = {
        name: 'Te', // Too short
        description: 'Test',
        price: -10,
      };

      const response = await request(app).post('/products').send(invalidProduct);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /products/:id', () => {
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
      jest.spyOn(ProductController.prototype, 'updateProduct').mockImplementation(async (req, res, next) => {
        res.json(mockProduct);
      });

      const response = await request(app).put('/products/1').send(validUpdate);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        name: 'Te', // Too short
      };

      const response = await request(app).put('/products/1').send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product successfully', async () => {
      jest.spyOn(ProductController.prototype, 'deleteProduct').mockImplementation(async (req, res, next) => {
        res.status(204).send();
      });

      const response = await request(app).delete('/products/1');

      expect(response.status).toBe(204);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).delete('/products/0');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /products/:id', () => {
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
      jest.spyOn(ProductController.prototype, 'getProduct').mockImplementation(async (req, res, next) => {
        res.json(mockProduct);
      });

      const response = await request(app).get('/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/products/0');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /products', () => {
    const mockResponse = {
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
      jest.spyOn(ProductController.prototype, 'getProducts').mockImplementation(async (req, res, next) => {
        res.json(mockResponse);
      });

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    it('should get products successfully with custom filter', async () => {
      jest.spyOn(ProductController.prototype, 'getProducts').mockImplementation(async (req, res, next) => {
        res.json(mockResponse);
      });

      const response = await request(app)
        .get('/products')
        .query({
          search: 'test',
          minPrice: 50,
          maxPrice: 100,
          categories: 'test,other',
          page: 1,
          limit: 10,
          sortBy: 'name',
          sortOrder: 'asc',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    it('should return 400 for invalid filter parameters', async () => {
      const response = await request(app)
        .get('/products')
        .query({
          search: 'te', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /products/:id/stock', () => {
    it('should update stock successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        stock: 15,
        // ... other fields
      };
      jest.spyOn(ProductController.prototype, 'updateStock').mockImplementation(async (req, res, next) => {
        res.json(mockProduct);
      });

      const response = await request(app).put('/products/1/stock').send({ quantity: 15 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app).put('/products/1/stock').send({ quantity: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /products/:id/images', () => {
    const images = ['image1.jpg', 'image2.jpg'];

    it('should add images successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        images: ['image1.jpg', 'image2.jpg'],
        // ... other fields
      };
      jest.spyOn(ProductController.prototype, 'addImages').mockImplementation(async (req, res, next) => {
        res.json(mockProduct);
      });

      const response = await request(app).post('/products/1/images').send({ images });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 400 for invalid images array', async () => {
      const response = await request(app).post('/products/1/images').send({ images: 'not an array' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /products/:id/images/:imageId', () => {
    it('should remove image successfully', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        images: ['image2.jpg'],
        // ... other fields
      };
      jest.spyOn(ProductController.prototype, 'removeImage').mockImplementation(async (req, res, next) => {
        res.json(mockProduct);
      });

      const response = await request(app).delete('/products/1/images/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should return 400 for invalid IDs', async () => {
      const response = await request(app).delete('/products/0/images/0');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 