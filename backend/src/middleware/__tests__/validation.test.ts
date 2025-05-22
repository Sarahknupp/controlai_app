import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate, validationSchemas } from '../validation';
import { BadRequestError } from '../../utils/errors';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('validate', () => {
    it('should pass validation for valid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {
        name: 'Test User',
        email: 'test@example.com',
      };

      validate(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should throw BadRequestError for invalid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });

      mockRequest.body = {
        name: 'Test User',
        email: 'invalid-email',
      };

      validate(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(BadRequestError));
      const error = nextFunction.mock.calls[0][0];
      expect(error.message).toBe('Validation error');
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].field).toBe('email');
    });

    it('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockRequest.body = {
        name: 'Test User',
        unknownField: 'value',
      };

      validate(schema)(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({
        name: 'Test User',
      });
    });
  });

  describe('validationSchemas', () => {
    describe('createUser', () => {
      it('should validate valid user data', () => {
        const validData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
        };

        const { error } = validationSchemas.createUser.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid user data', () => {
        const invalidData = {
          name: 'Te', // Too short
          email: 'invalid-email',
          password: '123', // Too short
          role: 'invalid-role',
        };

        const { error } = validationSchemas.createUser.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details).toHaveLength(4);
      });
    });

    describe('createProduct', () => {
      it('should validate valid product data', () => {
        const validData = {
          name: 'Test Product',
          description: 'This is a test product description',
          price: 99.99,
          stock: 100,
          category: 'Electronics',
          image: 'https://example.com/image.jpg',
        };

        const { error } = validationSchemas.createProduct.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid product data', () => {
        const invalidData = {
          name: 'Te', // Too short
          description: 'Short', // Too short
          price: -10, // Negative price
          stock: -5, // Negative stock
          category: '', // Empty category
          image: 'invalid-url', // Invalid URL
        };

        const { error } = validationSchemas.createProduct.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details).toHaveLength(6);
      });
    });

    describe('createOrder', () => {
      it('should validate valid order data', () => {
        const validData = {
          items: [
            {
              productId: 'product123',
              quantity: 2,
            },
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country',
          },
        };

        const { error } = validationSchemas.createOrder.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should reject invalid order data', () => {
        const invalidData = {
          items: [], // Empty items array
          shippingAddress: {
            street: '', // Empty street
            city: '', // Empty city
            state: '', // Empty state
            zipCode: '', // Empty zipCode
            country: '', // Empty country
          },
        };

        const { error } = validationSchemas.createOrder.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details).toHaveLength(6);
      });
    });

    describe('pagination', () => {
      it('should validate valid pagination data', () => {
        const validData = {
          page: 1,
          limit: 10,
          sort: 'createdAt',
          order: 'desc',
        };

        const { error } = validationSchemas.pagination.validate(validData);
        expect(error).toBeUndefined();
      });

      it('should use default values for missing fields', () => {
        const data = {};

        const { error, value } = validationSchemas.pagination.validate(data);
        expect(error).toBeUndefined();
        expect(value).toEqual({
          page: 1,
          limit: 10,
          order: 'asc',
        });
      });

      it('should reject invalid pagination data', () => {
        const invalidData = {
          page: 0, // Invalid page
          limit: 200, // Exceeds max limit
          order: 'invalid', // Invalid order
        };

        const { error } = validationSchemas.pagination.validate(invalidData);
        expect(error).toBeDefined();
        expect(error?.details).toHaveLength(3);
      });
    });
  });
}); 