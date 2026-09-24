import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Category, LinkItem, ViewMode, LinkHealth } from '../types';
import { LinkCard } from './LinkCard';
import { LinkListItem } from './LinkListItem';
import { LinkTableRow } from './LinkTableRow';

interface CategorySectionProps {
  category: Category;
  viewMode: ViewMode;
  isAdmin: boolean;
  isFirst: boolean;
  isLast: boolean;
  healthStatus?: Record<string, LinkHealth>;
  onPingLink?: (link: LinkItem) => void;
  onToggleCollapse: (categoryId: string, collapsed: boolean) => void;
  onLinkClick: (link: LinkItem) => void;
  onAddLinkToCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onMoveCategory: (category: Category, direction: 'up' | 'down') => void;
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (link: LinkItem) => void;
  onToggleFavorite: (link: LinkItem) => void;
  onReorderLinks: (categoryId: string, orderedIds: string[]) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  viewMode,
  isAdmin,
  isFirst,
  isLast,
  healthStatus,
  onPingLink,
  onToggleCollapse,
  onLinkClick,
  onAddLinkToCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
  onEditLink,
  onDeleteLink,
  onToggleFavorite,
  onReorderLinks,
}) => {
  const isCollapsed = Boolean(category.collapsed);
  const links = category.links || [];
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);

  const handleDragStart = (_e: React.DragEvent, linkId: string) => {
    setDraggedLinkId(linkId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetLinkId: string) => {
    e.preventDefault();
    if (!draggedLinkId || draggedLinkId === targetLinkId) return;

    const currentIds = links.map(l => l.id);
    const fromIndex = currentIds.indexOf(draggedLinkId);
    const toIndex = currentIds.indexOf(targetLinkId);

    if (fromIndex === -1 || toIndex === -1) return;

    const newIds = [...currentIds];
    const [moved] = newIds.splice(fromIndex, 1);
    newIds.splice(toIndex, 0, moved);

    setDraggedLinkId(null);
    onReorderLinks(category.id, newIds);
  };

  return (
    <section className="mb-10">
      {/* Category Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800 group">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleCollapse(category.id, !isCollapsed)}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand category' : 'Collapse category'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <h2
            onClick={() => onToggleCollapse(category.id, !isCollapsed)}
            className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-2.5"
          >
            {category.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-medium border border-slate-200 dark:border-transparent">
              {links.length}
            </span>
          </h2>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAddLinkToCategory(category.id)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors"
              title="Add link to this category"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>

            {!isFirst && (
              <button
                onClick={() => onMoveCategory(category, 'up')}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Move category up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}

            {!isLast && (
              <button
                onClick={() => onMoveCategory(category, 'down')}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Move category down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onEditCategory(category)}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Rename category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDeleteCategory(category)}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Category Links Body */}
      {!isCollapsed && (
        links.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
            <p className="text-sm text-slate-500 dark:text-slate-400">No bookmarks in this category yet.</p>
            {isAdmin && (
              <button
                onClick={() => onAddLinkToCategory(category.id)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add your first link
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {links.map(link => (
              <LinkCard
                key={link.id}
                link={link}
                isAdmin={isAdmin}
                health={healthStatus?.[link.url]}
                onPing={onPingLink}
                onLinkClick={onLinkClick}
                onEditLink={onEditLink}
                onDeleteLink={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        ) : viewMode === 'compact' ? (
          <div className="flex flex-col gap-2">
            {links.map(link => (
              <LinkListItem
                key={link.id}
                link={link}
                isAdmin={isAdmin}
                health={healthStatus?.[link.url]}
                onPing={onPingLink}
                onLinkClick={onLinkClick}
                onEditLink={onEditLink}
                onDeleteLink={onDeleteLink}
                onToggleFavorite={onToggleFavorite}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
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
                {links.map(link => (
                  <LinkTableRow
                    key={link.id}
                    link={link}
                    isAdmin={isAdmin}
                    health={healthStatus?.[link.url]}
                    onPing={onPingLink}
                    onLinkClick={onLinkClick}
                    onEditLink={onEditLink}
                    onDeleteLink={onDeleteLink}
                    onToggleFavorite={onToggleFavorite}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
};
