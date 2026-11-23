import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { bulkCreateAdminQuestions } from '../../utils/api';

export default function BulkUploadModal({
  isOpen,
  onClose,
  onUploadSuccess
}) {
  const [jsonText, setJsonText] = useState('');
  const [examId, setExamId] = useState('gate_cs');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState(null);

  if (!isOpen) return null;

  const sampleJSON = `[
  {
    "subjectId": "math",
    "subjectName": "Engineering & Discrete Mathematics",
    "topic": "Graph Theory",
    "difficulty": "Hard",
    "question": "A simple planar connected graph G has 20 vertices and each vertex has degree 3. How many faces (regions) does G divide the plane into?",
    "options": {
      "A": "12 faces",
      "B": "10 faces",
      "C": "8 faces",
      "D": "14 faces"
    },
    "correctAnswer": "A",
    "explanation": "Handshaking theorem gives 30 edges. Euler's formula V - E + F = 2 gives 20 - 30 + F = 2 => F = 12."
  }
]`;

  async function handleBulkSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessCount(null);

    let parsed = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setErrorMsg('Invalid JSON format. Please verify syntax: ' + err.message);
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      setErrorMsg('JSON must be an array of questions.');
      return;
    }

    setUploading(true);
    try {
      const res = await bulkCreateAdminQuestions(parsed, examId);
      setSuccessCount(res.addedCount || parsed.length);
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to bulk upload questions');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result || '');
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#E6DFD3] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#E6DFD3] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">
                Bulk Upload Exam Prep Questions
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Import structured JSON array directly into Exam Prep Question Bank
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#E6DFD3]/40 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3.5 rounded-xl bg-[#E5ECEB] border border-[#C9DCDA] text-[#173F3D] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Successfully imported {successCount} questions into Exam Prep DB!</span>
            </div>
          )}

          {/* Quick Upload or Paste */}
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#1C1917]">
              Paste JSON Array or Upload .json File
            </label>
            <button
              type="button"
              onClick={() => setJsonText(sampleJSON)}
              className="text-[#173F3D] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Insert Sample Template
            </button>
          </div>

          <textarea
            rows={10}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "subjectId": "os",\n    "topic": "Process Synchronization",\n    "difficulty": "Hard",\n    "question": "...",\n    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },\n    "correctAnswer": "A",\n    "explanation": "..."\n  }\n]`}
            className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-3 font-mono text-[11px] text-[#1C1917] focus:outline-none focus:border-[#173F3D] leading-relaxed"
            required
          />

          <div className="flex items-center justify-between pt-1">
            <label className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3] rounded-xl font-semibold flex items-center gap-2 cursor-pointer shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#173F3D]" />
              <span>Choose JSON file</span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
            <span className="text-[11px] text-[#78716C]">
              Supports standard GATE schema format
            </span>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E6DFD3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3] rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !jsonText.trim()}
              className="px-5 py-2.5 bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating & Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Import Questions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
