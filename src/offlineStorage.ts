import { Category, AuthUser, SystemInfo } from './types';

const SNAPSHOT_CATEGORIES_KEY = 'mylinks_cached_categories';
const SNAPSHOT_USER_KEY = 'mylinks_cached_user';
const SNAPSHOT_SYSINFO_KEY = 'mylinks_cached_sysinfo';
const SNAPSHOT_TIMESTAMP_KEY = 'mylinks_cached_timestamp';

export interface OfflineSnapshot {
  categories: Category[] | null;
  user: AuthUser | null;
  systemInfo: SystemInfo | null;
  timestamp: number | null;
}

export function loadOfflineSnapshot(): OfflineSnapshot {
  try {
    const rawCategories = localStorage.getItem(SNAPSHOT_CATEGORIES_KEY);
    const rawUser = localStorage.getItem(SNAPSHOT_USER_KEY);
    const rawSysInfo = localStorage.getItem(SNAPSHOT_SYSINFO_KEY);
    const rawTimestamp = localStorage.getItem(SNAPSHOT_TIMESTAMP_KEY);

    return {
      categories: rawCategories ? JSON.parse(rawCategories) : null,
      user: rawUser ? JSON.parse(rawUser) : null,
      systemInfo: rawSysInfo ? JSON.parse(rawSysInfo) : null,
      timestamp: rawTimestamp ? parseInt(rawTimestamp, 10) : null,
    };
  } catch (err) {
    console.warn('[Offline] Failed to load offline snapshot from localStorage:', err);
    return {
      categories: null,
      user: null,
      systemInfo: null,
      timestamp: null,
    };
  }
}

export function saveOfflineSnapshot(data: {
  categories?: Category[];
  user?: AuthUser | null;
  systemInfo?: SystemInfo | null;
}): void {
  try {
    if (data.categories !== undefined) {
      localStorage.setItem(SNAPSHOT_CATEGORIES_KEY, JSON.stringify(data.categories));
    }
    if (data.user !== undefined) {
      if (data.user === null) {
        localStorage.removeItem(SNAPSHOT_USER_KEY);
      } else {
        localStorage.setItem(SNAPSHOT_USER_KEY, JSON.stringify(data.user));
      }
    }
    if (data.systemInfo !== undefined) {
      if (data.systemInfo === null) {
        localStorage.removeItem(SNAPSHOT_SYSINFO_KEY);
      } else {
        localStorage.setItem(SNAPSHOT_SYSINFO_KEY, JSON.stringify(data.systemInfo));
      }
    }
    localStorage.setItem(SNAPSHOT_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    console.warn('[Offline] Failed to save offline snapshot to localStorage:', err);
  }
}
