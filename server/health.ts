import axios from 'axios';
import https from 'node:https';

export interface HealthCheckResult {
  url: string;
  status: 'online' | 'offline' | 'unknown';
  statusCode?: number;
  latencyMs?: number;
  error?: string;
  checkedAt: number;
}

// In-memory cache to avoid flooding local/remote services
// Key: normalized url, Value: result + expiresAt
const healthCache = new Map<string, { result: HealthCheckResult; expiresAt: number }>();
export const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// Agent with self-signed certificate support for homelab HTTPS servers
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export function clearHealthCache(): void {
  healthCache.clear();
}

export function isRestrictedTarget(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  // Protect cloud metadata endpoints and loopback metadata traps
  if (
    lower === '169.254.169.254' ||
    lower === 'metadata.google.internal' ||
    lower === 'metadata' ||
    lower.endsWith('.internal')
  ) {
    return true;
  }
  return false;
}

export async function checkUrlHealth(targetUrl: string, bypassCache = false): Promise<HealthCheckResult> {
  const now = Date.now();

  let parsed: URL;
  try {
    let normalized = targetUrl.trim();
    if (!normalized.includes('://')) {
      normalized = 'http://' + normalized;
    }
    parsed = new URL(normalized);
  } catch {
    return {
      url: targetUrl,
      status: 'unknown',
      error: 'Invalid URL',
      checkedAt: now,
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      url: targetUrl,
      status: 'unknown',
      error: 'Unsupported protocol',
      checkedAt: now,
    };
  }

  if (isRestrictedTarget(parsed.hostname)) {
    return {
      url: targetUrl,
      status: 'offline',
      error: 'Access to cloud metadata endpoints is restricted',
      checkedAt: now,
    };
  }

  const cacheKey = parsed.href;
  if (!bypassCache) {
    const cached = healthCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.result;
    }
  }

  const startTime = performance.now();

  try {
    // Attempt HEAD request first for fast header-only check
    let response;
    try {
      response = await axios.head(parsed.href, {
        timeout: 2500,
        httpsAgent,
        maxRedirects: 4,
        validateStatus: () => true, // Any HTTP response indicates server is reachable
        headers: {
          'User-Agent': 'MyLinks-HealthCheck/1.0',
        },
      });
    } catch (headErr: any) {
      // Only retry with GET if server returned an HTTP response (e.g. 405 Method Not Allowed)
      if (headErr.response) {
        if (headErr.response.status === 405 || headErr.response.status === 403) {
          response = headErr.response;
        } else {
          response = await axios.get(parsed.href, {
            timeout: 2500,
            httpsAgent,
            maxRedirects: 4,
            validateStatus: () => true,
            headers: {
              'User-Agent': 'MyLinks-HealthCheck/1.0',
              Range: 'bytes=0-100', // Request tiny chunk
            },
          });
        }
      } else {
        // Direct network error (connection refused, timeout, etc.)
        throw headErr;
      }
    }

    const latencyMs = Math.round(performance.now() - startTime);
    const result: HealthCheckResult = {
      url: targetUrl,
      status: 'online',
      statusCode: response.status,
      latencyMs,
      checkedAt: Date.now(),
    };

    healthCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    const result: HealthCheckResult = {
      url: targetUrl,
      status: 'offline',
      error: err.code || err.message || 'Connection failed',
      latencyMs,
      checkedAt: Date.now(),
    };

    healthCache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  }
}

export async function checkMultipleUrls(
  urls: string[],
  bypassCache = false
): Promise<Record<string, HealthCheckResult>> {
  const results: Record<string, HealthCheckResult> = {};
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));

  const checks = uniqueUrls.map(async url => {
    const res = await checkUrlHealth(url, bypassCache);
    return { url, res };
  });

  const settled = await Promise.allSettled(checks);
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      results[s.value.url] = s.value.res;
    }
  }

  return results;
}
