import React, { useRef, useState, useEffect } from 'react';
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
  FolderOpen,
  ChevronDown,
  Plus,
  History,
  Pin,
  Check,
  Edit2,
  X
} from 'lucide-react';
import { formatBytes } from '../utils/helpers';
import ContextMenu from './ContextMenu';

export default function SourcePanel({
  // Workspace & History Props
  workspaces = [],
  activeWorkspace,
  activeWorkspaceId,
  pinnedIds = [],
  examHistoryCount = 0,
  onSelectWorkspace,
  onTogglePin,
  onUpdateWorkspaceName,
  onOpenWorkspaceModal,
  onDeleteWorkspace,
  onOpenHistoryModal,

  // Sources Props
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
  const dropdownRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Inline Workspace Renaming State
  const [editingWsId, setEditingWsId] = useState(null);
  const [editWsName, setEditWsName] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setEditingWsId(null);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleStartEdit(ws, e) {
    if (e) e.stopPropagation();
    setEditingWsId(ws.id);
    setEditWsName(ws.name);
  }

  async function handleSaveEdit(wsId, e) {
    if (e) e.stopPropagation();
    if (!editWsName.trim()) {
      setEditingWsId(null);
      return;
    }
    await onUpdateWorkspaceName(wsId, editWsName.trim());
    setEditingWsId(null);
  }

  function handleEditKeyDown(wsId, e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(wsId, e);
    } else if (e.key === 'Escape') {
      setEditingWsId(null);
    }
  }

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

  function getWorkspaceColorDot(color) {
    switch (color) {
      case 'emerald': return 'bg-emerald-400';
      case 'amber': return 'bg-amber-400';
      case 'rose': return 'bg-rose-400';
      case 'cyan': return 'bg-cyan-400';
      case 'indigo':
      default:
        return 'bg-indigo-400';
    }
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

  const sortedWorkspaces = [...workspaces].sort((a, b) => {
    const aPin = pinnedIds.includes(a.id);
    const bPin = pinnedIds.includes(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    return 0;
  });

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
      {/* ============================================================ */}
      {/* 1. WORKSPACE SELECTOR & EXAM HISTORY (Just Above Sources & Notes) */}
      {/* ============================================================ */}
      <div className="p-3 bg-dark-950/80 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Workspace Switcher & Name Click-to-Edit */}
          <div className="relative flex-1 min-w-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-2.5 py-1.5 bg-dark-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium flex items-center justify-between gap-1.5 transition-all shadow-sm"
              title="Click to open workspaces or edit workspace name"
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${getWorkspaceColorDot(activeWorkspace?.color)}`} />
                <span className="truncate font-semibold">{activeWorkspace?.name || 'Workspace'}</span>
                {pinnedIds.includes(activeWorkspace?.id) && (
                  <Pin className="w-3 h-3 text-amber-400 fill-amber-400 rotate-45 shrink-0" />
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select or Edit Workspace
                </div>

                <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-800/40">
                  {sortedWorkspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId;
                    const isPinned = pinnedIds.includes(ws.id);
                    const isEditing = editingWsId === ws.id;

                    return (
                      <div
                        key={ws.id}
                        className={`group px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-brand-500/15 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {isEditing ? (
                          /* Inline Name Editing Input */
                          <div className="flex items-center gap-1.5 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editWsName}
                              onChange={(e) => setEditWsName(e.target.value)}
                              onKeyDown={(e) => handleEditKeyDown(ws.id, e)}
                              className="w-full px-2 py-1 bg-dark-950 border border-brand-500 rounded text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={(e) => handleSaveEdit(ws.id, e)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded shrink-0"
                              title="Save name"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingWsId(null);
                              }}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded shrink-0"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          /* Workspace item row: click name to switch, click name text to edit */
                          <div
                            className="flex items-center gap-2 truncate flex-1 cursor-pointer"
                            onClick={() => {
                              onSelectWorkspace(ws.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${getWorkspaceColorDot(ws.color)}`} />
                            <span
                              className="truncate hover:underline"
                              onClick={(e) => handleStartEdit(ws, e)}
                              title="Click to edit workspace name"
                            >
                              {ws.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleStartEdit(ws, e)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-cyan-400 rounded transition-opacity"
                              title="Rename workspace"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {/* Pin / Unpin Button */}
                          <button
                            type="button"
                            onClick={(e) => onTogglePin(ws.id, e)}
                            className={`p-1 rounded transition-colors ${
                              isPinned
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-slate-500 hover:text-slate-300 opacity-40 group-hover:opacity-100'
                            }`}
                            title={isPinned ? 'Unpin workspace' : 'Pin workspace to top'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 rotate-45' : ''}`} />
                          </button>

                          {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}

                          {ws.id !== 'ws_default' && (
                            <button
                              type="button"
                              onClick={(e) => onDeleteWorkspace(ws.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenWorkspaceModal();
                    }}
                    className="w-full px-3 py-2 text-xs text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 flex items-center gap-2 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exam History Button */}
          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="px-2.5 py-1.5 bg-dark-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            title="View completed exam history and past scores"
          >
            <History className="w-3.5 h-3.5 text-brand-400" />
            <span>History</span>
            {examHistoryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-300 font-mono text-[10px] border border-brand-500/30">
                {examHistoryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SOURCES & NOTES SECTION */}
      {/* ============================================================ */}
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
            type="button"
            onClick={onOpenNoteModal}
            className="p-1.5 text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
            title="Create direct text note"
          >
            <FilePlus className="w-4 h-4 text-amber-400" />
          </button>
          <button
            type="button"
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
              type="button"
              onClick={onSelectAll}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Select All
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
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
            <p className="text-xs font-medium text-slate-200 mb-1">No Sources in {activeWorkspace?.name || 'Workspace'}</p>
            <p className="text-[11px] text-slate-500 max-w-[200px] mb-4">
              Drop PDFs, notes, or media here to begin generating exam questions.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs bg-dark-850 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                type="button"
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
