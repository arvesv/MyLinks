import React from 'react';
import { Star, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { LinkItem } from '../types';
import { IconRenderer } from '../icons/IconRenderer';

interface LinkListItemProps {
  link: LinkItem;
  isAdmin: boolean;
  onLinkClick: (link: LinkItem) => void;
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (link: LinkItem) => void;
  onToggleFavorite: (link: LinkItem) => void;
  onDragStart?: (e: React.DragEvent, linkId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetLinkId: string) => void;
}

export const LinkListItem: React.FC<LinkListItemProps> = ({
  link,
  isAdmin,
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
      className="group flex items-center justify-between gap-4 px-3.5 py-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all"
    >
      {/* Left: Icon + Title + Description */}
      <a
        href={link.url}
        target={link.open_new_tab ? '_blank' : '_self'}
        rel="noopener noreferrer"
        onClick={() => onLinkClick(link)}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center p-1.5 text-indigo-400 group-hover:bg-slate-700/80 transition-colors flex-shrink-0">
          <IconRenderer icon={link.icon} iconType={link.icon_type} className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <div className="flex items-center gap-1 font-medium text-slate-200 group-hover:text-indigo-300 transition-colors text-sm truncate">
            <span>{link.title}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
          </div>

          {link.description && (
            <span className="text-xs text-slate-400 truncate hidden md:inline">
              {link.description}
            </span>
          )}
        </div>
      </a>

      {/* Right: Tags + Clicks + Admin Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {tagsList.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 text-[11px]">
            {tagsList.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {link.click_count > 0 && (
          <span className="hidden sm:inline text-[11px] font-mono text-slate-500">
            {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
          </span>
        )}

        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onToggleFavorite(link)}
              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
              }`}
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onEditLink(link)}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDeleteLink(link)}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
