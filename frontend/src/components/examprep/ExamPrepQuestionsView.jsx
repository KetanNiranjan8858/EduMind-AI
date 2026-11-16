import React from 'react';
import { BookMarked, Filter, Play, Clock, BookOpen, Sparkles } from 'lucide-react';
import ExamPrepQuestionCard from './ExamPrepQuestionCard';

export default function ExamPrepQuestionsView({
  isAllSelected,
  filteredExams = [],
  selectedTotalQuestions = 0,
  totalQuestionsInBank = 100,
  gateExams = [],
  onSelectAllSubjects,
  onSelectOnlySubject,
  onLaunchExam,
  onOpenGenerateModal,
  revealedExplanations = {},
  onToggleExplanation,
  onAskAiQuestion
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-dark-950 overflow-y-auto">
      {/* Active Selection Banner */}
      <div className="p-4 border-b border-slate-800 bg-dark-900/40 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/10">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
              <span>
                {isAllSelected
                  ? 'All Official GATE CS/IT Subjects'
                  : filteredExams.length === 1
                  ? filteredExams[0].subject
                  : `${filteredExams.length} Selected Subjects`}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {selectedTotalQuestions} Questions Available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAllSelected
                ? 'Displaying all 10 GATE CS benchmark papers. Click "Generate Exam" on the right to attempt a custom CBT test.'
                : filteredExams.length === 1
                ? `Showing high-yield GATE questions and benchmark exam for ${filteredExams[0].subject}.`
                : `Showing combined benchmark exams and questions for: ${filteredExams
                    .map((e) => e.subject)
                    .join(', ')}.`}
            </p>
          </div>
        </div>

        {/* Right Side Actions on All Official GATE CS/IT Subjects Banner */}
        <div className="flex items-center gap-2.5">
          {!isAllSelected && (
            <button
              type="button"
              onClick={onSelectAllSubjects}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              ← View All Subjects
            </button>
          )}

          {/* Right Side: Generate Exam for Attempt Button */}
          <button
            type="button"
            onClick={onOpenGenerateModal}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 via-purple-600 to-brand-600 hover:from-rose-500 hover:via-purple-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 hover:scale-[1.02] transition-all cursor-pointer"
            title="Generate a custom exam for attempt across official GATE CS/IT subjects"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>Generate Exam</span>
          </button>
        </div>
      </div>

      {/* Content Area: Subject Question Papers & Individual Questions Browser */}
      <div className="p-5 space-y-6">
        {/* If no subject is checked */}
        {filteredExams.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <Filter className="w-6 h-6 text-rose-400" />
            </div>
            <p className="text-sm font-bold text-slate-200">No Subjects Selected</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Please select one or more subjects using the checkboxes in the left sidebar to view questions and papers.
            </p>
            <button
              type="button"
              onClick={onSelectAllSubjects}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Select All Subjects
            </button>
          </div>
        ) : isAllSelected ? (
          /* When All Subjects Are Selected: Overview Grid of All 10 Benchmark Papers */
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-rose-400" />
                All 10 GATE CS/IT Benchmark Question Papers
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">
                  Total {gateExams.length} Papers • {totalQuestionsInBank} Questions
                </span>
                <button
                  type="button"
                  onClick={onOpenGenerateModal}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Exam for Attempt</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-5 rounded-2xl bg-dark-900 border border-slate-800/90 hover:border-rose-500/40 hover:bg-dark-850/80 transition-all shadow-sm flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        {exam.subject}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          exam.difficulty === 'Hard'
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            : 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                        }`}
                      >
                        {exam.difficulty}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-rose-200 transition-colors">
                        {exam.quizTitle}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {exam.description}
                      </p>
                    </div>

                    {/* Topics Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {exam.topics.slice(0, 4).map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 text-slate-300 border border-slate-800"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Metadata & Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        {exam.totalQuestions} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {exam.timeLimitMinutes} Mins
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectOnlySubject(exam.subjectId)}
                        className="px-3 py-1.5 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        View Questions
                      </button>
                      <button
                        type="button"
                        onClick={() => onLaunchExam(exam)}
                        className="px-4 py-1.5 bg-gradient-to-r from-rose-600 via-indigo-600 to-brand-600 hover:from-rose-500 hover:via-indigo-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                        title="Attempt Exam in CBT Engine"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Attempt Exam</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* When specific subjects are checked: Render the question papers & questions for checked subjects */
          <div className="space-y-8">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="space-y-5">
                {/* Subject Header & Launch CBT Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 border border-rose-500/30 shadow-lg shadow-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {exam.subject}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        GATE Level: {exam.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {exam.timeLimitMinutes} Minutes Timed Test
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        {exam.questions.length} Benchmark Questions
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white">
                      {exam.quizTitle}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {exam.description}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">
                        Topics:
                      </span>
                      {exam.topics.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 text-slate-300 border border-slate-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA: Launch Full CBT Exam */}
                  <button
                    type="button"
                    onClick={() => onLaunchExam(exam)}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 via-indigo-600 to-brand-600 hover:from-rose-500 hover:via-indigo-500 hover:to-brand-500 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all cursor-pointer shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Attempt {exam.subject} Exam</span>
                  </button>
                </div>

                {/* Questions Browser for the Subject */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brand-400" />
                      Questions for {exam.subject} ({exam.questions.length} Questions)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Inspect questions, reveal answers, or ask AI for step-by-step derivations
                    </span>
                  </div>

                  {/* List of Questions strictly for the subject */}
                  <div className="space-y-4">
                    {exam.questions.map((q, idx) => (
                      <ExamPrepQuestionCard
                        key={q.id || idx}
                        question={q}
                        index={idx}
                        isRevealed={Boolean(revealedExplanations[q.id])}
                        onToggleExplanation={onToggleExplanation}
                        onAskAi={(question) => onAskAiQuestion(question, exam.subject)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
