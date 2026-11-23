import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Play,
  Clock,
  BookOpen,
  Layers,
  Trash2,
  Search,
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  BarChart3,
  RotateCcw
} from 'lucide-react';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function ExamPrepTestsView({
  contentWidth = 600,
  isResizing = false,
  tests = [],
  attempts = [],
  selectedSubjectIds = ['all'],
  isAllSelected = true,
  dbSubjects = [],
  onLaunchExam,
  onReviewAttempt,
  onOpenGenerateModal,
  onDeleteTest
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'Hard' | 'Medium' | 'Easy'

  // Match test to its latest recorded attempt
  function getLatestAttemptForTest(test) {
    if (!attempts || attempts.length === 0) return null;
    return attempts.find((a) => {
      if (a.quiz_id && test.id && (a.quiz_id === test.id || a.quiz?.id === test.id)) return true;
      if (a.quiz_title && test.title && a.quiz_title.trim().toLowerCase() === test.title.trim().toLowerCase()) return true;
      if (a.quiz_title && test.title && (a.quiz_title.includes(test.title) || test.title.includes(a.quiz_title))) return true;
      return false;
    });
  }

  // Filter tests matching selected subjects, difficulty, and search query
  const filteredTests = useMemo(() => {
    return (tests || []).filter((test) => {
      // 1. Subject filter
      if (!isAllSelected && selectedSubjectIds.length > 0 && !selectedSubjectIds.includes('all')) {
        const testSubjectIds = (test.subject_ids || test.subjectId || '')
          .split(',')
          .map((s) => s.trim().toLowerCase());
        const hasMatchingSubject = selectedSubjectIds.some((id) =>
          testSubjectIds.includes(id.toLowerCase())
        );
        // Also check if test title contains any selected subject name
        const selectedNames = dbSubjects
          .filter((s) => selectedSubjectIds.includes(s.id))
          .map((s) => s.name.toLowerCase());
        const titleMatch = selectedNames.some((name) =>
          (test.title || '').toLowerCase().includes(name)
        );

        if (!hasMatchingSubject && !titleMatch && testSubjectIds.length > 0 && testSubjectIds[0] !== '') {
          return false;
        }
      }

      // 2. Difficulty filter
      if (selectedDifficulty !== 'all') {
        if ((test.difficulty || '').toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = (test.title || '').toLowerCase().includes(q);
        const inSubjects = (test.subject_ids || '').toLowerCase().includes(q);
        if (!inTitle && !inSubjects) return false;
      }

      return true;
    });
  }, [tests, selectedSubjectIds, isAllSelected, selectedDifficulty, searchQuery, dbSubjects]);

  const activeSubjectTitle = useMemo(() => {
    if (isAllSelected) return 'All 10 Official GATE CS/IT Subjects';
    const names = dbSubjects
      .filter((s) => selectedSubjectIds.includes(s.id))
      .map((s) => s.name);
    if (names.length === 1) return names[0];
    if (names.length > 1) return `${names.length} Selected Subjects`;
    return 'GATE CS/IT';
  }, [isAllSelected, selectedSubjectIds, dbSubjects]);

  return (
    <main
      className={`flex-1 flex flex-col min-w-0 bg-[#F4EFE6] rounded-2xl border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] overflow-hidden font-sans relative ${
        isResizing ? 'transition-none pointer-events-none' : ''
      }`}
    >
      {/* 1. Top Toolbar with Prominent "+ Generate Question Test" Button */}
      <div className="p-4 border-b border-[#E6DFD3] bg-white shrink-0 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Title & Metadata */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#1C1917] tracking-tight">
                  Generated Mock Tests & Assessments
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                  {filteredTests.length} Available
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Practice benchmark assessments for <strong className="text-[#173F3D]">{activeSubjectTitle}</strong>. Attempt tests or review your attempt analytics.
              </p>
            </div>
          </div>

          {/* Right Top Button: "+ Generate Question Test" */}
          <button
            type="button"
            onClick={onOpenGenerateModal}
            className="px-4 py-2 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            title="Generate a new custom test from the GATE question bank"
          >
            <Plus className="w-4 h-4 text-[#FAF7F2]" />
            <span>Generate Question Test</span>
          </button>
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
              placeholder="Search tests by title or subject..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#173F3D] transition-colors"
            />
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E6DFD3]">
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
                {diff === 'all' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Grid of Generated Tests */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTests.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-[#E6DFD3] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3] flex items-center justify-center mb-3 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              No tests found for {activeSubjectTitle}
            </h3>
            <p className="text-xs text-[#78716C] mt-1 max-w-sm leading-relaxed">
              Generate a custom benchmark test for this subject using questions from the official GATE database.
            </p>
            <button
              type="button"
              onClick={onOpenGenerateModal}
              className="mt-4 px-4 py-2 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Test Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTests.map((test) => {
              // Parse questions if stored as JSON string
              let parsedQuestions = [];
              try {
                parsedQuestions = typeof test.questions_json === 'string'
                  ? JSON.parse(test.questions_json)
                  : (test.questions || []);
              } catch {
                parsedQuestions = test.questions || [];
              }

              const totalQ = test.total_questions || test.totalQuestions || parsedQuestions.length || 10;
              const timeLimit = test.time_limit_minutes || test.timeLimitMinutes || 25;
              const diff = test.difficulty || 'Hard';

              // Build normalized quiz object to launch
              const quizPayload = {
                id: test.id,
                track: test.exam_id || 'gate_cs',
                subject: test.title,
                quizTitle: test.title,
                difficulty: diff,
                totalQuestions: totalQ,
                timeLimitMinutes: timeLimit,
                description: test.title,
                topics: [],
                questions: parsedQuestions
              };

              const latestAttempt = getLatestAttemptForTest(test);
              const hasAttempted = Boolean(latestAttempt);

              return (
                <div
                  key={test.id}
                  onClick={() => onLaunchExam(quizPayload)}
                  className="bg-white rounded-2xl border border-[#E6DFD3] p-5 shadow-xs hover:shadow-md hover:border-[#173F3D]/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Attempted Status Badge */}
                        {hasAttempted ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Attempted</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#78716C] border border-[#E6DFD3]">
                            Unattempted
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            diff.toLowerCase() === 'hard'
                              ? 'bg-[#E8DFCF] text-[#173F3D] border-[#DCD2C0]'
                              : diff.toLowerCase() === 'medium'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {diff}
                        </span>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#78716C] border border-[#E6DFD3]">
                          {totalQ} Qs
                        </span>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#78716C] border border-[#E6DFD3] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#173F3D]" />
                          <span>{timeLimit}m</span>
                        </span>
                      </div>

                      {/* Delete Action Button */}
                      {onDeleteTest && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTest(test.id, test.title);
                          }}
                          className="p-1.5 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Delete test from database"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Test Title */}
                    <h3 className="text-sm font-bold text-[#1C1917] group-hover:text-[#173F3D] transition-colors leading-snug">
                      {test.title}
                    </h3>

                    {/* Subject Tags */}
                    {test.subject_ids && (
                      <p className="text-[11px] text-[#78716C] truncate">
                        Subjects: {test.subject_ids}
                      </p>
                    )}

                    {/* Latest Attempt Performance Banner */}
                    {hasAttempted && (
                      <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#78716C]">Latest Score:</span>
                          <strong className="text-[#173F3D] font-bold">
                            {latestAttempt.correct_count} / {latestAttempt.total_questions} ({latestAttempt.accuracy_percentage}%)
                          </strong>
                        </div>
                        <span className="text-[10px] text-[#78716C] font-mono">
                          Time: {formatDuration(latestAttempt.time_taken_seconds)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Row */}
                  <div className="pt-3 border-t border-[#E6DFD3] flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-[#78716C] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#78716C]" />
                      <span>{hasAttempted ? 'Completed' : 'Ready to Attempt'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {hasAttempted ? (
                        <>
                          {/* Dedicated Analytics Option for Attempted Test */}
                          {onReviewAttempt && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReviewAttempt(latestAttempt);
                              }}
                              className="px-3.5 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                              title="View performance analytics and review question solutions"
                            >
                              <BarChart3 className="w-3.5 h-3.5 text-[#FAF7F2]" />
                              <span>Analytics</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLaunchExam(quizPayload);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#173F3D] border border-[#DCD2C0] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="Retake this test"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retake</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLaunchExam(quizPayload);
                          }}
                          className="px-3.5 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Attempt Test</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
