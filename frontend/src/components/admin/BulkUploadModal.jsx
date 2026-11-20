import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-rose-600 via-purple-600 to-brand-600 rounded-xl text-white shadow-md shadow-rose-600/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Bulk Upload Exam Prep Questions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste JSON array or import a JSON file directly into Exam Prep database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Successfully imported {successCount} questions into the Exam Prep database!</span>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Import JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dark-950 file:text-rose-300 hover:file:bg-slate-800 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => setJsonText(sampleJSON)}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
            >
              Insert Sample Schema
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">
              JSON Array Input
            </label>
            <textarea
              rows={12}
              placeholder={`[\n  {\n    "subjectId": "os",\n    "topic": "Paging",\n    "difficulty": "Hard",\n    "question": "...",\n    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },\n    "correctAnswer": "A",\n    "explanation": "..."\n  }\n]`}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 leading-relaxed"
              required
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing Questions...</span>
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
