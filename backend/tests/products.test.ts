import request from 'supertest';
import { app } from '../src/server.js';
import { runMigrations, seed } from '../src/scripts/migrations.js';

describe('Products API', () => {
  let adminToken: string;
  let operatorToken: string;
  let testProductId: string;

  beforeAll(async () => {
    await runMigrations();
    await seed();

    // Get admin token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    // Get operator token
    const operatorLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'operator1', password: 'operator123' });
    operatorToken = operatorLogin.body.data.token;
  });

  describe('GET /api/products', () => {
    it('should get all products with admin token', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should filter products by search term', async () => {
      const response = await request(app)
        .get('/api/products?search=Widget')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter products by status', async () => {
      const response = await request(app)
        .get('/api/products?status=normal')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.products.length > 0) {
        expect(response.body.data.products[0]).toHaveProperty('status', 'normal');
      }
    });

    it('should respect pagination parameters', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeLessThanOrEqual(5);
      expect(response.body.data.pagination).toHaveProperty('page', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/products')
        .expect(401);
    });
  });

  describe('POST /api/products', () => {
    it('should create new product with admin token', async () => {
      const newProduct = {
        name: 'Test Widget',
        model: 'TW-001',
        route_id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', // From seed data
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newProduct.name);
      expect(response.body.data).toHaveProperty('model', newProduct.model);
      
      testProductId = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const invalidProduct = {
        name: 'Test Widget'
        // missing model and route_id
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);
    });

    it('should reject request from operator role', async () => {
      const newProduct = {
        name: 'Test Widget',
        model: 'TW-002',
        route_id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e',
        priority: 'medium'
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(newProduct)
        .expect(403);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testProductId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('route');
      expect(response.body.data).toHaveProperty('stationHistory');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should validate UUID format', async () => {
      await request(app)
        .get('/api/products/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product with admin token', async () => {
      const updates = {
        name: 'Updated Test Widget',
        priority: 'low',
        progress: 50
      };

      const response = await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updates.name);
      expect(response.body.data).toHaveProperty('priority', updates.priority);
    });

    it('should validate update data', async () => {
      const invalidUpdates = {
        progress: 150 // Invalid: > 100
      };

      await request(app)
        .put(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdates)
        .expect(400);
    });
  });

  describe('POST /api/products/bulk', () => {
    it('should perform bulk updates with admin token', async () => {
      const bulkUpdate = {
        product_ids: [testProductId],
        updates: {
          priority: 'high',
          status: 'normal'
        }
      };

      const response = await request(app)
        .post('/api/products/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bulkUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('updated_count', 1);
    });

    it('should validate bulk update data', async () => {
      const invalidBulkUpdate = {
        product_ids: [], // Empty array
        updates: {
          priority: 'high'
        }
      };

      await request(app)
        .post('/api/products/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidBulkUpdate)
        .expect(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product with admin token', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent product', async () => {
      await request(app)
        .delete(`/api/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should reject delete request from operator role', async () => {
      // First create a product to delete
      const newProduct = {
        name: 'Delete Test Widget',
        model: 'DTW-001',
        route_id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e',
        priority: 'medium'
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      const productId = createResponse.body.data.id;

      // Try to delete with operator token
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);
    });
  });
});