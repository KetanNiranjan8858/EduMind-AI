import React, { useState } from 'react';
import { X, FileText, Loader2, Sparkles } from 'lucide-react';

export default function NoteModal({ isOpen, onClose, onNoteCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the note.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onNoteCreated({ title: title.trim(), content });
      setTitle('');
      setContent('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <div className="p-2 duo-gradient text-white rounded-lg shadow-sm shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Create Study Note</h3>
              <p className="text-xs text-slate-400">
                Saves as a physical file on the server for Gemini AI analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 flex flex-col">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Note Title / Subject <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems - Memory Paging Algorithms"
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors"
              autoFocus
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Study Notes / Formulae / Lecture Transcript
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {content.length} characters
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Paste or write notes, equations, key definitions, or theorem proofs here. The AI will strictly generate assessment questions based on this text..."
              className="w-full flex-1 px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-sm font-mono leading-relaxed transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={loading || !title.trim()}
              className="px-5 py-2.5 duo-gradient duo-gradient-hover disabled:opacity-50 text-white text-xs font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Note...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Save to Sources</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
