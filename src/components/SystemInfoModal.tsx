import React, { useState, useEffect } from 'react';
import {
  X,
  GitCommit,
  Clock,
  Cpu,
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Server,
  Layers,
  HardDrive,
  Info,
} from 'lucide-react';
import { SystemInfo } from '../types';
import { getSystemInfo } from '../api';

interface SystemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemInfoModal: React.FC<SystemInfoModalProps> = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);
  const [currentUptime, setCurrentUptime] = useState<number>(0);

  const fetchInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemInfo();
      setInfo(data);
      setCurrentUptime(data.uptimeSeconds);
    } catch (err: any) {
      setError(err.message || 'Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInfo();
    }
  }, [isOpen]);

  // Live uptime ticker while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard shortcut to close (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const formatUptime = (seconds: number) => {
    if (seconds <= 0) return '0s';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Unknown';
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      });
    } catch {
      return isoString;
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return '';
    }
  };

  const heapPercentage =
    info && info.memory?.heapTotal > 0
      ? Math.round((info.memory.heapUsed / info.memory.heapTotal) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  System & Build Information
                </h3>
                <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                MyLinks v{info?.version || '0.1.0'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchInfo}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          {/* Section: Git Commit & Build */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <GitCommit className="w-4 h-4 text-indigo-500" />
              <span>Version Control & Build</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Commit SHA */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Git Commit SHA</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-slate-900 dark:text-white truncate" title={info?.gitCommitSha}>
                    {info?.gitCommitShort || 'Loading...'}
                  </span>
                  {info?.gitCommitSha && info.gitCommitSha !== 'dev' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopySha(info.gitCommitSha)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Copy full SHA"
                      >
                        {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {info.commitUrl && (
                        <a
                          href={info.commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                          title="View on GitHub"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Build Time */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Build Time</span>
                <div className="text-xs font-medium text-slate-900 dark:text-white">
                  {info?.buildTime ? formatDateTime(info.buildTime) : 'Loading...'}
                </div>
                {info?.buildTime && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    {formatRelativeTime(info.buildTime)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Server Runtime & Uptime */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Server className="w-4 h-4 text-emerald-500" />
              <span>Runtime & Availability</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {/* Uptime */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Uptime
                  </span>
                  <span className="text-[10px] text-emerald-500 font-mono">Live</span>
                </div>
                <div className="text-base font-mono font-semibold text-slate-900 dark:text-white">
                  {formatUptime(currentUptime)}
                </div>
              </div>

              {/* Started At */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Server Started</span>
                <div className="text-xs font-medium text-slate-900 dark:text-white">
                  {info?.startedAt ? formatDateTime(info.startedAt) : 'Loading...'}
                </div>
                {info?.startedAt && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    {formatRelativeTime(info.startedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Platform / Node.js row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Node.js</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{info?.nodeVersion || '—'}</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">OS & Arch</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {info?.platform ? `${info.platform} (${info.arch})` : '—'}
                </span>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Environment</span>
                <span className="capitalize font-medium text-slate-800 dark:text-slate-200">{info?.environment || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section: Memory & Database Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Memory Usage */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-violet-500" />
                  Memory Usage
                </span>
                <span className="font-mono text-[11px] text-slate-400">{heapPercentage}%</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-violet-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(heapPercentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span>Heap: {info ? formatBytes(info.memory.heapUsed) : '—'}</span>
                <span className="text-slate-400">/ {info ? formatBytes(info.memory.heapTotal) : '—'}</span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between">
                <span>RSS Resident</span>
                <span>{info ? formatBytes(info.memory.rss) : '—'}</span>
              </div>
            </div>

            {/* Database Stats */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Database className="w-4 h-4 text-amber-500" />
                <span>SQLite Database</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Categories</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {info?.database?.totalCategories ?? 0}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Bookmarks</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {info?.database?.totalLinks ?? 0}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between pt-1">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Size
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
                  {info ? formatBytes(info.database.sizeBytes) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Node.js {info?.nodeVersion} • SQLite</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
