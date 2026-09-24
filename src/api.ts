import { Category, LinkItem, AuthUser, SystemInfo } from './types';

export async function getAuthUser(): Promise<AuthUser> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed to fetch auth');
  const data = await res.json();
  return data.user;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(name: string): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function updateCategory(id: string, updates: { name?: string; collapsed?: boolean; sort_order?: number }): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update category');
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete category');
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const res = await fetch('/api/categories/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw new Error('Failed to reorder categories');
}

export async function createLink(link: Partial<LinkItem>): Promise<LinkItem> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(link),
  });
  if (!res.ok) throw new Error('Failed to create link');
  return res.json();
}

export async function updateLink(id: string, updates: Partial<LinkItem>): Promise<void> {
  const res = await fetch(`/api/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update link');
}

export async function deleteLink(id: string): Promise<void> {
  const res = await fetch(`/api/links/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete link');
}

export async function reorderLinks(orderedIds: string[], categoryId?: string): Promise<void> {
  const res = await fetch('/api/links/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds, categoryId }),
  });
  if (!res.ok) throw new Error('Failed to reorder links');
}

export async function recordLinkClick(id: string): Promise<void> {
  try {
    await fetch(`/api/links/${id}/click`, { method: 'POST' });
  } catch (e) {
    // Non-blocking fire and forget
  }
}

export async function fetchUrlMetadata(url: string): Promise<{
  title: string;
  description: string;
  favicon: string;
  suggestedIcon?: string;
  suggestedIconType?: 'homelab' | 'lucide' | 'favicon';
}> {
  const res = await fetch('/api/metadata/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to fetch URL metadata');
  return res.json();
}

export async function uploadCustomIcon(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('icon', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload icon');
  const data = await res.json();
  return data.url;
}

export function downloadBackupUrl(): string {
  return '/api/backup/export';
}

export async function importBackup(payload: any): Promise<void> {
  const res = await fetch('/api/backup/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to import backup');
  }
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const res = await fetch('/api/system/info');
  if (!res.ok) throw new Error('Failed to fetch system info');
  return res.json();
}
