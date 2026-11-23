import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Filter,
  Play,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ExamPrepQuestionCard from './ExamPrepQuestionCard';

export default function ExamPrepQuestionsView({
  contentWidth = 600,
  isResizing = false,
  subjectGroups = [],
  selectedSubjectIds = [],
  isAllSelected = false,
  onSelectAllSubjects,
  revealedExplanations = {},
  onToggleExplanation,
  onAskAiQuestion,
  onLaunchSubjectExam,
  onOpenGenerateExam
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'Hard' | 'Medium' | 'Easy'

  // Flatten all questions across selected subject groups
  const allQuestions = useMemo(() => {
    return subjectGroups.flatMap((group) =>
      (group.questions || []).map((q) => ({
        ...q,
        subjectId: q.subjectId || group.id,
        subjectName: q.subjectName || group.name
      }))
    );
  }, [subjectGroups]);

  // Apply Search and Difficulty filters
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        if ((q.difficulty || '').toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      // Keyword / Topic search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inQuestion = (q.question || '').toLowerCase().includes(query);
        const inTopic = (q.topic || '').toLowerCase().includes(query);
        const inSubject = (q.subjectName || '').toLowerCase().includes(query);
        const inExplanation = (q.explanation || '').toLowerCase().includes(query);
        if (!inQuestion && !inTopic && !inSubject && !inExplanation) {
          return false;
        }
      }

      return true;
    });
  }, [allQuestions, selectedDifficulty, searchQuery]);

  const activeSubjectTitle = useMemo(() => {
    if (isAllSelected) return 'All 10 Official GATE CS/IT Subjects';
    if (subjectGroups.length === 1) return subjectGroups[0].name;
    if (subjectGroups.length > 1) return `${subjectGroups.length} Selected Subjects`;
    return 'No Subject Selected';
  }, [isAllSelected, subjectGroups]);

  const isCompact = contentWidth < 520;

  return (
    <main
      className={`flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] overflow-hidden font-sans relative ${
        isResizing ? 'transition-none pointer-events-none' : ''
      }`}
    >
      {/* 1. Top Selection & Filter Toolbar */}
      <div className="p-4 border-b border-[#E6DFD3] bg-[#FAF7F2] shrink-0 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#1C1917] tracking-tight">
                  {activeSubjectTitle}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                  {filteredQuestions.length} Questions
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Curated official benchmark questions loaded directly from Admin Database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAllSelected && onSelectAllSubjects && (
              <button
                type="button"
                onClick={onSelectAllSubjects}
                className="px-3 py-1.5 bg-white hover:bg-[#F2EAE0] text-[#1C1917] border border-[#DCD2C0] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                View All Subjects
              </button>
            )}

            {onOpenGenerateExam && (
              <button
                type="button"
                onClick={onOpenGenerateExam}
                className="px-3.5 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FAF7F2]" />
                <span>Start Timed Exam</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Difficulty Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by topic or formula (e.g. paging, AVL, Dijkstra)..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E6DFD3] rounded-xl text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#173F3D] transition-colors"
            />
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E6DFD3]">
            {['all', 'Hard', 'Medium', 'Easy'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-[#173F3D] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Questions Feed List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4EFE6]">
        {filteredQuestions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-[#E6DFD3]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3] flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              No questions found
            </h3>
            <p className="text-xs text-[#78716C] mt-1 max-w-xs">
              {searchQuery || selectedDifficulty !== 'all'
                ? 'Try clearing your search query or switching difficulty filter to "All".'
                : 'Select one or more subjects from the left sidebar to view questions.'}
            </p>
            {(searchQuery || selectedDifficulty !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                }}
                className="mt-3 px-3 py-1.5 bg-[#FAF7F2] text-[#173F3D] border border-[#DCD2C0] rounded-xl text-xs font-semibold hover:bg-[#F2EAE0] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <ExamPrepQuestionCard
              key={q.id || idx}
              question={q}
              index={idx}
              isRevealed={Boolean(revealedExplanations[q.id])}
              onToggleExplanation={onToggleExplanation}
              onAskAi={(question) => onAskAiQuestion(question, q.subjectName)}
            />
          ))
        )}
      </div>
    </main>
  );
}
