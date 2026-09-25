import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('MyLinks API Integration Tests', () => {
  beforeAll(() => {
    process.env.DEV_MODE = 'true';
  });

  describe('GET /api/auth/me', () => {
    it('returns the authenticated user in dev mode', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.role).toBe('admin');
    });

    it('identifies viewer role via Tailscale headers', async () => {
      process.env.DEV_MODE = 'false';
      process.env.ADMIN_USERS = 'admin@tailnet';

      const res = await request(app)
        .get('/api/auth/me')
        .set('Tailscale-User-Login', 'viewer@tailnet');

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('viewer');
      expect(res.body.user.login).toBe('viewer@tailnet');
    });
  });

  describe('GET /api/system/info', () => {
    it('returns system runtime info and database stats', async () => {
      const res = await request(app).get('/api/system/info');
      expect(res.status).toBe(200);
      expect(res.body.version).toBeDefined();
      expect(res.body.nodeVersion).toBeDefined();
      expect(res.body.uptimeSeconds).toBeTypeOf('number');
      expect(res.body.database).toBeDefined();
      expect(res.body.database.totalCategories).toBeTypeOf('number');
    });
  });

  describe('GET /api/categories', () => {
    it('returns a list of categories with links array', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].id).toBeDefined();
        expect(res.body[0].name).toBeDefined();
        expect(Array.isArray(res.body[0].links)).toBe(true);
      }
    });
  });

  describe('POST /api/links/health', () => {
    it('accepts a list of URLs and returns health results', async () => {
      const res = await request(app)
        .post('/api/links/health')
        .send({
          urls: ['http://127.0.0.1:59998', 'ftp://invalid-proto'],
        });

      expect(res.status).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(res.body.results['http://127.0.0.1:59998']).toBeDefined();
      expect(res.body.results['http://127.0.0.1:59998'].status).toBe('offline');
      expect(res.body.results['ftp://invalid-proto'].status).toBe('unknown');
    });
  });

  describe('POST /api/categories (Admin vs Viewer)', () => {
    it('blocks category creation for viewers with 403', async () => {
      process.env.DEV_MODE = 'false';
      process.env.ADMIN_USERS = 'admin@tailnet';

      const res = await request(app)
        .post('/api/categories')
        .set('Tailscale-User-Login', 'viewer@tailnet')
        .send({ name: 'Unauthorized Category' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('allows category creation for admins with 201', async () => {
      process.env.DEV_MODE = 'false';
      process.env.ADMIN_USERS = 'admin@tailnet';

      const res = await request(app)
        .post('/api/categories')
        .set('Tailscale-User-Login', 'admin@tailnet')
        .send({ name: 'Test Created Category' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Test Created Category');
    });
  });

  describe('POST /api/favicon/download', () => {
    it('downloads data URI favicon to /uploads and returns 200', async () => {
      process.env.DEV_MODE = 'true';
      const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const res = await request(app)
        .post('/api/favicon/download')
        .send({ url: dataUri });

      expect(res.status).toBe(200);
      expect(res.body.url).toMatch(/^\/uploads\/favicon-[a-f0-9]+\.png$/);
    });

    it('returns 400 when url is not provided', async () => {
      process.env.DEV_MODE = 'true';

      const res = await request(app)
        .post('/api/favicon/download')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('URL is required');
    });
  });

  describe('POST /api/metadata/fetch', () => {
    it('returns metadata object for valid URL', async () => {
      process.env.DEV_MODE = 'true';

      const res = await request(app)
        .post('/api/metadata/fetch')
        .send({ url: 'http://127.0.0.1:59998' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBeDefined();
      expect(res.body.favicon).toBeDefined();
    });

    it('returns 400 when url is not provided', async () => {
      process.env.DEV_MODE = 'true';

      const res = await request(app)
        .post('/api/metadata/fetch')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
