import React, { useState } from 'react';
import { X, Plus, ArrowUp, ArrowDown, Edit2, Trash2, Check } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (orderedIds: string[]) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setLoading(true);
      await onCreateCategory(newCatName.trim());
      setNewCatName('');
    } catch (err: any) {
      alert('Failed to create category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      setLoading(true);
      await onUpdateCategory(id, editName.trim());
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to update category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    try {
      await onReorderCategories(newOrder.map(c => c.id));
    } catch (err: any) {
      alert('Failed to reorder: ' + err.message);
    }
  };

  const handleDelete = async (cat: Category) => {
    const linkCount = cat.links?.length || 0;
    const msg = linkCount > 0
      ? `Delete category "${cat.name}" and all ${linkCount} bookmarks inside it?`
      : `Delete category "${cat.name}"?`;
    if (!confirm(msg)) return;

    try {
      setLoading(true);
      await onDeleteCategory(cat.id);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Manage Categories</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              required
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="New category name (e.g. Smart Home)"
              className="flex-1 px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !newCatName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-sm bg-slate-900 border border-indigo-500 rounded-lg text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-sm text-slate-200">{cat.name}</span>
                      <span className="ml-2 text-xs text-slate-500">({cat.links?.length || 0} links)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
