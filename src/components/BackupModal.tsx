import React, { useState } from 'react';
import { X, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { downloadBackupUrl, importBackup } from '../api';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    window.location.href = downloadBackupUrl();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setMessage(null);
      const text = await file.text();
      const json = JSON.parse(text);

      await importBackup(json);
      await onRefreshData();
      setMessage({ type: 'success', text: 'Backup restored successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Import failed: ' + err.message });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Backup & Portability</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {message && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              Export Snapshot
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Download your complete database of categories, links, and click counts as a JSON file.
            </p>
            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Backup
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              Restore Backup
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Upload a previously exported JSON backup file. This replaces existing bookmarks and categories.
            </p>
            <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{importing ? 'Restoring...' : 'Select JSON File to Restore'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
