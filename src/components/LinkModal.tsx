import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Star, ExternalLink } from 'lucide-react';
import { LinkItem, Category } from '../types';
import { IconPicker } from './IconPicker';
import { fetchUrlMetadata } from '../api';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategoryId?: string;
  linkToEdit?: LinkItem | null;
  onSave: (linkData: Partial<LinkItem>) => Promise<void>;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  linkToEdit,
  onSave,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [icon, setIcon] = useState('');
  const [iconType, setIconType] = useState('favicon');
  const [autoFavicon, setAutoFavicon] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [openNewTab, setOpenNewTab] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (linkToEdit) {
        setUrl(linkToEdit.url || '');
        setTitle(linkToEdit.title || '');
        setDescription(linkToEdit.description || '');
        setCategoryId(linkToEdit.category_id || categories[0]?.id || '');
        setIcon(linkToEdit.icon || '');
        setIconType(linkToEdit.icon_type || 'favicon');
        setAutoFavicon('');
        setTags(linkToEdit.tags || '');
        setIsFavorite(Boolean(linkToEdit.is_favorite));
        setOpenNewTab(linkToEdit.open_new_tab !== undefined ? Boolean(linkToEdit.open_new_tab) : true);
      } else {
        setUrl('');
        setTitle('');
        setDescription('');
        setCategoryId(initialCategoryId || categories[0]?.id || '');
        setIcon('Bookmark');
        setIconType('lucide');
        setAutoFavicon('');
        setTags('');
        setIsFavorite(false);
        setOpenNewTab(true);
      }
    }
  }, [isOpen, linkToEdit, initialCategoryId, categories]);

  const handleFetchMetadata = async () => {
    if (!url.trim()) return;

    try {
      setLoadingMetadata(true);
      const meta = await fetchUrlMetadata(url.trim());
      if (meta.title && !title) setTitle(meta.title);
      if (meta.description && !description) setDescription(meta.description);
      if (meta.favicon) setAutoFavicon(meta.favicon);

      if (meta.suggestedIcon && meta.suggestedIconType) {
        setIcon(meta.suggestedIcon);
        setIconType(meta.suggestedIconType);
      } else if (meta.favicon && iconType !== 'homelab') {
        setIcon(meta.favicon);
        setIconType('favicon');
      }
    } catch (e: any) {
      // Ignored or friendly notification
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim() || !categoryId) return;

    try {
      setSaving(true);
      await onSave({
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId,
        icon: icon || undefined,
        icon_type: iconType,
        tags: tags.trim() || undefined,
        is_favorite: isFavorite,
        open_new_tab: openNewTab,
      });
      onClose();
    } catch (err: any) {
      alert('Error saving bookmark: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {linkToEdit ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Input & Auto-fetch */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
              URL *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                onBlur={() => {
                  if (url && !title && !linkToEdit) handleFetchMetadata();
                }}
                placeholder="https://homeassistant.local:8123 or obsidian://open"
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleFetchMetadata}
                disabled={loadingMetadata || !url.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl transition-colors disabled:opacity-50"
                title="Auto-detect title, description, and icon"
              >
                {loadingMetadata ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Auto-fetch</span>
              </button>
            </div>
          </div>

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Home Assistant"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Smart home automation hub"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Icon Picker Component */}
          <IconPicker
            currentIcon={icon}
            currentIconType={iconType}
            autoFaviconUrl={autoFavicon}
            onChange={(selectedIcon, selectedType) => {
              setIcon(selectedIcon);
              setIconType(selectedType);
            }}
          />

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="iot, automation, home"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Checkboxes: Favorite & Open in New Tab */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={e => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:ring-0"
              />
              <span className="flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                Pin to Favorites bar
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={openNewTab}
                onChange={e => setOpenNewTab(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:ring-0"
              />
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                Open in new tab
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : linkToEdit ? 'Save Changes' : 'Create Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
