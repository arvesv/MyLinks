import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { db } from './db';

const serverStartTime = new Date();

let cachedGitSha: string | null = null;
let cachedBuildTime: string | null = null;
let cachedVersion: string | null = null;

function loadBuildInfo() {
  if (cachedGitSha !== null && cachedBuildTime !== null && cachedVersion !== null) {
    return;
  }

  // 1. Check environment variables
  if (process.env.GIT_COMMIT_SHA && process.env.GIT_COMMIT_SHA !== 'unknown' && process.env.GIT_COMMIT_SHA !== 'dev') {
    cachedGitSha = process.env.GIT_COMMIT_SHA.trim();
  }

  if (process.env.BUILD_TIME && process.env.BUILD_TIME !== 'unknown') {
    cachedBuildTime = process.env.BUILD_TIME.trim();
  }

  // 2. Check dist/build-info.json
  try {
    const buildInfoPath = path.join(process.cwd(), 'dist', 'build-info.json');
    if (fs.existsSync(buildInfoPath)) {
      const data = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
      if (!cachedGitSha && data.gitCommitSha) cachedGitSha = data.gitCommitSha;
      if (!cachedBuildTime && data.buildTime) cachedBuildTime = data.buildTime;
      if (!cachedVersion && data.version) cachedVersion = data.version;
    }
  } catch {}

  // 3. Check package.json for version
  if (!cachedVersion) {
    try {
      const pkgPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.version) cachedVersion = pkg.version;
      }
    } catch {}
    if (!cachedVersion) cachedVersion = '0.1.0';
  }

  // 4. Fallback for git sha: execute git command if .git exists
  if (!cachedGitSha) {
    try {
      cachedGitSha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      cachedGitSha = 'dev';
    }
  }

  // 5. Fallback for build time
  if (!cachedBuildTime) {
    try {
      const bundlePath = path.join(process.cwd(), 'dist', 'server.js');
      if (fs.existsSync(bundlePath)) {
        cachedBuildTime = fs.statSync(bundlePath).mtime.toISOString();
      }
    } catch {}

    if (!cachedBuildTime) {
      cachedBuildTime = serverStartTime.toISOString();
    }
  }
}

export function getSystemInfo() {
  loadBuildInfo();

  const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  const dbPath = path.join(DATA_DIR, 'mylinks.db');
  let dbSizeBytes = 0;
  try {
    if (fs.existsSync(dbPath)) {
      dbSizeBytes = fs.statSync(dbPath).size;
    }
  } catch {}

  let totalCategories = 0;
  let totalLinks = 0;
  try {
    const catRow = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count?: number };
    totalCategories = catRow?.count || 0;
    const linkRow = db.prepare('SELECT COUNT(*) as count FROM links').get() as { count?: number };
    totalLinks = linkRow?.count || 0;
  } catch {}

  const uptimeSeconds = Math.floor(process.uptime());
  const mem = process.memoryUsage();
  const sha = cachedGitSha || 'dev';
  const shortSha = sha.length >= 7 ? sha.slice(0, 7) : sha;
  const commitUrl = sha && sha !== 'dev' ? `https://github.com/arvesv/MyLinks/commit/${sha}` : undefined;

  return {
    version: cachedVersion || '0.1.0',
    gitCommitSha: sha,
    gitCommitShort: shortSha,
    commitUrl,
    buildTime: cachedBuildTime || serverStartTime.toISOString(),
    uptimeSeconds,
    startedAt: serverStartTime.toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    environment: process.env.NODE_ENV || 'development',
    database: {
      path: dbPath,
      sizeBytes: dbSizeBytes,
      totalCategories,
      totalLinks,
    },
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
    },
  };
}
