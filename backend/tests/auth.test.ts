import request from 'supertest';
import { app } from '../src/server.js';
import { runMigrations, seed } from '../src/scripts/migrations.js';

describe('Authentication API', () => {
  beforeAll(async () => {
    await runMigrations();
    await seed();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('username', 'admin');
      expect(response.body.data.user).toHaveProperty('role', 'admin');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin'
          // missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.type).toBe('validation');
    });

    it('should reject empty request body', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject request without refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .expect(401);
    });
  });
});