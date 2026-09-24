import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';
import { HOMELAB_ICONS } from '../icons/homelabIcons';
import { POPULAR_LUCIDE_ICONS, IconRenderer } from '../icons/IconRenderer';
import { uploadCustomIcon } from '../api';

interface IconPickerProps {
  currentIcon: string;
  currentIconType: string;
  autoFaviconUrl?: string;
  onChange: (icon: string, iconType: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  currentIcon,
  currentIconType,
  autoFaviconUrl,
  onChange,
}) => {
  const [tab, setTab] = useState<'homelab' | 'lucide' | 'favicon' | 'upload'>(
    (currentIconType as any) || 'homelab'
  );
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState(currentIconType === 'favicon' ? currentIcon : '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadCustomIcon(file);
      onChange(url, 'upload');
      setTab('upload');
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Icon Selection
        </label>
        {/* Preview */}
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <span>Selected:</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 text-indigo-600 dark:text-indigo-400">
            <IconRenderer icon={currentIcon} iconType={currentIconType} className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setTab('homelab')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
            tab === 'homelab' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Homelab Brands
        </button>
        <button
          type="button"
          onClick={() => setTab('lucide')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
            tab === 'lucide' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Icons
        </button>
        <button
          type="button"
          onClick={() => setTab('favicon')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
            tab === 'favicon' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Favicon / URL
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
            tab === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Tab Panels */}
      {tab === 'homelab' && (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80">
          {Object.entries(HOMELAB_ICONS).map(([key, item]) => {
            const isSelected = currentIcon === key && currentIconType === 'homelab';
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key, 'homelab')}
                className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={item.label}
              >
                {item.svg('w-5 h-5')}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'lucide' && (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80">
          {POPULAR_LUCIDE_ICONS.map(name => {
            const isSelected = currentIcon === name && currentIconType === 'lucide';
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name, 'lucide')}
                className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={name}
              >
                <IconRenderer icon={name} iconType="lucide" className="w-5 h-5" />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[9px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'favicon' && (
        <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80">
          {autoFaviconUrl && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <img src={autoFaviconUrl} alt="" className="w-5 h-5 rounded object-contain" />
                <span className="text-xs text-slate-700 dark:text-slate-300">Website Favicon</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange(autoFaviconUrl, 'favicon');
                  setCustomUrl(autoFaviconUrl);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors"
              >
                Use this
              </button>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Direct Image / Icon URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => {
                  setCustomUrl(e.target.value);
                  onChange(e.target.value, 'favicon');
                }}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center">
          <label className="cursor-pointer block border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/60 rounded-xl p-4 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              {uploading ? 'Uploading...' : 'Choose PNG, SVG, or WEBP image'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Up to 5MB</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};
