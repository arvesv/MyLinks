import React, { useState, useEffect, useRef } from 'react';
import { Search, ExternalLink, X, CornerDownLeft } from 'lucide-react';
import { LinkItem, Category } from '../types';
import { IconRenderer } from '../icons/IconRenderer';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onLinkClick: (link: LinkItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  categories,
  onLinkClick,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all links with their category name
  const allLinks = categories.flatMap(cat =>
    (cat.links || []).map(link => ({
      ...link,
      categoryName: cat.name,
    }))
  );

  const filteredLinks = query.trim()
    ? allLinks.filter(l => {
        const q = query.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          l.tags.toLowerCase().includes(q) ||
          l.categoryName.toLowerCase().includes(q)
        );
      })
    : allLinks;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredLinks.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredLinks.length - 1));
    } else if (e.key === 'Enter' && filteredLinks[selectedIndex]) {
      e.preventDefault();
      const target = filteredLinks[selectedIndex];
      onLinkClick(target);
      window.open(target.url, target.open_new_tab ? '_blank' : '_self');
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search bookmarks, services, URLs, or tags..."
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No bookmarks matching "{query}"</p>
            </div>
          ) : (
            filteredLinks.map((link, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={link.id}
                  onClick={() => {
                    onLinkClick(link);
                    window.open(link.url, link.open_new_tab ? '_blank' : '_self');
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-950 dark:text-white border border-indigo-200 dark:border-indigo-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center p-1.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <IconRenderer icon={link.icon} iconType={link.icon_type} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{link.title}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                          {link.categoryName}
                        </span>
                      </div>
                      {link.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{link.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-300">
                        <CornerDownLeft className="w-3 h-3" /> Open
                      </span>
                    )}
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{filteredLinks.length} {filteredLinks.length === 1 ? 'bookmark' : 'bookmarks'}</span>
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="px-1 bg-slate-200 dark:bg-slate-800 rounded">↑</kbd> <kbd className="px-1 bg-slate-200 dark:bg-slate-800 rounded">↓</kbd></span>
            <span>Select: <kbd className="px-1 bg-slate-200 dark:bg-slate-800 rounded">↵</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};
