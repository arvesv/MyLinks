import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'node:https';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

export interface MetadataResult {
  title: string;
  description: string;
  favicon: string;
  suggestedIcon?: string;
  suggestedIconType?: 'homelab' | 'lucide' | 'favicon';
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// HTTPS agent with self-signed certificate support for internal/homelab servers
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function isRestrictedTarget(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === '169.254.169.254' ||
    lower === 'metadata.google.internal' ||
    lower === 'metadata'
  ) {
    return true;
  }
  return false;
}

export function isPrivateOrLocalHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower.endsWith('.lan') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.home') ||
    lower.endsWith('.home.arpa') ||
    lower.endsWith('.intra') ||
    lower.endsWith('.corp') ||
    lower.endsWith('.private') ||
    lower.endsWith('.ts.net') ||
    !lower.includes('.')
  ) {
    return true;
  }

  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);
    if (octet1 === 10) return true;
    if (octet1 === 127) return true;
    if (octet1 === 169 && octet2 === 254) return true;
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    if (octet1 === 192 && octet2 === 168) return true;
  }

  return false;
}

function getExtensionFromMime(mime: string): string {
  const lower = mime.toLowerCase();
  if (lower.includes('svg')) return '.svg';
  if (lower.includes('png')) return '.png';
  if (lower.includes('ico') || lower.includes('icon')) return '.ico';
  if (lower.includes('webp')) return '.webp';
  if (lower.includes('jpeg') || lower.includes('jpg')) return '.jpg';
  if (lower.includes('gif')) return '.gif';
  return '';
}

