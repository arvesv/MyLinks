export interface LinkItem {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  icon_type: 'homelab' | 'lucide' | 'favicon' | 'upload' | string;
  is_favorite: number | boolean;
  open_new_tab: number | boolean;
  tags: string;
  click_count: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  collapsed: number | boolean;
  links: LinkItem[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  authenticated: boolean;
  login: string;
  name: string;
  profilePic?: string;
  role: 'admin' | 'viewer';
  source: string;
}

export type ViewMode = 'grid' | 'compact' | 'table';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface LinkHealth {
  url: string;
  status: 'online' | 'offline' | 'unknown' | 'checking';
  statusCode?: number;
  latencyMs?: number;
  error?: string;
  checkedAt?: number;
}

export interface SystemInfo {
  version: string;
  gitCommitSha: string;
  gitCommitShort: string;
  gitBranch: string;
  commitUrl?: string;
  branchUrl?: string;
  buildTime: string;
  uptimeSeconds: number;
  startedAt: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  environment: string;
  database: {
    path: string;
    sizeBytes: number;
    totalCategories: number;
    totalLinks: number;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}
