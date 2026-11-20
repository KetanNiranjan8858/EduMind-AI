import React, { useState } from 'react';
import { X, Layers, Sparkles, Loader2, BookOpen, Code, Cpu, Database, Compass } from 'lucide-react';

const COLORS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-400' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500', ring: 'ring-rose-400' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-400' }
];

export default function WorkspaceModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for the workspace.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onCreated({
        name: name.trim(),
        description: description.trim(),
        color,
        icon: 'book'
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <div className="p-2 duo-gradient text-white rounded-lg shadow-sm shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Create New Workspace</h3>
              <p className="text-[11px] text-slate-400">
                Organize your subjects, notes, and exam histories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Subject / Workspace Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operating Systems, Computer Networks"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description <span className="text-slate-500 text-[10px]">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Virtual memory, thread scheduling, synchronization notes"
              className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Theme Accent
            </label>
            <div className="flex items-center gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-6 h-6 rounded-full ${c.bg} transition-all ${
                    color === c.id ? `ring-2 ${c.ring} ring-offset-2 ring-offset-dark-900 scale-110` : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 duo-gradient duo-gradient-hover disabled:opacity-50 text-white text-xs font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Create Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