export async function downloadFavicon(iconUrl: string): Promise<string> {
  if (!iconUrl || !iconUrl.trim()) return '';

  try {
    ensureUploadsDir();

    // Handle base64 data URIs
    if (iconUrl.startsWith('data:image/')) {
      const match = iconUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const ext = getExtensionFromMime(match[1]) || '.png';
        const buffer = Buffer.from(match[2], 'base64');
        const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12);
        const filename = `favicon-${hash}${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);
        await fs.promises.writeFile(filePath, buffer);
        return `/uploads/${filename}`;
      }
      return iconUrl;
    }

    const res = await axios.get(iconUrl, {
      responseType: 'arraybuffer',
      httpsAgent,
      timeout: 4000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      maxRedirects: 4,
      validateStatus: (s) => s === 200,
    });

    const buffer = Buffer.from(res.data);
    if (!buffer || buffer.length === 0) return iconUrl;

    const contentType = (res.headers['content-type'] || '').toString();
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      return iconUrl;
    }

    let ext = getExtensionFromMime(contentType);
    if (!ext) {
      try {
        const parsed = new URL(iconUrl);
        const urlExt = path.extname(parsed.pathname).toLowerCase();
        if (['.png', '.ico', '.svg', '.webp', '.jpg', '.jpeg', '.gif'].includes(urlExt)) {
          ext = urlExt;
        }
      } catch {}
    }
    if (!ext) ext = '.png';

    const hash = crypto.createHash('sha256').update(iconUrl).digest('hex').slice(0, 12);
    const filename = `favicon-${hash}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (err: any) {
    // Return original URL if download fails
    return iconUrl;
  }
}

const HOMELAB_BRAND_KEYWORDS: Record<string, string> = {
  homeassistant: 'home-assistant',
  'home assistant': 'home-assistant',
  nginx: 'nginx-proxy-manager',
  portainer: 'portainer',
  truenas: 'truenas',
  proxmox: 'proxmox',
  pve: 'proxmox',
  plex: 'plex',
  jellyfin: 'jellyfin',
  sonarr: 'sonarr',
  radarr: 'radarr',
  lidarr: 'lidarr',
  bazarr: 'bazarr',
  prowlarr: 'prowlarr',
  qBittorrent: 'qbittorrent',
  transmission: 'transmission',
  sabnzbd: 'sabnzbd',
  obsidian: 'obsidian',
  vaultwarden: 'bitwarden',
  bitwarden: 'bitwarden',
  nextcloud: 'nextcloud',
  tailscale: 'tailscale',
  wireguard: 'wireguard',
  github: 'github',
  gitlab: 'gitlab',
  cloudflare: 'cloudflare',
  adguard: 'adguard-home',
  pihole: 'pi-hole',
  grafana: 'grafana',
  prometheus: 'prometheus',
  uptime: 'uptime-kuma',
  kuma: 'uptime-kuma',
  synology: 'synology',
  unifi: 'unifi',
};

export async function fetchUrlMetadata(targetUrl: string): Promise<MetadataResult> {
  let urlObj: URL;
  try {
    let normalized = targetUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    urlObj = new URL(normalized);
  } catch (e) {
    throw new Error('Invalid URL format');
  }

  if (isRestrictedTarget(urlObj.hostname)) {
    throw new Error('Access to cloud metadata endpoints is restricted');
  }

  let title = '';
  let description = '';
  let resolvedFaviconUrl = '';
  let finalBaseUrl: URL = urlObj;

  try {
    const response = await axios.get(urlObj.href, {
      timeout: 4000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      httpsAgent,
      maxRedirects: 5,
      validateStatus: (s) => s < 500,
    });

    const finalUrl = response.request?.res?.responseUrl || response.config?.url || urlObj.href;
    try {
      finalBaseUrl = new URL(finalUrl);
    } catch {
      finalBaseUrl = urlObj;
    }

    const html = response.data;
    if (typeof html === 'string') {
      const $ = cheerio.load(html);

      // Extract title
      title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').first().text() ||
        '';

      // Extract description
      description =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        '';

      // Check <base href="...">
      const baseHref = $('base').attr('href');
      let effectiveBase = finalBaseUrl;
      if (baseHref) {
        try {
          effectiveBase = new URL(baseHref, finalBaseUrl);
        } catch {}
      }

      // Collect icon candidates with priority
      const candidates: { href: string; priority: number }[] = [];

      $('link').each((_i, el) => {
        const rel = ($(el).attr('rel') || '').toLowerCase().trim();
        const href = $(el).attr('href');
        if (!href) return;

        if (rel.includes('apple-touch-icon')) {
          candidates.push({ href, priority: 10 });
        } else if (rel.includes('icon')) {
          const sizes = $(el).attr('sizes') || '';
          const type = $(el).attr('type') || '';
          if (
            sizes.includes('192') ||
            sizes.includes('180') ||
            sizes.includes('128') ||
            sizes.includes('96') ||
            sizes.includes('64')
          ) {
            candidates.push({ href, priority: 9 });
          } else if (type.includes('svg') || type.includes('png')) {
            candidates.push({ href, priority: 8 });
          } else {
            candidates.push({ href, priority: 5 });
          }
        }
      });

      candidates.sort((a, b) => b.priority - a.priority);

      for (const cand of candidates) {
        try {
          const resolved = new URL(cand.href, effectiveBase).href;
          if (resolved) {
            resolvedFaviconUrl = resolved;
            break;
          }
        } catch {}
      }
    }
  } catch (err) {
    // If request failed (e.g. offline), fallback gracefully
  }

  // Fallback title to domain name if empty
  if (!title.trim()) {
    title = urlObj.hostname.replace(/^www\./, '');
  }

  // If no icon found in HTML, try direct /favicon.ico at origin
  if (!resolvedFaviconUrl) {
    try {
      const directFavicon = new URL('/favicon.ico', finalBaseUrl.origin).href;
      const probeRes = await axios.head(directFavicon, {
        timeout: 2500,
        httpsAgent,
        validateStatus: (s) => s === 200,
      });
      if (probeRes.status === 200) {
        resolvedFaviconUrl = directFavicon;
      }
    } catch {
      // head probe failed, ignore
    }
  }

  // Fallback favicon to standard domain favicon service for public domains only
  if (!resolvedFaviconUrl && !isPrivateOrLocalHostname(urlObj.hostname)) {
    resolvedFaviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
  }

  // Download and cache favicon locally to avoid mixed-content and client-side cert errors
  let favicon = '';
  if (resolvedFaviconUrl) {
    favicon = await downloadFavicon(resolvedFaviconUrl);
  }

  // Check for suggested homelab brand icon
  let suggestedIcon: string | undefined;
  let suggestedIconType: 'homelab' | 'lucide' | 'favicon' = 'favicon';

  const haystack = `${urlObj.href} ${title} ${description}`.toLowerCase();
  for (const [kw, iconName] of Object.entries(HOMELAB_BRAND_KEYWORDS)) {
    const kwLower = kw.toLowerCase();
    if (kwLower.length <= 3) {
      const regex = new RegExp(`\\b${kwLower}\\b`, 'i');
      if (regex.test(haystack)) {
        suggestedIcon = iconName;
        suggestedIconType = 'homelab';
        break;
      }
    } else if (haystack.includes(kwLower)) {
      suggestedIcon = iconName;
      suggestedIconType = 'homelab';
      break;
    }
  }

  return {
    title: title.trim(),
    description: description.trim(),
    favicon,
    suggestedIcon,
    suggestedIconType,
  };
}
