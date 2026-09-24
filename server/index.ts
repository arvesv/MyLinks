import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import crypto from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config();

import {
  initDatabase,
  getAllCategoriesWithLinks,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  incrementClickCount,
  exportBackup,
  importBackup,
} from './db';

import { tailscaleAuthMiddleware, requireAdmin } from './auth';
import { fetchUrlMetadata } from './metadata';
import { getSystemInfo } from './system';

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Setup multer for custom icon uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const unique = crypto.randomUUID().slice(0, 10);
    cb(null, `icon-${unique}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

app.use(cors());
app.use(express.json());

// Serve uploaded icons
app.use('/uploads', express.static(UPLOADS_DIR));

// Apply Tailscale auth middleware to all /api routes
app.use('/api', tailscaleAuthMiddleware);

// --- Auth & System Endpoints ---
app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/system/info', (_req, res) => {
  try {
    const info = getSystemInfo();
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Categories & Links Endpoints ---
app.get('/api/categories', (_req, res) => {
  try {
    const data = getAllCategoriesWithLinks();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', requireAdmin, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const cat = createCategory(name.trim());
    res.status(201).json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
  try {
    const { name, collapsed, sort_order } = req.body;
    updateCategory(req.params.id as string, { name, collapsed, sort_order });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  try {
    deleteCategory(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories/reorder', requireAdmin, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    reorderCategories(orderedIds);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Links Endpoints ---
app.post('/api/links', requireAdmin, (req, res) => {
  try {
    const { category_id, title, url, description, icon, icon_type, is_favorite, open_new_tab, tags } = req.body;
    if (!category_id || !title || !url) {
      return res.status(400).json({ error: 'category_id, title, and url are required' });
    }
    const link = createLink({
      category_id,
      title: title.trim(),
      url: url.trim(),
      description,
      icon,
      icon_type,
      is_favorite,
      open_new_tab,
      tags,
    });
    res.status(201).json(link);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/links/:id', requireAdmin, (req, res) => {
  try {
    updateLink(req.params.id as string, req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/links/:id', requireAdmin, (req, res) => {
  try {
    deleteLink(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/links/reorder', requireAdmin, (req, res) => {
  try {
    const { orderedIds, categoryId } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    reorderLinks(orderedIds, categoryId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/links/:id/click', (req, res) => {
  try {
    incrementClickCount(req.params.id as string);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Metadata Fetching ---
app.post('/api/metadata/fetch', requireAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const metadata = await fetchUrlMetadata(url);
    res.json(metadata);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Icon Upload ---
app.post('/api/upload', requireAdmin, upload.single('icon'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Backup & Restore ---
app.get('/api/backup/export', requireAdmin, (_req, res) => {
  try {
    const backup = exportBackup();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mylinks-backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backup/import', requireAdmin, (req, res) => {
  try {
    importBackup(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Serve Frontend Static Build (Production) ---
const clientDist = path.join(process.cwd(), 'dist', 'client');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 MyLinks server running on http://localhost:${PORT}`);
  console.log(`📂 Data directory: ${DATA_DIR}`);
});
