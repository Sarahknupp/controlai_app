import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase, teardownTestDatabase } from '../utils/test-database';

describe('Error Handling Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Invalid Routes', () => {
    it('should handle invalid route patterns without throwing exceptions', async () => {
      const invalidRoutes = [
        '/pathToRegexpError',
        '/:invalidParam',
        '/:missingName',
        '/:',
        '/:123',
        '/:invalid/123',
        '/:invalid/:missing'
      ];

      for (const route of invalidRoutes) {
        const response = await request(app)
          .get(route)
          .expect(404); // Espera um 404 Not Found

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Not Found');
      }
    });

    it('should handle malformed route parameters gracefully', async () => {
      const malformedRoutes = [
        '/products/:',
        '/sales/:',
        '/customers/:',
        '/users/:'
      ];

      for (const route of malformedRoutes) {
        const response = await request(app)
          .get(route)
          .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Not Found');
      }
    });

    it('should handle routes with invalid parameter names', async () => {
      const invalidParamRoutes = [
        '/products/:123',
        '/sales/:abc123',
        '/customers/:user@id',
        '/users/:user.id'
      ];

      for (const route of invalidParamRoutes) {
        const response = await request(app)
          .get(route)
          .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Not Found');
      }
    });
  });
}); 