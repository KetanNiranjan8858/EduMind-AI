import React, { useEffect, useRef } from 'react';
import { Trash2, Eye, CheckSquare, Square } from 'lucide-react';

export default function ContextMenu({
  x,
  y,
  source,
  isSelected,
  onClose,
  onToggleSelect,
  onPreview,
  onDelete
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('contextmenu', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [onClose]);

  // Ensure menu stays within window bounds
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 180);

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-52 bg-dark-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
        {source.original_name}
      </div>

      <button
        onClick={() => {
          onToggleSelect(source.id);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
      >
        {isSelected ? (
          <>
            <Square className="w-4 h-4 text-brand-500" />
            <span>Deselect from AI Studio</span>
          </>
        ) : (
          <>
            <CheckSquare className="w-4 h-4 text-slate-400" />
            <span>Select for AI Studio</span>
          </>
        )}
      </button>

      <button
        onClick={() => {
          onPreview(source);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
      >
        <Eye className="w-4 h-4 text-cyan-400" />
        <span>Preview / Inspect</span>
      </button>

      <div className="my-1 border-t border-slate-800" />

      <button
        onClick={() => {
          onDelete(source);
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
      >
        <Trash2 className="w-4 h-4 text-rose-400" />
        <span>Delete Source</span>
      </button>
    </div>
  );
}
