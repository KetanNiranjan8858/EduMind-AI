import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Edit,
  Edit3,
  Trash2,
  Check,
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
  updateAdminQuestion,
  deleteAdminQuestion,
  fetchAdminTopics,
  generateAdminExplanation,
  updateAdminQuestionExplanation
} from '../../utils/api';
import { GATE_SUBJECTS } from '../../data/curatedExams';
import QuestionModal from './QuestionModal';

export default function AdminQuestionManager({ onSwitchToMockTests }) {
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('gate_cs');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedQuestionType, setSelectedQuestionType] = useState('all');
  const [selectedNegativeMarking, setSelectedNegativeMarking] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  // Question editing modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Inline explanation editing
  const [expandedExplanationId, setExpandedExplanationId] = useState(null);
  const [editingExplanationId, setEditingExplanationId] = useState(null);
  const [inlineExplanationText, setInlineExplanationText] = useState('');
  const [isGeneratingInlineAI, setIsGeneratingInlineAI] = useState(false);
  const [savingInlineExplanation, setSavingInlineExplanation] = useState(false);

  // Topics cache
  const [topicsMap, setTopicsMap] = useState({});

  const subjectsList = useMemo(() => GATE_SUBJECTS, []);

  useEffect(() => {
    loadTopics();
  }, [selectedExamId]);

  useEffect(() => {
    loadQuestions();
  }, [
    selectedExamId,
    selectedSubjectId,
    selectedTopic,
    selectedDifficulty,
    selectedQuestionType,
    selectedNegativeMarking,
    page
  ]);

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
        questionType: selectedQuestionType !== 'all' ? selectedQuestionType : undefined,
        negativeMarking: selectedNegativeMarking !== 'all' ? selectedNegativeMarking : undefined,
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
    setSelectedQuestionType('all');
    setSelectedNegativeMarking('all');
    setSearchQuery('');
    setPage(1);
  }

  async function handleSaveQuestion(payload, questionId) {
    if (questionId) {
      await updateAdminQuestion(questionId, payload);
    }
    loadQuestions();
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

  async function handleInlineAIGenerate(q) {
    setIsGeneratingInlineAI(true);
    try {
      const res = await generateAdminExplanation({
        questionText: q.question,
        options: q.options || {},
        correctAnswer: q.correctAnswer || 'A',
        subject: q.subjectName || q.subjectId,
        topic: q.topic || '',
        questionType: q.questionType || 'MCQ'
      });
      if (res.explanation) {
        setInlineExplanationText(res.explanation);
      }
    } catch (err) {
      alert('Failed to generate AI explanation: ' + err.message);
    } finally {
      setIsGeneratingInlineAI(false);
    }
  }

  async function handleSaveInlineExplanation(questionId) {
    setSavingInlineExplanation(true);
    try {
      await updateAdminQuestionExplanation(questionId, inlineExplanationText);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, explanation: inlineExplanationText } : q))
      );
      setEditingExplanationId(null);
    } catch (err) {
      alert('Failed to save explanation: ' + err.message);
    } finally {
      setSavingInlineExplanation(false);
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

            {/* Question Type Filter: MCQ, MSQ, NAT */}
            <select
              value={selectedQuestionType}
              onChange={(e) => {
                setSelectedQuestionType(e.target.value);
                setPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-2.5 py-1.5 text-xs text-[#1C1917] font-semibold focus:outline-none focus:border-[#173F3D]"
              title="Filter by Question Type"
            >
              <option value="all">All Types</option>
              <option value="MCQ">MCQ (Single)</option>
              <option value="MSQ">MSQ (Multi)</option>
              <option value="NAT">NAT (Numerical)</option>
            </select>

            {/* Negative Marking Filter */}
            <select
              value={selectedNegativeMarking}
              onChange={(e) => {
                setSelectedNegativeMarking(e.target.value);
                setPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-2.5 py-1.5 text-xs text-[#1C1917] font-semibold focus:outline-none focus:border-[#173F3D]"
              title="Filter by Negative Marking"
            >
              <option value="all">All Neg Marks</option>
              <option value="has_penalty">Has Penalty (&gt; 0)</option>
              <option value="zero">No Penalty (0.00)</option>
              <option value="0.33">-0.33 (1/3rd)</option>
              <option value="0.66">-0.66 (2/3rd)</option>
            </select>

            {/* Clear Filter Button */}
            {(selectedSubjectId !== 'all' ||
              selectedTopic !== 'all' ||
              selectedDifficulty !== 'all' ||
              selectedQuestionType !== 'all' ||
              selectedNegativeMarking !== 'all' ||
              searchQuery) && (
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
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border tracking-wide ${
                        q.questionType === 'NAT'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : q.questionType === 'MSQ'
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      }`}
                    >
                      {q.questionType || 'MCQ'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      +{q.marks || 1} mark{Number(q.marks) > 1 ? 's' : ''}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        Number(q.negativeMarks) > 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      Neg: -{q.negativeMarks !== undefined ? q.negativeMarks : 0.33}
                    </span>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      ID: {q.id}
                    </span>
                  </div>

                  {/* Actions: Edit Question & Delete Question */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsQuestionModalOpen(true);
                      }}
                      className="p-1.5 text-[#78716C] hover:text-[#173F3D] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                      title="Edit Question & Choices"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
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

                {/* Options / Answer Display based on Question Type */}
                {q.questionType === 'NAT' ? (
                  /* NAT Numerical Answer Display */
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="font-bold text-[#1C1917]">Numerical Answer Key (NAT):</span>
                      <span className="text-[11px] text-[#78716C]">(No multiple-choice options)</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#173F3D] px-3.5 py-1 bg-white rounded-lg border border-[#E6DFD3] shadow-2xs">
                      {q.correctAnswer}
                    </span>
                  </div>
                ) : (
                  /* Options Grid for MCQ and MSQ */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {Object.entries(q.options || {}).map(([key, val]) => {
                      const isMsq = q.questionType === 'MSQ';
                      const correctList = isMsq
                        ? (q.correctAnswer || '').split(',').map((s) => s.trim().toUpperCase())
                        : [(q.correctAnswer || '').toUpperCase()];
                      const isCorrect = correctList.includes(key);

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
                              <span>{isMsq ? 'Correct (MSQ)' : 'Correct'}</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation Section: View, Inline Edit & AI Generator */}
                <div className="pt-2 border-t border-[#F0EBE1]">
                  {editingExplanationId === q.id ? (
                    /* Inline Explanation Editor */
                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#173F3D]/30 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-[#173F3D]" />
                          <span>Edit Solution & Derivation Explanation</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInlineAIGenerate(q)}
                          disabled={isGeneratingInlineAI}
                          className="px-2.5 py-1 bg-[#173F3D] hover:bg-[#102B2A] text-white disabled:opacity-50 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          title="Generate concise 5-10 line explanation using Gemini AI"
                        >
                          {isGeneratingInlineAI ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                              <span>AI Generating (5-10 lines)...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              <span>✨ AI Generate (5-10 lines max)</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={inlineExplanationText}
                        onChange={(e) => setInlineExplanationText(e.target.value)}
                        placeholder="Type step-by-step solution derivation or click '✨ AI Generate (5-10 lines max)'..."
                        className="w-full bg-white border border-[#E6DFD3] rounded-xl p-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D] leading-relaxed font-sans"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExplanationId(null);
                            setInlineExplanationText('');
                          }}
                          className="px-3 py-1.5 text-xs text-[#78716C] hover:text-[#1C1917] bg-white border border-[#E6DFD3] rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveInlineExplanation(q.id)}
                          disabled={savingInlineExplanation}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          {savingInlineExplanation ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Save Explanation</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal View / Toggle View */
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedExplanationId(expandedExplanationId === q.id ? null : q.id)}
                          className="text-[11px] text-[#173F3D] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>
                            {expandedExplanationId === q.id
                              ? 'Hide Explanation'
                              : q.explanation
                              ? 'View Solution Explanation'
                              : 'No Explanation (Click to add)'}
                          </span>
                        </button>

                        {q.explanation && (
                          <span className="text-[10px] text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E6DFD3]">
                            Available
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExplanationId(q.id);
                            setInlineExplanationText(q.explanation || '');
                            setExpandedExplanationId(q.id);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-[#173F3D] hover:bg-[#FAF7F2] border border-[#E6DFD3] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit solution explanation"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Explanation</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingExplanationId(q.id);
                            setInlineExplanationText(q.explanation || '');
                            setExpandedExplanationId(q.id);
                            handleInlineAIGenerate(q);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#173F3D] bg-[#E8DFCF] hover:bg-[#DCD2C0] border border-[#DCD2C0] rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Generate or enhance explanation with AI"
                        >
                          <Sparkles className="w-3 h-3 text-[#173F3D]" />
                          <span>AI Explain</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display expanded explanation if open and not currently editing */}
                  {editingExplanationId !== q.id && expandedExplanationId === q.id && (
                    <div className="mt-2.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-xs text-[#1C1917] leading-relaxed">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#E6DFD3]">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-[#173F3D]" />
                          <span>Solution & Derivation</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExplanationId(q.id);
                            setInlineExplanationText(q.explanation || '');
                          }}
                          className="text-[11px] text-[#173F3D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="whitespace-pre-wrap font-sans text-xs text-[#2D2A26]">
                        {q.explanation || 'No explanation provided yet. Click "Edit Explanation" or "AI Explain" above to generate one.'}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Full Question Edit Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        initialQuestion={editingQuestion}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
