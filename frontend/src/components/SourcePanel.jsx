import React, { useRef, useState } from 'react';
import {
  Upload,
  FilePlus,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { formatBytes } from '../utils/helpers';
import ContextMenu from './ContextMenu';

export default function SourcePanel({
  sources = [],
  selectedIds = [],
  loading = false,
  uploading = false,
  onUploadFiles,
  onOpenNoteModal,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onDeleteSource,
  onPreviewSource
}) {
  const fileInputRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
      e.target.value = '';
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  }

  function handleContextMenu(e, source) {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      source
    });
  }

  function getFileIcon(source) {
    if (source.is_note) return <FileText className="w-4 h-4 text-amber-400" />;
    switch (source.file_type) {
      case 'pdf':
        return <File className="w-4 h-4 text-rose-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-indigo-400" />;
      case 'text':
      default:
        return <FileText className="w-4 h-4 text-cyan-400" />;
    }
  }

  return (
    <div
      className={`h-full flex flex-col bg-dark-900 border-r border-slate-800 transition-colors ${
        dragOver ? 'bg-dark-850 ring-2 ring-brand-500/50' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Sources & Notes
            </h2>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-dark-950 text-brand-400 rounded-md border border-brand-500/20">
              {sources.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select files to feed the AI Studio
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNoteModal}
            className="p-1.5 text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
            title="Create direct text note"
          >
            <FilePlus className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-2.5 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            title="Upload PDFs, images, text, videos"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp,.mp4,.mov"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Selection Control Bar */}
      {sources.length > 0 && (
        <div className="px-4 py-2 bg-dark-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px]">
              <strong className="text-brand-400">{selectedIds.length}</strong> of {sources.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectAll}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Select All
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={onClearSelection}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            <span>Loading uploaded sources...</span>
          </div>
        ) : sources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="p-3 bg-dark-850 rounded-2xl border border-slate-800 mb-3 text-slate-500">
              <FolderOpen className="w-8 h-8" />
            </div>
            <p className="text-xs font-medium text-slate-200 mb-1">No Sources Uploaded</p>
            <p className="text-[11px] text-slate-500 max-w-[200px] mb-4">
              Drop PDFs, notes, or media here to begin generating exam questions.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs bg-dark-850 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                onClick={onOpenNoteModal}
                className="px-3 py-1.5 text-xs bg-dark-850 hover:bg-slate-800 text-amber-400 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Note</span>
              </button>
            </div>
          </div>
        ) : (
          sources.map((source) => {
            const isSelected = selectedIds.includes(source.id);
            return (
              <div
                key={source.id}
                onContextMenu={(e) => handleContextMenu(e, source)}
                onClick={() => onToggleSelect(source.id)}
                className={`group relative flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/40 text-slate-100 shadow-sm'
                    : 'bg-dark-950/40 border-slate-800/80 hover:bg-dark-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(source.id);
                  }}
                  className="text-slate-400 hover:text-brand-400 transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-brand-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  )}
                </button>

                {/* File Icon */}
                <div className="shrink-0">{getFileIcon(source)}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-slate-200 group-hover:text-white">
                    {source.original_name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span className="uppercase">{source.file_type}</span>
                    <span>•</span>
                    <span>{formatBytes(source.file_size)}</span>
                  </div>
                </div>

                {/* Quick Action Buttons (shown on hover) */}
                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewSource(source);
                    }}
                    className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                    title="Preview file"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSource(source);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          source={contextMenu.source}
          isSelected={selectedIds.includes(contextMenu.source.id)}
          onClose={() => setContextMenu(null)}
          onToggleSelect={onToggleSelect}
          onPreview={onPreviewSource}
          onDelete={onDeleteSource}
        />
      )}
    </div>
  );
}
