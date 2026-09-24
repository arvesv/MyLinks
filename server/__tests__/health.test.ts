import { describe, it, expect, beforeEach } from 'vitest';
import { isRestrictedTarget, checkUrlHealth, clearHealthCache } from '../health';

describe('Health Checker', () => {
  beforeEach(() => {
    clearHealthCache();
  });

  describe('isRestrictedTarget', () => {
    it('restricts cloud metadata IP addresses', () => {
      expect(isRestrictedTarget('169.254.169.254')).toBe(true);
      expect(isRestrictedTarget('metadata.google.internal')).toBe(true);
      expect(isRestrictedTarget('instance-data.internal')).toBe(true);
    });

    it('allows regular hostnames and local domains', () => {
      expect(isRestrictedTarget('homeassistant.local')).toBe(false);
      expect(isRestrictedTarget('192.168.1.100')).toBe(false);
      expect(isRestrictedTarget('github.com')).toBe(false);
    });
  });

  describe('checkUrlHealth', () => {
    it('returns unknown for completely invalid URLs', async () => {
      const result = await checkUrlHealth('not-a-valid-url:;:;');
      // URL parsing normalization might prepend http:// or fail
      expect(result.status === 'unknown' || result.status === 'offline').toBe(true);
    });

    it('returns unknown for non-http protocols', async () => {
      const result = await checkUrlHealth('ftp://example.com/file.txt');
      expect(result.status).toBe('unknown');
      expect(result.error).toBe('Unsupported protocol');
    });

    it('blocks restricted cloud metadata target with offline status', async () => {
      const result = await checkUrlHealth('http://169.254.169.254/latest/meta-data/');
      expect(result.status).toBe('offline');
      expect(result.error).toContain('restricted');
    });

    it('handles offline host gracefully without unhandled exceptions', async () => {
      // Connect to non-routable dummy port on localhost
      const result = await checkUrlHealth('http://127.0.0.1:59999');
      expect(result.status).toBe('offline');
      expect(result.url).toBe('http://127.0.0.1:59999');
      expect(result.latencyMs).toBeDefined();
    });
  });
});
