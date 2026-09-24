import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'mylinks.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      collapsed INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      icon_type TEXT DEFAULT 'favicon',
      is_favorite INTEGER DEFAULT 0,
      open_new_tab INTEGER DEFAULT 1,
      tags TEXT DEFAULT '',
      click_count INTEGER DEFAULT 0,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Check if categories table is empty, if so, seed starter data
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (categoryCount.count === 0) {
    seedStarterData();
  }
}

function seedStarterData() {
  const now = new Date().toISOString();

  const starterCategories = [
    {
      id: 'cat-homelab',
      name: 'Homelab & Infrastructure',
      sort_order: 1,
      links: [
        {
          id: 'link-ha',
          title: 'Home Assistant',
          url: 'http://homeassistant.local:8123',
          description: 'Smart home automation and device hub',
          icon: 'home-assistant',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'home,iot,automation',
        },
        {
          id: 'link-npm',
          title: 'Nginx Proxy Manager',
          url: 'http://nginx.local:81',
          description: 'Reverse proxy and SSL certificate management',
          icon: 'nginx-proxy-manager',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'network,proxy,ssl',
        },
        {
          id: 'link-portainer',
          title: 'Portainer',
          url: 'http://portainer.local:9000',
          description: 'Docker container management GUI',
          icon: 'portainer',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'docker,containers,admin',
        },
        {
          id: 'link-truenas',
          title: 'TrueNAS',
          url: 'https://truenas.local',
          description: 'Network-attached storage & ZFS pools',
          icon: 'truenas',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'nas,storage,backup',
        },
      ],
    },
    {
      id: 'cat-media',
      name: 'Media & Entertainment',
      sort_order: 2,
      links: [
        {
          id: 'link-jellyfin',
          title: 'Jellyfin',
          url: 'http://jellyfin.local:8096',
          description: 'Free software media system & streaming',
          icon: 'jellyfin',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'media,streaming,video',
        },
        {
          id: 'link-plex',
          title: 'Plex',
          url: 'http://plex.local:32400/web',
          description: 'Personal media server and player',
          icon: 'plex',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'media,movies,music',
        },
        {
          id: 'link-sonarr',
          title: 'Sonarr',
          url: 'http://sonarr.local:8989',
          description: 'TV show collection manager',
          icon: 'sonarr',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'media,downloads,automation',
        },
        {
          id: 'link-radarr',
          title: 'Radarr',
          url: 'http://radarr.local:7878',
          description: 'Movie collection manager',
          icon: 'radarr',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'media,movies,automation',
        },
      ],
    },
    {
      id: 'cat-productivity',
      name: 'Productivity & Notes',
      sort_order: 3,
      links: [
        {
          id: 'link-obsidian',
          title: 'Obsidian',
          url: 'obsidian://open',
          description: 'Knowledge base and markdown notes',
          icon: 'obsidian',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'notes,knowledge,markdown',
        },
        {
          id: 'link-vaultwarden',
          title: 'Vaultwarden',
          url: 'https://vaultwarden.local',
          description: 'Lightweight Bitwarden-compatible password manager',
          icon: 'bitwarden',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'security,passwords,vault',
        },
        {
          id: 'link-nextcloud',
          title: 'Nextcloud',
          url: 'https://nextcloud.local',
          description: 'Self-hosted cloud storage and file sync',
          icon: 'nextcloud',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'cloud,files,collaboration',
        },
      ],
    },
    {
      id: 'cat-tools',
      name: 'External Tools & Cloud',
      sort_order: 4,
      links: [
        {
          id: 'link-tailscale',
          title: 'Tailscale Admin',
          url: 'https://login.tailscale.com/admin/machines',
          description: 'Manage mesh VPN devices and access controls',
          icon: 'tailscale',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'vpn,tailscale,network',
        },
        {
          id: 'link-github',
          title: 'GitHub',
          url: 'https://github.com',
          description: 'Repositories, pull requests, and CI/CD',
          icon: 'github',
          icon_type: 'homelab',
          is_favorite: 1,
          tags: 'git,code,dev',
        },
        {
          id: 'link-cloudflare',
          title: 'Cloudflare Dashboard',
          url: 'https://dash.cloudflare.com',
          description: 'DNS management, tunnels, and CDN',
          icon: 'cloudflare',
          icon_type: 'homelab',
          is_favorite: 0,
          tags: 'dns,security,cloud',
        },
      ],
    },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, sort_order, collapsed, created_at, updated_at)
    VALUES (?, ?, ?, 0, ?, ?)
  `);

  const insertLink = db.prepare(`
    INSERT INTO links (
      id, category_id, title, url, description, icon, icon_type,
      is_favorite, open_new_tab, tags, click_count, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, ?, ?, ?)
  `);

  for (const cat of starterCategories) {
    insertCategory.run(cat.id, cat.name, cat.sort_order, now, now);
    let linkOrder = 1;
    for (const link of cat.links) {
      insertLink.run(
        link.id,
        cat.id,
        link.title,
        link.url,
        link.description,
        link.icon,
        link.icon_type,
        link.is_favorite,
        link.tags,
        linkOrder++,
        now,
        now
      );
    }
  }
}

export interface LinkRecord {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  icon_type: string;
  is_favorite: number;
  open_new_tab: number;
  tags: string;
  click_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  sort_order: number;
  collapsed: number;
  created_at: string;
  updated_at: string;
  links?: LinkRecord[];
}

export function getAllCategoriesWithLinks(): CategoryRecord[] {
  const categories = db.prepare(`
    SELECT * FROM categories ORDER BY sort_order ASC, name ASC
  `).all() as unknown as CategoryRecord[];

  const links = db.prepare(`
    SELECT * FROM links ORDER BY sort_order ASC, title ASC
  `).all() as unknown as LinkRecord[];

  const categoryMap = new Map<string, CategoryRecord>();
  for (const cat of categories) {
    cat.links = [];
    categoryMap.set(cat.id, cat);
  }

  for (const link of links) {
    const cat = categoryMap.get(link.category_id);
    if (cat) {
      cat.links!.push(link);
    }
  }

  return categories;
}

export function createCategory(name: string): CategoryRecord {
  const maxOrder = db.prepare('SELECT MAX(sort_order) as maxOrder FROM categories').get() as { maxOrder: number | null };
  const sort_order = (maxOrder?.maxOrder ?? 0) + 1;
  const id = 'cat-' + crypto.randomUUID().slice(0, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO categories (id, name, sort_order, collapsed, created_at, updated_at)
    VALUES (?, ?, ?, 0, ?, ?)
  `).run(id, name, sort_order, now, now);

  return { id, name, sort_order, collapsed: 0, created_at: now, updated_at: now, links: [] };
}

