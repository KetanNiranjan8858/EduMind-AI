import React from 'react';
import { X, FileText, Image, Video, File, Download } from 'lucide-react';
import { formatBytes } from '../utils/helpers';

export default function SourcePreviewModal({ source, onClose }) {
  if (!source) return null;

  const isNote = source.is_note;
  const isImage = source.file_type === 'image';
  const isVideo = source.file_type === 'video';
  const isPdf = source.file_type === 'pdf';
  const fileUrl = source.file_path ? `/${source.file_path}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
              {isNote ? <FileText className="w-5 h-5" /> : isImage ? <Image className="w-5 h-5" /> : isVideo ? <Video className="w-5 h-5" /> : <File className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="font-semibold text-slate-100 text-sm truncate">{source.original_name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {source.file_type.toUpperCase()} • {formatBytes(source.file_size)} • {new Date(source.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                download={source.original_name}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Download / Open raw file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-dark-950/50">
          {isNote || source.note_content ? (
            <div className="bg-dark-900 p-4 rounded-xl border border-slate-800 text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {source.note_content || 'No text content available.'}
            </div>
          ) : isImage && fileUrl ? (
            <div className="flex items-center justify-center">
              <img
                src={fileUrl}
                alt={source.original_name}
                className="max-h-[60vh] rounded-xl object-contain border border-slate-800"
              />
            </div>
          ) : isVideo && fileUrl ? (
            <div className="flex items-center justify-center">
              <video controls className="max-h-[60vh] rounded-xl border border-slate-800 w-full">
                <source src={fileUrl} type={source.mime_type} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isPdf && fileUrl ? (
            <div className="h-[60vh] flex flex-col">
              <iframe
                src={fileUrl}
                title={source.original_name}
                className="w-full flex-1 rounded-xl border border-slate-800"
              />
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-sm">
              <File className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p>Uploaded file stored on server at:</p>
              <code className="text-xs text-brand-400 bg-dark-900 px-2 py-1 rounded mt-2 inline-block">
                {source.file_path}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
