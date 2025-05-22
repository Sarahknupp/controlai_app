import request from 'supertest';
import app from '../../app';
import { Customer } from '../../models/Customer';
import { Sale } from '../../models/Sale';

describe('Customer Controller', () => {
  const testCustomer = {
    name: 'Test Customer',
    email: 'test@customer.com',
    phone: '1234567890',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345'
  };

  beforeEach(async () => {
    // Clear customers before each test
    await Customer.deleteMany({});
  });

  describe('POST /api/customers', () => {
    it('should create a new customer when admin token is provided', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send(testCustomer);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.email).toBe(testCustomer.email);
    });

    it('should not create customer without admin token', async () => {
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${global.userToken}`)
        .send(testCustomer);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should not create customer with duplicate email', async () => {
      // First create a customer
      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send(testCustomer);

      // Try to create another customer with same email
      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send(testCustomer);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidCustomer = {
        email: 'invalid-email',
        phone: '',
        state: 'INVALID',
        zipCode: '123'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send(invalidCustomer);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('Name is required')
          }),
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('Valid email is required')
          }),
          expect.objectContaining({
            field: 'phone',
            message: expect.stringContaining('Phone number is required')
          }),
          expect.objectContaining({
            field: 'state',
            message: expect.stringContaining('must be a 2-letter code')
          }),
          expect.objectContaining({
            field: 'zipCode',
            message: expect.stringContaining('Invalid ZIP code format')
          })
        ])
      );
    });
  });

  describe('GET /api/customers', () => {
    beforeEach(async () => {
      // Create test customers
      await Customer.create([
        testCustomer,
        {
          ...testCustomer,
          name: 'Another Customer',
          email: 'another@customer.com',
          phone: '0987654321'
        }
      ]);
    });

    it('should get all customers with pagination', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should search customers by name', async () => {
      const response = await request(app)
        .get('/api/customers')
        .query({ search: 'Another' })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Another Customer');
    });

    it('should sort customers by name', async () => {
      const response = await request(app)
        .get('/api/customers')
        .query({ sortBy: 'name', order: 'desc' })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Test Customer');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/customers')
        .query({
          sortBy: 'invalid_field',
          order: 'invalid_order',
          page: 0,
          limit: 1000
        })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'sortBy',
            message: expect.stringContaining('Invalid sort field')
          }),
          expect.objectContaining({
            field: 'order',
            message: expect.stringContaining('Order must be asc or desc')
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

  describe('PUT /api/customers/:id', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create a test customer
      const customer = await Customer.create(testCustomer);
      customerId = customer._id.toString();
    });

    it('should update customer when admin token is provided', async () => {
      const updatedData = {
        name: 'Updated Customer',
        phone: '5555555555'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updatedData.name);
      expect(response.body.data.phone).toBe(updatedData.phone);
    });

    it('should not update customer without admin token', async () => {
      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${global.userToken}`)
        .send({ name: 'Updated Customer' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate update data', async () => {
      const customer = await Customer.create(testCustomer);
      
      const invalidUpdate = {
        email: 'invalid-email',
        phone: '',
        state: 'INVALID',
        zipCode: '123'
      };

      const response = await request(app)
        .put(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('Valid email is required')
          }),
          expect.objectContaining({
            field: 'phone',
            message: expect.stringContaining('must be a non-empty string')
          }),
          expect.objectContaining({
            field: 'state',
            message: expect.stringContaining('must be a 2-letter code')
          }),
          expect.objectContaining({
            field: 'zipCode',
            message: expect.stringContaining('Invalid ZIP code format')
          })
        ])
      );
    });

    it('should validate customer ID format', async () => {
      const response = await request(app)
        .put('/api/customers/invalid-id')
        .set('Authorization', `Bearer ${global.adminToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: expect.stringContaining('Customer ID must be valid')
          })
        ])
      );
    });
  });

  describe('DELETE /api/customers/:id', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create a test customer
      const customer = await Customer.create(testCustomer);
      customerId = customer._id.toString();
    });

    it('should soft delete customer when admin token is provided', async () => {
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${global.adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify customer is soft deleted
      const customer = await Customer.findById(customerId);
      expect(customer?.active).toBe(false);
    });

    it('should not delete customer without admin token', async () => {
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/customers/:id/purchases', () => {
    let customerId: string;

    beforeEach(async () => {
      // Create a test customer with purchases
      const customer = await Customer.create(testCustomer);
      customerId = customer._id.toString();

      // Create some test sales for the customer
      await Sale.create([
        {
          customer: customerId,
          items: [{
            product: global.adminUser._id, // Using admin ID as mock product ID
            quantity: 1,
            price: 99.99
          }],
          total: 99.99
        },
        {
          customer: customerId,
          items: [{
            product: global.adminUser._id,
            quantity: 2,
            price: 49.99
          }],
          total: 99.98
        }
      ]);
    });

    it('should get customer purchase history', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/purchases`)
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBe(2);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/nonexistentid/purchases')
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate pagination parameters', async () => {
      const customer = await Customer.create(testCustomer);

      const response = await request(app)
        .get(`/api/customers/${customer._id}/purchases`)
        .query({
          page: 0,
          limit: 1000
        })
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
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

    it('should validate customer ID format', async () => {
      const response = await request(app)
        .get('/api/customers/invalid-id/purchases')
        .set('Authorization', `Bearer ${global.userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'id',
            message: expect.stringContaining('Customer ID must be valid')
          })
        ])
      );
    });
  });
}); 