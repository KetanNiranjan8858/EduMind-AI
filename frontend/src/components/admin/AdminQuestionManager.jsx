import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  fetchAdminQuestions,
  deleteAdminQuestion,
  fetchAdminTopics
} from '../../utils/api';
import { GATE_SUBJECTS } from '../../data/curatedExams';

export default function AdminQuestionManager({ onSwitchToMockTests }) {
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('gate_cs');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const [expandedExplanationId, setExpandedExplanationId] = useState(null);

  // Topics cache
  const [topicsMap, setTopicsMap] = useState({});

  const subjectsList = useMemo(() => GATE_SUBJECTS, []);

  useEffect(() => {
    loadTopics();
  }, [selectedExamId]);

  useEffect(() => {
    loadQuestions();
  }, [selectedExamId, selectedSubjectId, selectedTopic, selectedDifficulty, page]);

  async function loadTopics() {
    try {
      const res = await fetchAdminTopics(null, selectedExamId);
      setTopicsMap(res.topics || {});
    } catch (err) {
      console.warn('Could not load topics:', err.message);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const res = await fetchAdminQuestions({
        examId: selectedExamId,
        subjectId: selectedSubjectId !== 'all' ? selectedSubjectId : undefined,
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit
      });
      setQuestions(res.questions || []);
      setTotalQuestions(res.total || 0);
    } catch (err) {
      console.warn('Failed to load questions:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadQuestions();
  }

  function handleClearFilters() {
    setSelectedSubjectId('all');
    setSelectedTopic('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
    setPage(1);
  }

  async function handleDeleteQuestion(id, qText) {
    if (!window.confirm(`Delete question: "${qText.slice(0, 60)}..." from Exam Prep database?`)) return;
    try {
      await deleteAdminQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setTotalQuestions((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert('Failed to delete question: ' + err.message);
    }
  }

  // Available topics for selected subject
  const currentTopics = useMemo(() => {
    if (selectedSubjectId === 'all') {
      const allT = new Set();
      Object.values(topicsMap).forEach((tList) => {
        (tList || []).forEach((t) => allT.add(t));
      });
      return Array.from(allT);
    }
    return topicsMap[selectedSubjectId] || [];
  }, [topicsMap, selectedSubjectId]);

  const totalPages = Math.max(1, Math.ceil(totalQuestions / limit));

  return (
    <div className="min-h-full flex flex-col min-w-0 bg-[#F4EFE6]">
      {/* Sticky Compact Top Bar: Title, Count, Search & Filters (Does not scroll) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E6DFD3] shadow-xs px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Compact Title & Question Count */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-[#FAF7F2]" />
            </div>
            <h2 className="text-sm font-bold text-[#1C1917] tracking-tight">
              Question Bank
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
              {totalQuestions} Qs
            </span>
          </div>

          {/* Right: Integrated Searchbar, Filters & Actions */}
          <div className="flex items-center gap-2 flex-wrap flex-1 justify-end min-w-0">
            {/* Merged Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[160px] max-w-[220px] flex-1">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[#1C1917] placeholder-[#78716C] focus:outline-none focus:border-[#173F3D]"
              />
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Subject Select */}
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopic('all');
                setPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D] max-w-[150px] truncate"
            >
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Topic Select */}
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D] max-w-[130px] truncate"
            >
              <option value="all">All Topics ({currentTopics.length})</option>
              {currentTopics.map((t, idx) => (
                <option key={idx} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Difficulty Select */}
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-2.5 py-1.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D]"
            >
              <option value="all">All Diff</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Clear Filter Button */}
            {(selectedSubjectId !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[11px] text-[#173F3D] hover:underline font-bold px-2 py-1 rounded-lg bg-[#FAF7F2] border border-[#E6DFD3] cursor-pointer"
                title="Reset filters"
              >
                Reset
              </button>
            )}

            {/* Generate Mock Test Shortcut */}
            {onSwitchToMockTests && (
              <button
                type="button"
                onClick={onSwitchToMockTests}
                className="px-3 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Mock Test</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Scrolls Underneath Sticky Header) */}
      <div className="p-4 sm:p-6 space-y-4 flex-1">
        {/* Question Cards List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-[#78716C]">
              <Loader2 className="w-7 h-7 animate-spin text-[#173F3D] mb-2" />
              <span className="text-xs font-semibold">Loading questions from Exam Prep database...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="w-full py-16 rounded-2xl border border-dashed border-[#DCD2C0] bg-white flex flex-col items-center justify-center text-center p-8 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center justify-center text-[#78716C] shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#1C1917]">
                  No Questions Found
                </h3>
                <p className="text-xs text-[#78716C] max-w-sm leading-relaxed">
                  No questions match the current filter criteria or search keyword.
                </p>
              </div>

              {(selectedSubjectId !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-xl bg-white border border-[#E6DFD3] shadow-xs space-y-2.5 hover:border-[#173F3D]/50 transition-all"
              >
                {/* Question Meta Badges & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#78716C] border border-[#E6DFD3]">
                      #{(page - 1) * limit + idx + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                      {q.subjectName}
                    </span>
                    {q.topic && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#78716C] border border-[#E6DFD3]">
                        {q.topic}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        q.difficulty === 'Hard'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : q.difficulty === 'Medium'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      ID: {q.id}
                    </span>
                  </div>

                  {/* Actions: Delete Only (Edit removed) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id, q.question)}
                      className="p-1.5 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-xs text-[#1C1917] font-medium leading-relaxed whitespace-pre-wrap">
                  {q.question}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {Object.entries(q.options || {}).map(([key, val]) => {
                    const isCorrect = key === q.correctAnswer;
                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                          isCorrect
                            ? 'bg-[#E5ECEB] border-[#173F3D] text-[#173F3D] font-bold shadow-2xs'
                            : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917]'
                        }`}
                      >
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span className="font-mono text-[11px] font-bold text-[#78716C] shrink-0">
                            ({key})
                          </span>
                          <span className="leading-snug truncate">{val}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-[#173F3D] shrink-0 flex items-center gap-1 ml-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Toggle */}
                {q.explanation && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedExplanationId(expandedExplanationId === q.id ? null : q.id)}
                      className="text-[11px] text-[#173F3D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{expandedExplanationId === q.id ? 'Hide Explanation' : 'View Solution Explanation'}</span>
                    </button>
                    {expandedExplanationId === q.id && (
                      <div className="mt-2 p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-[11px] text-[#78716C] leading-relaxed">
                        <span className="font-bold text-[#1C1917] block mb-1">
                          Solution & Derivation:
                        </span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 rounded-2xl bg-white border border-[#E6DFD3] shadow-xs flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] disabled:opacity-40 text-[#1C1917] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-[#78716C]">
              Page <strong className="text-[#1C1917]">{page}</strong> of <strong className="text-[#1C1917]">{totalPages}</strong> ({totalQuestions} Total Questions)
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] disabled:opacity-40 text-[#1C1917] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
