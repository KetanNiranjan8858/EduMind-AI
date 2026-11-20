import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Upload,
  Edit,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  fetchAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  fetchAdminTopics
} from '../../utils/api';
import { GATE_SUBJECTS } from '../../data/curatedExams';
import QuestionModal from './QuestionModal';
import BulkUploadModal from './BulkUploadModal';

export default function AdminQuestionManager() {
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

  // Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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

  async function handleSaveQuestion(payload, questionId) {
    if (questionId) {
      await updateAdminQuestion(questionId, payload);
    } else {
      await createAdminQuestion(payload);
    }
    loadQuestions();
    loadTopics();
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
    <div className="flex-1 flex flex-col min-w-0 bg-dark-950 overflow-y-auto p-6 space-y-6">
      {/* Header & Primary Action Buttons */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              <span>Exam Prep Question Bank Manager</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {totalQuestions} Live Questions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage, author, and categorize questions subject-wise and topic-wise. Questions added here feed directly into candidate Exam Prep dashboards and CBT mock assessments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Bulk Upload (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingQuestion(null);
              setIsQuestionModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 via-purple-600 to-brand-600 hover:from-rose-500 hover:via-purple-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Question</span>
          </button>
        </div>
      </div>

      {/* Multi-parameter Filter Bar: Subject, Topic, Difficulty & Search */}
      <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Subject Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopic('all');
                setPage(1);
              }}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setPage(1);
              }}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Topics ({currentTopics.length})</option>
              {currentTopics.map((t, idx) => (
                <option key={idx} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Search Text
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search question, options, derivation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        {(selectedSubjectId !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Filtering: {selectedSubjectId !== 'all' && `Subject: ${selectedSubjectId} • `}
              {selectedTopic !== 'all' && `Topic: ${selectedTopic} • `}
              {selectedDifficulty !== 'all' && `Difficulty: ${selectedDifficulty} • `}
              {searchQuery && `Search: "${searchQuery}"`}
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
            <span className="text-xs font-semibold">Loading questions from Exam Prep database...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="w-full h-80 rounded-2xl border border-dashed border-slate-800 bg-dark-900/30 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-dark-950 border border-slate-800 flex items-center justify-center text-rose-400 shadow-sm">
              <Plus className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-200">
                Add Question
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No questions in this section. Click below to add your question with custom parameters.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2.5 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Bulk Upload (JSON)</span>
              </button>
            </div>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-3.5 rounded-xl bg-dark-900/90 border border-slate-800/80 shadow-sm space-y-2 hover:border-slate-700 transition-all"
            >
              {/* Question Meta Badges & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    #{(page - 1) * limit + idx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    {q.subjectName}
                  </span>
                  {q.topic && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 text-slate-400 border border-slate-800">
                      {q.topic}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      q.difficulty === 'Hard'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : q.difficulty === 'Medium'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {q.id}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsQuestionModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id, q.question)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-xs text-slate-100 font-medium leading-snug whitespace-pre-wrap">
                {q.question}
              </div>

              {/* Options List (No Boxes, Clean Typography) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pl-1 pt-0.5">
                {Object.entries(q.options || {}).map(([key, val]) => {
                  const isCorrect = key === q.correctAnswer;
                  return (
                    <div
                      key={key}
                      className={`flex items-baseline gap-1.5 text-xs transition-colors ${
                        isCorrect
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-300'
                      }`}
                    >
                      <span
                        className={`font-mono font-bold text-[11px] shrink-0 ${
                          isCorrect ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        ({key})
                      </span>
                      <span className="leading-snug">{val}</span>
                      {isCorrect && (
                        <span className="text-[10px] font-bold text-emerald-400 ml-1">✓ Correct</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {q.explanation && (
                <div className="p-2.5 rounded-lg bg-dark-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300 block mb-0.5 text-[10px] uppercase tracking-wider">
                    Solution Derivation:
                  </span>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalQuestions} Total Questions)
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Question Create/Edit Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        initialQuestion={editingQuestion}
        onSave={handleSaveQuestion}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUploadSuccess={() => {
          loadQuestions();
          loadTopics();
        }}
      />
    </div>
  );
}
