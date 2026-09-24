import React, { useState } from 'react';
import { Flame, ChevronDown, ChevronRight } from 'lucide-react';
import { LinkItem, ViewMode } from '../types';
import { LinkCard } from './LinkCard';
import { LinkListItem } from './LinkListItem';
import { LinkTableRow } from './LinkTableRow';

interface FrequentlyUsedProps {
  links: LinkItem[];
  viewMode: ViewMode;
  isAdmin: boolean;
  onLinkClick: (link: LinkItem) => void;
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (link: LinkItem) => void;
  onToggleFavorite: (link: LinkItem) => void;
}

export const FrequentlyUsed: React.FC<FrequentlyUsedProps> = ({
  links,
  viewMode,
  isAdmin,
  onLinkClick,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Filter links with click_count > 0, sort descending, take top 6
  const frequentLinks = links
    .filter(l => l.click_count > 0)
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 6);

  if (frequentLinks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 group text-left"
        >
          <div className="p-1 rounded-md bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 fill-orange-500/30 dark:fill-orange-400/30" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Frequently Used
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-transparent">
              {frequentLinks.length}
            </span>
          </div>
        </button>
      </div>

      {!collapsed && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {frequentLinks.map(link => (
              <LinkCard
                key={`freq-${link.id}`}
                link={link}
                isAdmin={isAdmin}
                onLinkClick={onLinkClick}
                onEditLink={onEditLink}
                onDeleteLink={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : viewMode === 'compact' ? (
          <div className="flex flex-col gap-2">
            {frequentLinks.map(link => (
              <LinkListItem
                key={`freq-${link.id}`}
                link={link}
                isAdmin={isAdmin}
                onLinkClick={onLinkClick}
                onEditLink={onEditLink}
                onDeleteLink={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm dark:shadow-none backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Service / Title</th>
                  <th className="py-2.5 px-3">URL & Protocol</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">Description</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Tags</th>
                  <th className="py-2.5 px-3 text-center hidden lg:table-cell">Clicks</th>
                  <th className="py-2.5 px-3 text-center hidden xl:table-cell">Added</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {frequentLinks.map(link => (
                  <LinkTableRow
                    key={`freq-${link.id}`}
                    link={link}
                    isAdmin={isAdmin}
                    onLinkClick={onLinkClick}
                    onEditLink={onEditLink}
                    onDeleteLink={onDeleteLink}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
