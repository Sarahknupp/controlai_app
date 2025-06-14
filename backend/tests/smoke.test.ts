import request from 'supertest';
import app from '../src/app';

describe('Smoke Tests - Core Endpoints', () => {
  it('GET /health deve retornar 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('GET /api/customers deve retornar 200', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(200);
  });

  it('GET /api/products deve retornar 200', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
  });

  it('GET /api/sales deve retornar 200', async () => {
    const res = await request(app).get('/api/sales');
    expect(res.status).toBe(200);
  });
}); 