import React from 'react';
import { Star } from 'lucide-react';
import { LinkItem, LinkHealth } from '../types';
import { IconRenderer } from '../icons/IconRenderer';
import { HealthBadge } from './HealthBadge';

interface FavoritesBarProps {
  favorites: LinkItem[];
  healthStatus?: Record<string, LinkHealth>;
  onLinkClick: (link: LinkItem) => void;
  onPingLink?: (link: LinkItem) => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  healthStatus,
  onLinkClick,
  onPingLink,
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400/90">
        <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
        <span>Favorites</span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {favorites.map(link => {
          const health = healthStatus?.[link.url];
          return (
            <a
              key={link.id}
              href={link.url}
              target={link.open_new_tab ? '_blank' : '_self'}
              rel="noopener noreferrer"
              onClick={() => onLinkClick(link)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/40 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/10 group flex-shrink-0"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/90 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-600/20 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors p-1">
                <IconRenderer icon={link.icon} iconType={link.icon_type} className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors whitespace-nowrap">
                {link.title}
              </span>
              {health && (
                <HealthBadge
                  health={health}
                  onPing={onPingLink ? () => onPingLink(link) : undefined}
                />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};
