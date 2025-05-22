import request from 'supertest';
import app from '../../app';
import { User, UserRole } from '../../models/User';
import { Product } from '../../models/Product';

describe('Product Controller', () => {
  let adminToken: string;
  let userToken: string;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: UserRole.ADMIN
  };

  const regularUser = {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'User123!',
    role: UserRole.USER
  };

  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 100,
    minStock: 10,
    category: 'Test Category',
    sku: 'TEST-123',
    barcode: '123456789'
  };

  beforeAll(async () => {
    // Create and login admin user
    await User.create(adminUser);
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      });
    adminToken = adminResponse.body.data.token;

    // Create and login regular user
    await User.create(regularUser);
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: regularUser.email,
        password: regularUser.password
      });
    userToken = userResponse.body.data.token;
  });

  describe('POST /api/products', () => {
    it('should create a new product when admin token is provided', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(testProduct.name);
    });

    it('should not create product without admin token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(testProduct);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test product
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testProduct);
    });

    it('should get all products with valid token', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter products by search term', async () => {
      const response = await request(app)
        .get('/api/products?search=Test Product')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe(testProduct.name);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Test Category')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].category).toBe(testProduct.category);
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    let productId: string;

    beforeEach(async () => {
      // Create test product
      const product = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testProduct);

      productId = product.body.data._id;
    });

    it('should update stock when valid data is provided', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 50,
          operation: 'add'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stock).toBe(testProduct.stock + 50);
    });

    it('should not allow stock to go negative', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: testProduct.stock + 1,
          operation: 'subtract'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/low-stock', () => {
    beforeEach(async () => {
      // Create product with low stock
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...testProduct,
          stock: 5,
          minStock: 10
        });
    });

    it('should get low stock products', async () => {
      const response = await request(app)
        .get('/api/products/low-stock')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].stock).toBeLessThanOrEqual(response.body.data[0].minStock);
    });
  });
}); 