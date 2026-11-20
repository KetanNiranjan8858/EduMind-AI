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
  Check,
  FolderOpen,
  ChevronDown,
  Plus,
  History,
  Pin,
  Edit2,
  X,
  Shield
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
  currentUser = null,
  onOpenAdmin,
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

  // Inline Workspace Renaming State for Active Workspace
  const [isEditingActiveWs, setIsEditingActiveWs] = useState(false);
  const [activeWsName, setActiveWsName] = useState(activeWorkspace?.name || '');

  useEffect(() => {
    setActiveWsName(activeWorkspace?.name || '');
  }, [activeWorkspace?.name]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSaveActiveWs() {
    if (!activeWsName.trim() || activeWsName.trim() === activeWorkspace?.name) {
      setIsEditingActiveWs(false);
      return;
    }
    await onUpdateWorkspaceName(activeWorkspace.id, activeWsName.trim());
    setIsEditingActiveWs(false);
  }

  function handleActiveWsKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveActiveWs();
    } else if (e.key === 'Escape') {
      setIsEditingActiveWs(false);
      setActiveWsName(activeWorkspace?.name || '');
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
    if (color === 'cyan' || color === 'teal') return 'bg-[#173F3D]';
    return 'bg-[#C99A45]';
  }

  function getFileIcon(source) {
    if (source.is_note) return <FileText className="w-4 h-4 text-[#173F3D]" />;
    switch (source.file_type) {
      case 'pdf':
        return <File className="w-4 h-4 text-[#173F3D]" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#173F3D]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#173F3D]" />;
      case 'text':
      default:
        return <FileText className="w-4 h-4 text-[#78716C]" />;
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
      className={`h-full flex flex-col bg-white overflow-hidden transition-colors ${
        dragOver ? 'bg-[#FAF7F2] ring-2 ring-[#173F3D]/40' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* ============================================================ */}
      {/* 1. WORKSPACE SELECTOR & EXAM HISTORY (Top Row matching mockup) */}
      {/* ============================================================ */}
      <div className="p-3 bg-white border-b border-[#E6DFD3] space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Workspace Switcher & In-Workspace Edit */}
          <div className="relative flex-1 min-w-0" ref={dropdownRef}>
            {isEditingActiveWs ? (
              <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] border border-[#173F3D] rounded-xl shadow-xs">
                <input
                  type="text"
                  value={activeWsName}
                  onChange={(e) => setActiveWsName(e.target.value)}
                  onKeyDown={handleActiveWsKeyDown}
                  className="w-full px-2 py-1 bg-white rounded-lg text-xs text-[#1C1917] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveActiveWs}
                  className="p-1 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-lg shrink-0 transition-colors"
                  title="Save workspace name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingActiveWs(false);
                    setActiveWsName(activeWorkspace?.name || '');
                  }}
                  className="p-1 bg-white hover:bg-[#FAF7F2] text-[#78716C] rounded-lg shrink-0 transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex-1 min-w-0 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3] rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 transition-all shadow-2xs"
                  title="Click to open workspace list"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getWorkspaceColorDot(activeWorkspace?.color)}`} />
                    <span className="truncate font-semibold">{activeWorkspace?.name || 'General Study Workspace'}</span>
                    {pinnedIds.includes(activeWorkspace?.id) && (
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-500 rotate-45 shrink-0" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWsName(activeWorkspace?.name || '');
                    setIsEditingActiveWs(true);
                  }}
                  className="p-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#78716C] hover:text-[#173F3D] border border-[#E6DFD3] rounded-xl transition-all shrink-0 shadow-2xs"
                  title="Edit workspace name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-[#E6DFD3] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1.5 border-b border-[#E6DFD3] text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  Switch Workspace
                </div>

                <div className="max-h-60 overflow-y-auto py-1 divide-y divide-[#E6DFD3]/40">
                  {sortedWorkspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId;
                    const isPinned = pinnedIds.includes(ws.id);

                    return (
                      <div
                        key={ws.id}
                        className={`group px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-[#FAF7F2] text-[#173F3D] font-bold' : 'text-[#1C1917] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div
                          className="flex items-center gap-2 truncate flex-1 cursor-pointer"
                          onClick={() => {
                            onSelectWorkspace(ws.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${getWorkspaceColorDot(ws.color)}`} />
                          <span className="truncate">{ws.name}</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(ws.id);
                            }}
                            className="p-1 hover:text-amber-500 rounded text-xs"
                            title={isPinned ? 'Unpin workspace' : 'Pin workspace'}
                          >
                            <Pin className={`w-3 h-3 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-[#78716C]'}`} />
                          </button>
                          {ws.id !== 'ws_default' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteWorkspace(ws.id);
                              }}
                              className="p-1 hover:text-rose-500 rounded text-xs"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-3 h-3 text-[#78716C]" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-[#E6DFD3]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenWorkspaceModal();
                    }}
                    className="w-full py-1.5 px-3 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#173F3D] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exam History Button */}
          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer"
            title="View completed exam history and past scores"
          >
            <History className="w-3.5 h-3.5 text-[#173F3D]" />
            <span>History</span>
            {examHistoryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#E8DFCF] text-[#173F3D] font-mono text-[10px] border border-[#DCD2C0]">
                {examHistoryCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SOURCES & NOTES SECTION (Matching mockup) */}
      {/* ============================================================ */}
      <div className="p-4 border-b border-[#E6DFD3] flex items-center justify-between bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
              SOURCES & NOTES
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#FAF7F2] text-[#173F3D] rounded-full border border-[#E6DFD3]">
              {sources.length}
            </span>
          </div>
          <p className="text-[11px] text-[#78716C] mt-0.5">
            Select files to feed this AI Studio
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenNoteModal}
            className="p-1.5 text-[#1C1917] hover:text-[#173F3D] bg-white hover:bg-[#FAF7F2] rounded-lg border border-[#E6DFD3] transition-colors shadow-2xs cursor-pointer"
            title="Create direct text note"
          >
            <FilePlus className="w-4 h-4 text-[#173F3D]" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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
        <div className="px-4 py-2 bg-white border-b border-[#E6DFD3] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#78716C]">
            <span className="text-[11px]">
              <strong className="text-[#173F3D] font-bold">{selectedIds.length}</strong> of {sources.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="text-[11px] text-[#173F3D] font-semibold hover:underline transition-colors cursor-pointer"
            >
              Select All
            </button>
            <span className="text-[#DCD2C0]">•</span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-[11px] text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-8 text-center text-[#78716C] text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#173F3D]" />
            <span>Loading uploaded sources...</span>
          </div>
        ) : sources.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#78716C]">
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD3] mb-3 text-[#78716C]">
              <FolderOpen className="w-8 h-8 text-[#173F3D]" />
            </div>
            <p className="text-xs font-semibold text-[#1C1917] mb-1">No Sources in {activeWorkspace?.name || 'Workspace'}</p>
            <p className="text-[11px] text-[#78716C] max-w-[200px] mb-4">
              Drop PDFs, notes, or media here to begin generating exam questions.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#E6DFD3] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#173F3D]" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={onOpenNoteModal}
                className="px-3 py-1.5 text-xs bg-white hover:bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
                className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#FAF7F2] text-[#1C1917] border border-[#E6DFD3]/80'
                    : 'hover:bg-[#FAF7F2]/60 text-[#1C1917] border border-transparent'
                }`}
              >
                {/* Selection Checkbox matching mockup */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(source.id);
                  }}
                  className="transition-colors shrink-0"
                >
                  {isSelected ? (
                    <div className="w-4 h-4 rounded bg-[#173F3D] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border border-[#DCD2C0] bg-white group-hover:border-[#173F3D]" />
                  )}
                </button>

                {/* File Icon */}
                <div className="shrink-0 text-[#173F3D]">{getFileIcon(source)}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-[#1C1917]">
                    {source.original_name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#78716C] mt-0.5">
                    <span className="uppercase font-semibold">{source.file_type}</span>
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
                    className="p-1 text-[#78716C] hover:text-[#173F3D] hover:bg-white rounded transition-colors"
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
                    className="p-1 text-[#78716C] hover:text-rose-500 hover:bg-white rounded transition-colors"
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

      {/* Admin Quick Entry in Left Sidebar (Solid Deep Teal Card with Staff Badge matching mockup) */}
      <div className="p-3 border-t border-[#E6DFD3] bg-white shrink-0">
        <button
          type="button"
          onClick={onOpenAdmin}
          className="w-full py-2.5 px-3.5 bg-[#173F3D] hover:bg-[#102B2A] rounded-xl text-xs font-bold text-white flex items-center justify-between shadow-sm cursor-pointer transition-all group"
          title="Access Institutional Admin Portal"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
            <span>Admin Portal</span>
          </div>
          <span className="text-[10px] tracking-wider uppercase bg-[#E8DFCF] text-[#173F3D] px-2.5 py-0.5 rounded-full font-bold">
            Staff
          </span>
        </button>
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
