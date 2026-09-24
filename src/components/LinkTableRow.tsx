import React, { useState } from 'react';
import { Star, Edit2, Trash2, ExternalLink, Copy, Check } from 'lucide-react';
import { LinkItem, LinkHealth } from '../types';
import { IconRenderer } from '../icons/IconRenderer';
import { HealthBadge } from './HealthBadge';

interface LinkTableRowProps {
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

export const LinkTableRow: React.FC<LinkTableRowProps> = ({
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
  const [copied, setCopied] = useState(false);
  const isFavorite = Boolean(link.is_favorite);
  const tagsList = link.tags ? link.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  // Parse protocol & display url
  let protocol = 'URL';
  let displayHost = link.url;
  try {
    const urlObj = new URL(link.url);
    protocol = urlObj.protocol.replace(':', '').toUpperCase();
    displayHost = urlObj.host + (urlObj.pathname !== '/' ? urlObj.pathname : '');
  } catch (e) {
    if (link.url.includes('://')) {
      protocol = link.url.split('://')[0].toUpperCase();
      displayHost = link.url.split('://')[1];
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
    } catch {
      return '—';
    }
  };

  return (
    <tr
      draggable={isAdmin}
      onDragStart={e => onDragStart && onDragStart(e, link.id)}
      onDragOver={e => onDragOver && onDragOver(e)}
      onDrop={e => onDrop && onDrop(e, link.id)}
      className="group hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-200 dark:border-slate-800/40 text-xs text-slate-700 dark:text-slate-300"
    >
      {/* Title & Icon & Favorite */}
      <td className="py-2.5 px-3 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => onToggleFavorite(link)}
              className={`p-0.5 rounded transition-colors ${
                isFavorite ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
              title={isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
            </button>
          )}

          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center p-1 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <IconRenderer icon={link.icon} iconType={link.icon_type} className="w-4 h-4" />
          </div>

          <a
            href={link.url}
            target={link.open_new_tab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={() => onLinkClick(link)}
            className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <span>{link.title}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </a>

          {health && (
            <HealthBadge
              health={health}
              onPing={onPing ? () => onPing(link) : undefined}
              showText={true}
            />
          )}
        </div>
      </td>

      {/* URL & Protocol */}
      <td className="py-2.5 px-3 max-w-[200px] lg:max-w-[280px]">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
              protocol === 'HTTPS'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : protocol === 'HTTP'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
            }`}
          >
            {protocol}
          </span>

          <span className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" title={link.url}>
            {displayHost}
          </span>

          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors opacity-0 group-hover:opacity-100"
            title="Copy URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </td>

      {/* Description */}
      <td className="py-2.5 px-3 max-w-[220px] hidden md:table-cell text-slate-500 dark:text-slate-400">
        <span className="truncate block" title={link.description || ''}>
          {link.description || '—'}
        </span>
      </td>

      {/* Tags */}
      <td className="py-2.5 px-3 hidden sm:table-cell">
        <div className="flex items-center gap-1 flex-wrap">
          {tagsList.length === 0 ? (
            <span className="text-slate-400 dark:text-slate-600">—</span>
          ) : (
            tagsList.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-transparent">
                #{tag}
              </span>
            ))
          )}
        </div>
      </td>

      {/* Clicks */}
      <td className="py-2.5 px-3 text-center hidden lg:table-cell whitespace-nowrap">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent">
          {link.click_count || 0}
        </span>
      </td>

      {/* Date Added */}
      <td className="py-2.5 px-3 text-center hidden xl:table-cell whitespace-nowrap text-slate-400 dark:text-slate-500 text-[11px]">
        {formatDate(link.created_at)}
      </td>

      {/* Actions */}
      <td className="py-2.5 px-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={link.url}
            target={link.open_new_tab ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={() => onLinkClick(link)}
            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
            title="Open link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {isAdmin && (
            <>
              <button
                onClick={() => onEditLink(link)}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
                title="Edit bookmark"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteLink(link)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
                title="Delete bookmark"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
