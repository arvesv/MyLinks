import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tailscaleAuthMiddleware, requireAdmin } from '../auth';

describe('Tailscale Auth Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('assigns admin role when user login is in ADMIN_USERS', async () => {
    process.env.ADMIN_USERS = 'admin@tailnet,alice@example.com';
    process.env.DEV_MODE = 'false';
    process.env.NODE_ENV = 'production';

    const req: any = {
      headers: {
        'tailscale-user-login': 'Alice@Example.com',
        'tailscale-user-name': 'Alice',
      },
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.login).toBe('alice@example.com');
    expect(req.user.name).toBe('Alice');
    expect(req.user.role).toBe('admin');
    expect(req.user.source).toBe('tailscale-header');
  });

  it('assigns viewer role when user login is not in ADMIN_USERS', async () => {
    process.env.ADMIN_USERS = 'admin@tailnet';
    process.env.DEV_MODE = 'false';
    process.env.NODE_ENV = 'production';

    const req: any = {
      headers: {
        'tailscale-user-login': 'guest@example.com',
      },
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('viewer');
    expect(req.user.login).toBe('guest@example.com');
  });

  it('grants admin to any tailnet user if ADMIN_USERS is empty', async () => {
    process.env.ADMIN_USERS = '';
    process.env.DEV_MODE = 'false';
    process.env.NODE_ENV = 'production';

    const req: any = {
      headers: {
        'tailscale-user-login': 'anyone@example.com',
      },
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
  });

  it('assigns admin role when handle matches without domain suffix', async () => {
    process.env.ADMIN_USERS = 'arvesv';
    process.env.DEV_MODE = 'false';
    process.env.NODE_ENV = 'production';

    const req: any = {
      headers: {
        'tailscale-user-login': 'arvesv@github',
        'tailscale-user-name': 'Arve Svendsen',
      },
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.login).toBe('arvesv@github');
    expect(req.user.role).toBe('admin');
  });

  it('assigns admin role when ADMIN_USERS contains wildcard *', async () => {
    process.env.ADMIN_USERS = '*';
    process.env.DEV_MODE = 'false';
    process.env.NODE_ENV = 'production';

    const req: any = {
      headers: {
        'tailscale-user-login': 'random-user@tailnet.ts.net',
      },
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
  });

  it('assigns admin role to fallback user when tailnet-user is in ADMIN_USERS', async () => {
    process.env.ADMIN_USERS = 'arvesv,tailnet-user';
    process.env.DEV_MODE = 'false';
    process.env.NODE_ENV = 'production';

    const req: any = {
      headers: {},
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.login).toBe('tailnet-user');
    expect(req.user.role).toBe('admin');
    expect(req.user.source).toBe('fallback');
  });

  it('provides dev-mode admin when DEV_MODE is true', async () => {
    process.env.DEV_MODE = 'true';

    const req: any = {
      headers: {},
      socket: {},
    };
    const res: any = {};
    const next = vi.fn();

    await tailscaleAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('admin');
    expect(req.user.source).toBe('dev-mode');
  });
});

describe('requireAdmin Middleware', () => {
  it('calls next() when user has admin role', () => {
    const req: any = { user: { role: 'admin', login: 'alice' } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 Forbidden when user is viewer', () => {
    const req: any = { user: { role: 'viewer', login: 'bob' } };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Forbidden') })
    );
  });
});
