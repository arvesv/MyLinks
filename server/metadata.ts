import axios from 'axios';
import * as cheerio from 'cheerio';

export interface MetadataResult {
  title: string;
  description: string;
  favicon: string;
  suggestedIcon?: string;
  suggestedIconType?: 'homelab' | 'lucide' | 'favicon';
}

const HOMELAB_BRAND_KEYWORDS: Record<string, string> = {
  homeassistant: 'home-assistant',
  'home assistant': 'home-assistant',
  nginx: 'nginx-proxy-manager',
  portainer: 'portainer',
  truenas: 'truenas',
  proxmox: 'proxmox',
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

  let title = '';
  let description = '';
  let favicon = '';

  try {
    const response = await axios.get(urlObj.href, {
      timeout: 4000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
    });

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

      // Extract high-res icon or standard favicon
      const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr('href');
      const standardIcon =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href');

      const rawIcon = appleTouchIcon || standardIcon;
      if (rawIcon) {
        favicon = new URL(rawIcon, urlObj.origin).href;
      }
    }
  } catch (err) {
    // If request failed (e.g. self-signed cert, local IP, or offline), fallback gracefully
  }

  // Fallback title to domain name if empty
  if (!title.trim()) {
    title = urlObj.hostname.replace(/^www\./, '');
  }

  // Fallback favicon to standard domain favicon
  if (!favicon) {
    favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
  }

  // Check for suggested homelab brand icon
  let suggestedIcon: string | undefined;
  let suggestedIconType: 'homelab' | 'lucide' | 'favicon' = 'favicon';

  const haystack = `${urlObj.href} ${title} ${description}`.toLowerCase();
  for (const [kw, iconName] of Object.entries(HOMELAB_BRAND_KEYWORDS)) {
    if (haystack.includes(kw.toLowerCase())) {
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