export function updateCategory(id: string, updates: { name?: string; collapsed?: boolean; sort_order?: number }): boolean {
  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.collapsed !== undefined) {
    fields.push('collapsed = ?');
    values.push(updates.collapsed ? 1 : 0);
  }
  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(updates.sort_order);
  }

  values.push(id);
  const stmt = db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values) as any;
  return result?.changes ? result.changes > 0 : true;
}

export function deleteCategory(id: string): boolean {
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  const result = stmt.run(id) as any;
  return result?.changes ? result.changes > 0 : true;
}

export function reorderCategories(orderedIds: string[]): void {
  const updateStmt = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
  for (let i = 0; i < orderedIds.length; i++) {
    updateStmt.run(i + 1, orderedIds[i]);
  }
}

export function createLink(data: {
  category_id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  icon_type?: string;
  is_favorite?: boolean;
  open_new_tab?: boolean;
  tags?: string;
}): LinkRecord {
  const maxOrder = db.prepare('SELECT MAX(sort_order) as maxOrder FROM links WHERE category_id = ?').get(data.category_id) as { maxOrder: number | null };
  const sort_order = (maxOrder?.maxOrder ?? 0) + 1;
  const id = 'link-' + crypto.randomUUID().slice(0, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO links (
      id, category_id, title, url, description, icon, icon_type,
      is_favorite, open_new_tab, tags, click_count, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `).run(
    id,
    data.category_id,
    data.title,
    data.url,
    data.description || '',
    data.icon || '',
    data.icon_type || 'favicon',
    data.is_favorite ? 1 : 0,
    data.open_new_tab ?? true ? 1 : 0,
    data.tags || '',
    sort_order,
    now,
    now
  );

  return {
    id,
    category_id: data.category_id,
    title: data.title,
    url: data.url,
    description: data.description || null,
    icon: data.icon || null,
    icon_type: data.icon_type || 'favicon',
    is_favorite: data.is_favorite ? 1 : 0,
    open_new_tab: data.open_new_tab ?? true ? 1 : 0,
    tags: data.tags || '',
    click_count: 0,
    sort_order,
    created_at: now,
    updated_at: now,
  };
}

export function updateLink(id: string, updates: Partial<{
  category_id: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  icon_type: string;
  is_favorite: boolean;
  open_new_tab: boolean;
  tags: string;
  sort_order: number;
}>): boolean {
  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(updates.category_id);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.url !== undefined) {
    fields.push('url = ?');
    values.push(updates.url);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.icon !== undefined) {
    fields.push('icon = ?');
    values.push(updates.icon);
  }
  if (updates.icon_type !== undefined) {
    fields.push('icon_type = ?');
    values.push(updates.icon_type);
  }
  if (updates.is_favorite !== undefined) {
    fields.push('is_favorite = ?');
    values.push(updates.is_favorite ? 1 : 0);
  }
  if (updates.open_new_tab !== undefined) {
    fields.push('open_new_tab = ?');
    values.push(updates.open_new_tab ? 1 : 0);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(updates.tags);
  }
  if (updates.sort_order !== undefined) {
    fields.push('sort_order = ?');
    values.push(updates.sort_order);
  }

  values.push(id);
  const stmt = db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values) as any;
  return result?.changes ? result.changes > 0 : true;
}

export function deleteLink(id: string): boolean {
  const stmt = db.prepare('DELETE FROM links WHERE id = ?');
  const result = stmt.run(id) as any;
  return result?.changes ? result.changes > 0 : true;
}

export function reorderLinks(orderedIds: string[], categoryId?: string): void {
  const updateOrderStmt = db.prepare('UPDATE links SET sort_order = ? WHERE id = ?');
  const updateCatStmt = db.prepare('UPDATE links SET category_id = ?, sort_order = ? WHERE id = ?');

  for (let i = 0; i < orderedIds.length; i++) {
    if (categoryId) {
      updateCatStmt.run(categoryId, i + 1, orderedIds[i]);
    } else {
      updateOrderStmt.run(i + 1, orderedIds[i]);
    }
  }
}

export function incrementClickCount(id: string): void {
  db.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?').run(id);
}

export function exportBackup() {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
  const links = db.prepare('SELECT * FROM links ORDER BY sort_order ASC').all();
  const settings = db.prepare('SELECT * FROM settings').all();

  return {
    version: 1,
    exported_at: new Date().toISOString(),
    categories,
    links,
    settings,
  };
}

export function importBackup(backup: { categories: any[]; links: any[]; settings?: any[] }) {
  if (!backup || !Array.isArray(backup.categories) || !Array.isArray(backup.links)) {
    throw new Error('Invalid backup data structure.');
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    db.exec('DELETE FROM links;');
    db.exec('DELETE FROM categories;');

    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, sort_order, collapsed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const c of backup.categories) {
      insertCat.run(
        c.id,
        c.name,
        c.sort_order ?? 1,
        c.collapsed ? 1 : 0,
        c.created_at || new Date().toISOString(),
        c.updated_at || new Date().toISOString()
      );
    }

    const insertL = db.prepare(`
      INSERT INTO links (
        id, category_id, title, url, description, icon, icon_type,
        is_favorite, open_new_tab, tags, click_count, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const l of backup.links) {
      insertL.run(
        l.id,
        l.category_id,
        l.title,
        l.url,
        l.description || '',
        l.icon || '',
        l.icon_type || 'favicon',
        l.is_favorite ? 1 : 0,
        l.open_new_tab !== undefined ? (l.open_new_tab ? 1 : 0) : 1,
        l.tags || '',
        l.click_count || 0,
        l.sort_order ?? 1,
        l.created_at || new Date().toISOString(),
        l.updated_at || new Date().toISOString()
      );
    }

    db.exec('COMMIT;');
    return true;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
