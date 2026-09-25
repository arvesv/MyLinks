// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import {
  isRestrictedTarget,
  isPrivateOrLocalHostname,
  downloadFavicon,
  fetchUrlMetadata,
} from '../metadata';

describe('Metadata & Favicon Scraper', () => {
  describe('isRestrictedTarget', () => {
    it('blocks cloud metadata endpoints', () => {
      expect(isRestrictedTarget('169.254.169.254')).toBe(true);
      expect(isRestrictedTarget('metadata.google.internal')).toBe(true);
      expect(isRestrictedTarget('metadata')).toBe(true);
    });

    it('allows normal homelab and public hostnames', () => {
      expect(isRestrictedTarget('pve.arvehome.com')).toBe(false);
      expect(isRestrictedTarget('jellyfin.royal-great.ts.net')).toBe(false);
      expect(isRestrictedTarget('vg.no')).toBe(false);
    });
  });

  describe('isPrivateOrLocalHostname', () => {
    it('detects localhost and loopback addresses', () => {
      expect(isPrivateOrLocalHostname('localhost')).toBe(true);
      expect(isPrivateOrLocalHostname('127.0.0.1')).toBe(true);
      expect(isPrivateOrLocalHostname('::1')).toBe(true);
    });

    it('detects Tailscale and internal TLDs', () => {
      expect(isPrivateOrLocalHostname('jellyfin.royal-great.ts.net')).toBe(true);
      expect(isPrivateOrLocalHostname('server.local')).toBe(true);
      expect(isPrivateOrLocalHostname('nas.lan')).toBe(true);
      expect(isPrivateOrLocalHostname('router.internal')).toBe(true);
      expect(isPrivateOrLocalHostname('homeassistant.home')).toBe(true);
      expect(isPrivateOrLocalHostname('gateway.home.arpa')).toBe(true);
      expect(isPrivateOrLocalHostname('pihole')).toBe(true);
    });

    it('detects private IPv4 subnets', () => {
      expect(isPrivateOrLocalHostname('10.0.0.1')).toBe(true);
      expect(isPrivateOrLocalHostname('192.168.1.1')).toBe(true);
      expect(isPrivateOrLocalHostname('172.16.0.1')).toBe(true);
      expect(isPrivateOrLocalHostname('172.31.255.255')).toBe(true);
      expect(isPrivateOrLocalHostname('169.254.1.1')).toBe(true);
      expect(isPrivateOrLocalHostname('172.32.0.1')).toBe(false);
      expect(isPrivateOrLocalHostname('8.8.8.8')).toBe(false);
    });

    it('returns false for public domain names', () => {
      expect(isPrivateOrLocalHostname('vg.no')).toBe(false);
      expect(isPrivateOrLocalHostname('www.vg.no')).toBe(false);
      expect(isPrivateOrLocalHostname('github.com')).toBe(false);
    });
  });

  describe('downloadFavicon', () => {
    it('handles base64 data URIs and saves to /uploads', async () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = await downloadFavicon(dataUri);
      expect(result).toMatch(/^\/uploads\/favicon-[a-f0-9]+\.png$/);
    });

    it('returns empty string for empty input', async () => {
      const result = await downloadFavicon('');
      expect(result).toBe('');
    });
  });

  describe('fetchUrlMetadata', () => {
    let server: http.Server;
    let serverPort: number;

    beforeAll(async () => {
      // Create local test server to simulate redirects and relative icon links
      server = http.createServer((req, res) => {
        const url = req.url || '/';

        if (url === '/') {
          // Simulate 302 redirect like Jellyfin
          res.writeHead(302, { Location: '/web/' });
          res.end();
          return;
        }

        if (url === '/web/' || url === '/web/index.html') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!doctype html>
            <html>
              <head>
                <title>Jellyfin Test</title>
                <meta name="description" content="The Free Software Media System">
                <link rel="apple-touch-icon" sizes="180x180" href="touchicon.f5bbb798cb2c65908633.png">
                <link rel="shortcut icon" href="favicon.ico">
              </head>
              <body><h1>Jellyfin</h1></body>
            </html>
          `);
          return;
        }

        if (url === '/web/touchicon.f5bbb798cb2c65908633.png') {
          // 1x1 transparent PNG
          const png = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
          );
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(png);
          return;
        }

        if (url === '/touchicon.f5bbb798cb2c65908633.png') {
          // Path without /web/ is 404
          res.writeHead(404);
          res.end('Not Found');
          return;
        }

        if (url === '/pve-test') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!doctype html>
            <html>
              <head>
                <title>pve - Proxmox Virtual Environment</title>
                <link rel="icon" sizes="128x128" href="/pve2/images/logo-128.png">
              </head>
              <body><h1>PVE</h1></body>
            </html>
          `);
          return;
        }

        if (url === '/pve2/images/logo-128.png') {
          const png = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
          );
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(png);
          return;
        }

        res.writeHead(404);
        res.end();
      });

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          serverPort = (server.address() as AddressInfo).port;
          resolve();
        });
      });
    });

    afterAll(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('correctly resolves relative favicon URL after redirects and downloads it', async () => {
      const meta = await fetchUrlMetadata(`http://127.0.0.1:${serverPort}/`);
      expect(meta.title).toBe('Jellyfin Test');
      expect(meta.description).toBe('The Free Software Media System');
      expect(meta.suggestedIcon).toBe('jellyfin');
      expect(meta.suggestedIconType).toBe('homelab');
      expect(meta.favicon).toMatch(/^\/uploads\/favicon-[a-f0-9]+\.png$/);
    });

    it('matches pve keyword to proxmox homelab icon and downloads root-relative icon', async () => {
      const meta = await fetchUrlMetadata(`http://127.0.0.1:${serverPort}/pve-test`);
      expect(meta.title).toBe('pve - Proxmox Virtual Environment');
      expect(meta.suggestedIcon).toBe('proxmox');
      expect(meta.suggestedIconType).toBe('homelab');
      expect(meta.favicon).toMatch(/^\/uploads\/favicon-[a-f0-9]+\.png$/);
    });

    it('blocks restricted cloud metadata target', async () => {
      await expect(fetchUrlMetadata('http://169.254.169.254/latest')).rejects.toThrow('restricted');
    });

    it('handles offline host gracefully by falling back to hostname', async () => {
      const meta = await fetchUrlMetadata('http://127.0.0.1:59998');
      expect(meta.title).toBe('127.0.0.1');
      expect(meta.favicon).toBe('');
    });
  });
});
