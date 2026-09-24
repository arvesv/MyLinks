import React from 'react';
import { Search, LayoutGrid, List, Table, Plus, FolderKanban, Download, Shield, User as UserIcon, Info } from 'lucide-react';
import { AuthUser, ViewMode, SystemInfo } from '../types';

interface NavbarProps {
  user: AuthUser | null;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenSearch: () => void;
  onOpenAddLink: () => void;
  onOpenCategories: () => void;
  onOpenBackup: () => void;
  onOpenSystemInfo: () => void;
  systemInfo?: SystemInfo | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  viewMode,
  onSetViewMode,
  onOpenSearch,
  onOpenAddLink,
  onOpenCategories,
  onOpenBackup,
  onOpenSystemInfo,
  systemInfo,
}) => {
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              MyLinks
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Tailnet
              </span>
              <button
                onClick={onOpenSystemInfo}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700/70 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer"
                title="View System & Build Info (Git SHA, build time, uptime)"
              >
                <span>v{systemInfo?.version || '0.1.0'}</span>
                {systemInfo?.gitCommitShort && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    ({systemInfo.gitCommitShort})
                  </span>
                )}
              </button>
            </h1>
          </div>
        </div>

        {/* Global Search Bar (Trigger) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl transition-all shadow-inner group"
          >
            <span className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span>Search bookmarks, services, or tags...</span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Action Controls & User Identity */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* View Mode Segmented Control */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5" role="group" aria-label="View mode">
            <button
              onClick={() => onSetViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetViewMode('compact')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'compact'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
              title="Dense Detailed Table (Shows URL, Protocol, Tags, Dates, and Details)"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {/* System Info Button */}
          <button
            onClick={onOpenSystemInfo}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="System & Build Info (Git commit SHA, build time, uptime)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Admin Action Buttons */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={onOpenCategories}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-colors"
                title="Manage Categories"
              >
                <FolderKanban className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Categories</span>
              </button>

              <button
                onClick={onOpenBackup}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-colors"
                title="Backup & Restore"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Backup</span>
              </button>

              <button
                onClick={onOpenAddLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            </div>
          )}

          {/* User Profile / Tailscale Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
              {user.profilePic ? (
                <img src={user.profilePic} alt="" className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="font-medium text-slate-800 dark:text-slate-200 leading-tight">{user.name || user.login}</div>
                <div className="flex items-center gap-1 text-[10px]">
                  {isAdmin ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">Viewer</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
