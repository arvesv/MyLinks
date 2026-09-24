import { Request, Response, NextFunction } from 'express';
import http from 'node:http';
import fs from 'node:fs';

export interface AuthUser {
  authenticated: boolean;
  login: string;
  name: string;
  profilePic?: string;
  role: 'admin' | 'viewer';
  source: 'tailscale-header' | 'tailscale-socket' | 'dev-mode' | 'fallback';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const parseAdminUsers = (): string[] => {
  const adminUsersEnv = process.env.ADMIN_USERS || '';
  return adminUsersEnv
    .split(',')
    .map(u => u.trim().toLowerCase())
    .filter(Boolean);
};

export async function tailscaleAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const adminUsers = parseAdminUsers();
  const isDev = process.env.DEV_MODE === 'true' || (process.env.NODE_ENV !== 'production' && !req.headers['tailscale-user-login']);

  // 1. Check HTTP headers (passed by Tailscale Serve or Nginx Proxy)
  const headerLogin = (
    req.headers['tailscale-user-login'] ||
    req.headers['x-tailscale-user'] ||
    req.headers['x-webauth-user'] ||
    req.headers['x-forwarded-user']
  ) as string | undefined;

  if (headerLogin) {
    const cleanLogin = headerLogin.trim().toLowerCase();
    const displayName = (req.headers['tailscale-user-name'] as string) || cleanLogin.split('@')[0] || cleanLogin;
    const profilePic = req.headers['tailscale-user-profile-pic'] as string | undefined;

    const isAdmin = adminUsers.length === 0 || adminUsers.includes(cleanLogin);

    req.user = {
      authenticated: true,
      login: cleanLogin,
      name: displayName,
      profilePic,
      role: isAdmin ? 'admin' : 'viewer',
      source: 'tailscale-header',
    };
    return next();
  }

  // 2. Check Tailscale LocalAPI socket if configured and available
  const socketPath = process.env.TAILSCALE_SOCKET || '/var/run/tailscale/tailscaled.sock';
  const remoteIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

  if (fs.existsSync(socketPath) && (remoteIp.startsWith('100.') || remoteIp.startsWith('fd7a:'))) {
    try {
      const clientPort = req.socket.remotePort || 0;
      const whoisData = await queryTailscaleWhois(socketPath, `${remoteIp}:${clientPort}`);
      if (whoisData && whoisData.UserProfile) {
        const cleanLogin = whoisData.UserProfile.LoginName.trim().toLowerCase();
        const isAdmin = adminUsers.length === 0 || adminUsers.includes(cleanLogin);

        req.user = {
          authenticated: true,
          login: cleanLogin,
          name: whoisData.UserProfile.DisplayName || cleanLogin,
          profilePic: whoisData.UserProfile.ProfilePicURL,
          role: isAdmin ? 'admin' : 'viewer',
          source: 'tailscale-socket',
        };
        return next();
      }
    } catch (e) {
      // LocalAPI lookup failed, fall through
    }
  }

  // 3. Dev Mode / Local fallback
  if (isDev) {
    req.user = {
      authenticated: true,
      login: 'dev-admin',
      name: 'Developer Admin',
      role: 'admin',
      source: 'dev-mode',
    };
    return next();
  }

  // 4. Fallback for open tailnet access (when no specific user header is present)
  // If no admin users are configured, grant admin; otherwise grant viewer
  req.user = {
    authenticated: true,
    login: 'tailnet-user',
    name: 'Tailnet User',
    role: adminUsers.length === 0 ? 'admin' : 'viewer',
    source: 'fallback',
  };
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: Admin access required',
      currentUser: req.user?.login || 'anonymous',
    });
  }
  next();
}

function queryTailscaleWhois(socketPath: string, clientAddr: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        socketPath,
        path: `/localapi/v0/whois?addr=${encodeURIComponent(clientAddr)}`,
        method: 'GET',
        headers: {
          Host: 'local-tailscale-daemon',
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Tailscale whois error: ${res.statusCode}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(1500, () => {
      req.destroy();
      reject(new Error('Tailscale whois timed out'));
    });
    req.end();
  });
}
