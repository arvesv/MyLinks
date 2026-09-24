import React from 'react';
import { Tag } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTag, onSelectTag }) => {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs">
      <div className="flex items-center gap-1 text-slate-400 mr-2 flex-shrink-0">
        <Tag className="w-3.5 h-3.5" />
        <span className="font-medium">Filter:</span>
      </div>

      <button
        onClick={() => onSelectTag(null)}
        className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex-shrink-0 ${
          selectedTag === null
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
      >
        All
      </button>

      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex-shrink-0 capitalize ${
            selectedTag === tag
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};
