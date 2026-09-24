import React, { useState } from 'react';
import { Flame, ChevronDown, ChevronRight } from 'lucide-react';
import { LinkItem, ViewMode } from '../types';
import { LinkCard } from './LinkCard';
import { LinkListItem } from './LinkListItem';

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
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400/30" />
            <h2 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
              Frequently Used
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
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
        ) : (
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
        )
      )}
    </div>
  );
};
