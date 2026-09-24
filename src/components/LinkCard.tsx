import React from 'react';
import { Star, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { LinkItem, LinkHealth } from '../types';
import { IconRenderer } from '../icons/IconRenderer';
import { HealthBadge } from './HealthBadge';

interface LinkCardProps {
  link: LinkItem;
  isAdmin: boolean;
  health?: LinkHealth;
  onPing?: (link: LinkItem) => void;
  onLinkClick: (link: LinkItem) => void;
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (link: LinkItem) => void;
  onToggleFavorite: (link: LinkItem) => void;
  onDragStart?: (e: React.DragEvent, linkId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetLinkId: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  isAdmin,
  health,
  onPing,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isFavorite = Boolean(link.is_favorite);
  const tagsList = link.tags ? link.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div
      draggable={isAdmin}
      onDragStart={e => onDragStart && onDragStart(e, link.id)}
      onDragOver={e => onDragOver && onDragOver(e)}
      onDrop={e => onDrop && onDrop(e, link.id)}
      className="group relative bg-white hover:bg-slate-50/80 dark:bg-slate-900/70 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 shadow-sm dark:shadow-none hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Icon + Admin Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center p-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-all flex-shrink-0">
              <IconRenderer icon={link.icon} iconType={link.icon_type} className="w-7 h-7" />
            </div>
            {health && (
              <HealthBadge
                health={health}
                onPing={onPing ? () => onPing(link) : undefined}
              />
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(link);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isFavorite
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditLink(link);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Edit bookmark"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteLink(link);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Link Click Area */}
        <a
          href={link.url}
          target={link.open_new_tab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          onClick={() => onLinkClick(link)}
          className="block"
        >
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors text-base line-clamp-1">
            <span>{link.title}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
          </div>

          {link.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {link.description}
            </p>
          )}
        </a>
      </div>

      {/* Footer: Tags & Clicks */}
      {(tagsList.length > 0 || link.click_count > 0) && (
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500">
          <div className="flex items-center gap-1 overflow-hidden">
            {tagsList.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-transparent">
                #{tag}
              </span>
            ))}
            {tagsList.length > 3 && (
              <span className="text-slate-400 dark:text-slate-500">+{tagsList.length - 3}</span>
            )}
          </div>

          {link.click_count > 0 && (
            <span className="text-slate-500 font-mono text-[10px]" title="Clicks">
              {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
