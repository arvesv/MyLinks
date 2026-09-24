import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FavoritesBar } from './components/FavoritesBar';
import { TagFilter } from './components/TagFilter';
import { FrequentlyUsed } from './components/FrequentlyUsed';
import { CategorySection } from './components/CategorySection';
import { SearchModal } from './components/SearchModal';
import { LinkModal } from './components/LinkModal';
import { CategoryModal } from './components/CategoryModal';
import { BackupModal } from './components/BackupModal';
import { SystemInfoModal } from './components/SystemInfoModal';
import { Category, LinkItem, AuthUser, ViewMode, SystemInfo } from './types';
import {
  getAuthUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  recordLinkClick,
  getSystemInfo,
} from './api';
import { loadOfflineSnapshot, saveOfflineSnapshot } from './offlineStorage';
import { Loader2, WifiOff, RefreshCw } from 'lucide-react';

export function App() {
  const initialSnapshot = useMemo(() => loadOfflineSnapshot(), []);
  const [user, setUser] = useState<AuthUser | null>(initialSnapshot.user);
  const [categories, setCategories] = useState<Category[]>(initialSnapshot.categories || []);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(initialSnapshot.systemInfo);
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<number | null>(initialSnapshot.timestamp);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(() => !initialSnapshot.categories);

  // Settings & display modes
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('mylinks_view_mode') as ViewMode) || 'grid';
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal states
  const [searchOpen, setSearchOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [systemInfoModalOpen, setSystemInfoModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<LinkItem | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(undefined);

  // System theme synchronization (follows OS/browser standard)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    handleThemeChange(mediaQuery);
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Load dashboard data and update local offline snapshot
  const loadData = async (isManualRetry = false) => {
    if (isManualRetry) setIsRetrying(true);
    try {
      const [userData, categoriesData, sysInfo] = await Promise.all([
        getAuthUser().catch(() => null),
        getCategories(),
        getSystemInfo().catch(() => null),
      ]);
      setUser(userData);
      setCategories(categoriesData);
      if (sysInfo) setSystemInfo(sysInfo);
      setIsOnline(true);
      const now = Date.now();
      setSnapshotTimestamp(now);
      saveOfflineSnapshot({
        categories: categoriesData,
        user: userData,
        systemInfo: sysInfo,
      });
    } catch (err: any) {
      console.warn('[Offline] Failed to load data from server; operating in offline/cached mode:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
      if (isManualRetry) setIsRetrying(false);
    }
  };

  // Connectivity monitoring (online/offline window events)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadData();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (navigator.onLine) {
        getSystemInfo()
          .then((info) => {
            setSystemInfo(info);
            setIsOnline(true);
          })
          .catch(() => {
            setIsOnline(false);
          });
      } else {
        setIsOnline(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // View mode persistence
  useEffect(() => {
    localStorage.setItem('mylinks_view_mode', viewMode);
  }, [viewMode]);

  // Global hotkeys (Ctrl+K and /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Extract all links & tags
  const allLinks = useMemo(() => {
    return categories.flatMap(c => c.links || []);
  }, [categories]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const link of allLinks) {
      if (link.tags) {
        link.tags.split(',').forEach(t => {
          const clean = t.trim().toLowerCase();
          if (clean) tagSet.add(clean);
        });
      }
    }
    return Array.from(tagSet).sort();
  }, [allLinks]);

  const favorites = useMemo(() => {
    return allLinks.filter(l => Boolean(l.is_favorite));
  }, [allLinks]);

  // Filtered categories based on selected tag
  const filteredCategories = useMemo(() => {
    if (!selectedTag) return categories;
    return categories
      .map(cat => ({
        ...cat,
        links: (cat.links || []).filter(l =>
          l.tags && l.tags.toLowerCase().split(',').map(t => t.trim()).includes(selectedTag.toLowerCase())
        ),
      }))
      .filter(cat => cat.links.length > 0);
  }, [categories, selectedTag]);

  // Link interactions
  const handleLinkClick = (link: LinkItem) => {
    if (isOnline) {
      recordLinkClick(link.id);
    }
    setCategories(prev =>
      prev.map(c => ({
        ...c,
        links: (c.links || []).map(l =>
          l.id === link.id ? { ...l, click_count: (l.click_count || 0) + 1 } : l
        ),
      }))
    );
  };

  const handleToggleFavorite = async (link: LinkItem) => {
    const newStatus = !link.is_favorite;
    await updateLink(link.id, { is_favorite: newStatus });
    setCategories(prev =>
      prev.map(c => ({
        ...c,
        links: (c.links || []).map(l =>
          l.id === link.id ? { ...l, is_favorite: newStatus } : l
        ),
      }))
    );
  };

  const handleOpenAddLink = (categoryId?: string) => {
    setLinkToEdit(null);
    setTargetCategoryId(categoryId || categories[0]?.id);
    setLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: LinkItem) => {
    setLinkToEdit(link);
    setTargetCategoryId(link.category_id);
    setLinkModalOpen(true);
  };

  const handleDeleteLink = async (link: LinkItem) => {
    if (!confirm(`Delete bookmark "${link.title}"?`)) return;
    await deleteLink(link.id);
    setCategories(prev =>
      prev.map(c => ({
        ...c,
        links: (c.links || []).filter(l => l.id !== link.id),
      }))
    );
  };

  const handleSaveLink = async (data: Partial<LinkItem>) => {
    if (linkToEdit) {
      await updateLink(linkToEdit.id, data);
    } else {
      await createLink(data);
    }
    await loadData();
  };

  // Category interactions
  const handleToggleCollapse = async (categoryId: string, collapsed: boolean) => {
    await updateCategory(categoryId, { collapsed });
    setCategories(prev =>
      prev.map(c => (c.id === categoryId ? { ...c, collapsed } : c))
    );
  };

  const handleCreateCategory = async (name: string) => {
    await createCategory(name);
    await loadData();
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    await updateCategory(id, { name });
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, name } : c))
    );
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    const idx = categories.findIndex(c => c.id === category.id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const newOrder = [...categories];
    const [moved] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, moved);

    setCategories(newOrder);
    await reorderCategories(newOrder.map(c => c.id));
  };

  const handleReorderCategories = async (orderedIds: string[]) => {
    await reorderCategories(orderedIds);
    await loadData();
  };

  const handleReorderLinks = async (categoryId: string, orderedIds: string[]) => {
    await reorderLinks(orderedIds, categoryId);
    setCategories(prev =>
      prev.map(c => {
        if (c.id !== categoryId) return c;
        const linkMap = new Map((c.links || []).map(l => [l.id, l]));
        const reordered = orderedIds.map(id => linkMap.get(id)).filter(Boolean) as LinkItem[];
        return { ...c, links: reordered };
      })
    );
  };

  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin && isOnline;

  const formattedSnapshotTime = useMemo(() => {
    if (!snapshotTimestamp) return null;
    const date = new Date(snapshotTimestamp);
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [snapshotTimestamp]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading MyLinks...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        user={user}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAddLink={() => handleOpenAddLink()}
        onOpenCategories={() => setCategoryModalOpen(true)}
        onOpenBackup={() => setBackupModalOpen(true)}
        onOpenSystemInfo={() => setSystemInfoModalOpen(true)}
        systemInfo={systemInfo}
        isOnline={isOnline}
      />

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/30 text-amber-800 dark:text-amber-300 px-4 py-2.5 text-xs transition-colors sticky top-16 z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                <strong>Offline Mode:</strong> Showing cached snapshot of your dashboard{formattedSnapshotTime ? ` (${formattedSnapshotTime})` : ''}. All bookmarks remain clickable, but changes are disabled while disconnected.
              </span>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-medium text-xs border border-amber-500/30 transition-all cursor-pointer flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Connecting...' : 'Retry Connection'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pinned Favorites Bar */}
        <FavoritesBar favorites={favorites} onLinkClick={handleLinkClick} />

        {/* Global Tag Filter Chips */}
        <TagFilter tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />

        {/* Frequently Used Links */}
        {!selectedTag && (
          <FrequentlyUsed
            links={allLinks}
            viewMode={viewMode}
            isAdmin={canEdit}
            onLinkClick={handleLinkClick}
            onEditLink={handleOpenEditLink}
            onDeleteLink={handleDeleteLink}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Categories and Bookmarks */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 px-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No bookmarks found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {selectedTag ? `No bookmarks tagged with #${selectedTag}` : 'Create a category or add your first link to get started.'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category, idx) => (
            <CategorySection
              key={category.id}
              category={category}
              viewMode={viewMode}
              isAdmin={canEdit}
              isFirst={idx === 0}
              isLast={idx === filteredCategories.length - 1}
              onToggleCollapse={handleToggleCollapse}
              onLinkClick={handleLinkClick}
              onAddLinkToCategory={handleOpenAddLink}
              onEditCategory={() => setCategoryModalOpen(true)}
              onDeleteCategory={cat => handleDeleteCategory(cat.id)}
              onMoveCategory={handleMoveCategory}
              onEditLink={handleOpenEditLink}
              onDeleteLink={handleDeleteLink}
              onToggleFavorite={handleToggleFavorite}
              onReorderLinks={handleReorderLinks}
            />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>MyLinks — Homelab Startpage & Bookmark Hub</span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setSystemInfoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/80 transition-colors font-mono text-[11px] cursor-pointer"
              title="Click to view System & Build Info (Git SHA, build time, uptime)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>v{systemInfo?.version || '0.1.0'}</span>
              {systemInfo?.gitCommitShort && (
                <span>
                  ({systemInfo.gitBranch ? `${systemInfo.gitBranch}@` : ''}{systemInfo.gitCommitShort})
                </span>
              )}
              {systemInfo?.uptimeSeconds !== undefined && (
                <>
                  <span>•</span>
                  <span>
                    Uptime: {systemInfo.uptimeSeconds >= 86400
                      ? `${Math.floor(systemInfo.uptimeSeconds / 86400)}d ${Math.floor((systemInfo.uptimeSeconds % 86400) / 3600)}h`
                      : systemInfo.uptimeSeconds >= 3600
                      ? `${Math.floor(systemInfo.uptimeSeconds / 3600)}h ${Math.floor((systemInfo.uptimeSeconds % 3600) / 60)}m`
                      : `${Math.floor(systemInfo.uptimeSeconds / 60)}m`}
                  </span>
                </>
              )}
            </button>

            <span>•</span>
            <span>Tailnet Connected</span>
            <span>•</span>
            <button onClick={() => setSearchOpen(true)} className="hover:text-slate-700 dark:hover:text-slate-300">
              Search (<kbd className="text-[10px]">Ctrl+K</kbd>)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        categories={categories}
        onLinkClick={handleLinkClick}
      />

      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        categories={categories}
        initialCategoryId={targetCategoryId}
        linkToEdit={linkToEdit}
        onSave={handleSaveLink}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategories={handleReorderCategories}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        onRefreshData={loadData}
      />

      <SystemInfoModal
        isOpen={systemInfoModalOpen}
        onClose={() => setSystemInfoModalOpen(false)}
      />
    </div>
  );
}

export default App;
