import request from 'supertest';
import app from '../../app';
import { Sale, PaymentStatus, PaymentMethod } from '../../models/Sale';
import { Product } from '../../models/Product';
import { Customer } from '../../models/Customer';
import { User, UserRole } from '../../models/User';

describe('Sale Controller', () => {
  let adminToken: string;
  let userToken: string;
  let testProduct: any;
  let testCustomer: any;

  const testSaleData = {
    items: [
      {
        quantity: 2,
        price: 99.99,
        discount: 0
      }
    ],
    payments: [
      {
        method: 'CREDIT_CARD',
        amount: 199.98,
        reference: 'REF123'
      }
    ],
    subtotal: 199.98,
    discount: 0,
    tax: 0,
    total: 199.98
  };

  beforeAll(async () => {
    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 100,
      minStock: 10,
      category: 'Test Category',
      sku: 'TEST-123',
      barcode: '123456789'
    });

    // Create test customer
    testCustomer = await Customer.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '1234567890'
    });

    // Update test sale data with product and customer IDs
    testSaleData.items[0].product = testProduct._id;
    testSaleData.customer = testCustomer._id;
  });

  beforeEach(async () => {
    // Reset product stock
    await Product.findByIdAndUpdate(testProduct._id, { stock: 100 });
  });

  describe('POST /api/sales', () => {
    it('should create a new sale when valid data is provided', async () => {
      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${global.userToken}`)
        .send(testSaleData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.total).toBe(testSaleData.total);

      // Verify product stock was updated
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct?.stock).toBe(98); // 100 - 2

      // Verify customer purchase count was updated
      const updatedCustomer = await Customer.findById(testCustomer._id);
      expect(updatedCustomer?.totalPurchases).toBe(1);
    });

    it('should not create sale with insufficient stock', async () => {
      const insufficientStockSale = {
        ...testSaleData,
        items: [{
          ...testSaleData.items[0],
          quantity: 101 // More than available stock
        }]
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${global.userToken}`)
        .send(insufficientStockSale);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should validate required fields', async () => {
      const invalidSale = {
        items: [],
        payments: [],
        subtotal: -1,
        total: 0
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${global.userToken}`)
        .send(invalidSale);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'customer',
            message: expect.stringContaining('Customer ID is required')
          }),
          expect.objectContaining({
            field: 'items',
            message: expect.stringContaining('At least one item is required')
          }),
          expect.objectContaining({
            field: 'payments',
            message: expect.stringContaining('At least one payment is required')
          }),
          expect.objectContaining({
            field: 'subtotal',
            message: expect.stringContaining('must be a positive number')
          })
        ])
      );
    });

    it('should validate payment method', async () => {
      const invalidPaymentSale = {
        ...testSaleData,
        payments: [{
          method: 'INVALID_METHOD',
          amount: 199.98,
          reference: 'REF123'
        }]
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${global.userToken}`)
        .send(invalidPaymentSale);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'payments.*.method',
            message: expect.stringContaining('Invalid payment method')
          })
        ])
      );
    });
  });

  describe('GET /api/sales', () => {
    beforeEach(async () => {
      // Create some test sales
      await Sale.create(testSaleData);
    });

    it('should get all sales with pagination', async () => {
      const response = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter sales by date range', async () => {
      const response = await request(app)
        .get('/api/sales')
        .query({
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
          endDate: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should validate date format', async () => {
      const response = await request(app)
        .get('/api/sales')
        .query({
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'startDate',
            message: expect.stringContaining('must be a valid ISO date')
          }),
          expect.objectContaining({
            field: 'endDate',
            message: expect.stringContaining('must be a valid ISO date')
          })
        ])
      );
    });

    it('should validate numeric query parameters', async () => {
      const response = await request(app)
        .get('/api/sales')
        .query({
          minAmount: -100,
          maxAmount: 'invalid',
          page: 0,
          limit: 1000
        })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'minAmount',
            message: expect.stringContaining('must be a positive number')
          }),
          expect.objectContaining({
            field: 'maxAmount',
            message: expect.stringContaining('must be a positive number')
          }),
          expect.objectContaining({
            field: 'page',
            message: expect.stringContaining('must be a positive integer')
          }),
          expect.objectContaining({
            field: 'limit',
            message: expect.stringContaining('must be between 1 and 100')
          })
        ])
      );
    });
  });

  describe('PATCH /api/sales/:id/cancel', () => {
    let saleId: string;

    beforeEach(async () => {
      // Create a sale to cancel
      const sale = await Sale.create(testSaleData);
      saleId = sale._id.toString();
    });

    it('should cancel a sale and restore product stock', async () => {
      const response = await request(app)
        .patch(`/api/sales/${saleId}/cancel`)
        .set('Authorization', `Bearer ${global.userToken}`)
        .send({ reason: 'Customer request' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(PaymentStatus.CANCELLED);

      // Verify product stock was restored
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct?.stock).toBe(100);

      // Verify customer purchase count was decremented
      const updatedCustomer = await Customer.findById(testCustomer._id);
      expect(updatedCustomer?.totalPurchases).toBe(0);
    });

    it('should not cancel an already cancelled sale', async () => {
      // First cancel the sale
      await request(app)
        .patch(`/api/sales/${saleId}/cancel`)
        .set('Authorization', `Bearer ${global.userToken}`)
        .send({ reason: 'First cancellation' });

      // Try to cancel again
      const response = await request(app)
        .patch(`/api/sales/${saleId}/cancel`)
        .set('Authorization', `Bearer ${global.userToken}`)
        .send({ reason: 'Second cancellation' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already cancelled');
    });

    it('should validate cancellation reason', async () => {
      const response = await request(app)
        .patch(`/api/sales/${saleId}/cancel`)
        .set('Authorization', `Bearer ${global.userToken}`)
        .send({ reason: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'reason',
            message: expect.stringContaining('Cancellation reason is required')
          })
        ])
      );
    });

    it('should validate sale ID format', async () => {
      const response = await request(app)
        .patch('/api/sales/invalid-id/cancel')
        .set('Authorization', `Bearer ${global.userToken}`)
        .send({ reason: 'Test reason' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: expect.stringContaining('Sale ID must be valid')
          })
        ])
      );
    });
  });

  describe('GET /api/sales/stats', () => {
    beforeEach(async () => {
      // Create multiple sales for statistics
      await Sale.create([
        testSaleData,
        testSaleData,
        {
          ...testSaleData,
          status: PaymentStatus.CANCELLED
        }
      ]);
    });

    it('should get sales statistics', async () => {
      const response = await request(app)
        .get('/api/sales/stats')
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('paymentMethods');
      expect(response.body.data.summary.totalSales).toBe(2); // Excluding cancelled sale
    });

    it('should filter statistics by date range', async () => {
      const response = await request(app)
        .get('/api/sales/stats')
        .query({
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
          endDate: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalSales).toBe(2);
    });
  });

  describe('POST /api/sales/:id/payments', () => {
    let saleId: string;

    beforeEach(async () => {
      const sale = await Sale.create(testSaleData);
      saleId = sale._id.toString();
    });

    it('should validate payment data', async () => {
      const invalidPayment = {
        method: 'INVALID_METHOD',
        amount: -50,
        reference: ''
      };

      const response = await request(app)
        .post(`/api/sales/${saleId}/payments`)
        .set('Authorization', `Bearer ${global.userToken}`)
        .send(invalidPayment);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'method',
            message: expect.stringContaining('Invalid payment method')
          }),
          expect.objectContaining({
            field: 'amount',
            message: expect.stringContaining('must be greater than 0')
          })
        ])
      );
    });
  });
}); 