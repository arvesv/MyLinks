import React from 'react';
import { LinkHealth } from '../types';

interface HealthBadgeProps {
  health?: LinkHealth;
  onPing?: (e: React.MouseEvent) => void;
  isPinging?: boolean;
  showText?: boolean;
  className?: string;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  health,
  onPing,
  isPinging,
  showText = false,
  className = '',
}) => {
  if (!health && !isPinging) {
    return null;
  }

  const isOnline = health?.status === 'online';
  const isOffline = health?.status === 'offline';
  const isChecking = isPinging || health?.status === 'checking';

  let title = 'Service health not checked';
  if (isChecking) {
    title = 'Checking service availability...';
  } else if (isOnline) {
    title = `Online${health?.latencyMs !== undefined ? ` · ${health.latencyMs}ms` : ''}${
      health?.statusCode ? ` (HTTP ${health.statusCode})` : ''
    } — Click to re-check`;
  } else if (isOffline) {
    title = `Offline · ${health?.error || 'Unreachable'} — Click to re-check`;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onPing) {
      e.preventDefault();
      e.stopPropagation();
      onPing(e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isChecking}
      title={title}
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono transition-all ${
        onPing ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'
      } ${
        isChecking
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          : isOnline
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          : isOffline
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isChecking ? (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        ) : isOnline ? (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
        ) : null}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isChecking
              ? 'bg-indigo-500'
              : isOnline
              ? 'bg-emerald-500'
              : isOffline
              ? 'bg-rose-500'
              : 'bg-slate-400'
          }`}
        />
      </span>

      {showText && (
        <span className="font-sans font-medium text-[11px]">
          {isChecking ? (
            'Checking...'
          ) : isOnline ? (
            <span>{health?.latencyMs !== undefined ? `${health.latencyMs}ms` : 'Up'}</span>
          ) : isOffline ? (
            <span>Down</span>
          ) : (
            'Unknown'
          )}
        </span>
      )}
    </button>
  );
};
