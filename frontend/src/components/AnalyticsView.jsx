import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateScore, formatTime, cleanQuestionStatement } from '../utils/helpers';

export default function AnalyticsView({
  quiz,
  userAnswers = {},
  questionTimes = {},
  timeTakenSeconds = 0,
  onReturnToStudio,
  onRetakeExam
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unattempted'
  const [expandedId, setExpandedId] = useState(null);

  const stats = calculateScore(quiz?.questions || [], userAnswers, questionTimes);

  const isExamPrep =
    quiz?.track === 'gate_cs' ||
    Boolean(quiz?.subjectId) ||
    (quiz?.quizTitle && quiz.quizTitle.toLowerCase().includes('gate'));

  useEffect(() => {
    // Trigger celebratory confetti if high accuracy / score
    if (stats.accuracyPercentage >= 70 && stats.attemptedCount > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // canvas-confetti fallback
      }
    }
  }, [stats.accuracyPercentage, stats.attemptedCount]);

  const filteredQuestions = stats.reviewBreakdown.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return item.isAttempted && !item.isCorrect;
    if (filter === 'unattempted') return !item.isAttempted;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1C1917] flex flex-col font-sans">
      {/* 1. Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-[#E6DFD3] px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#1C1917] flex items-center gap-2">
              <span>Performance Analytics & Assessment Review</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                {quiz?.difficulty || 'Hard'}
              </span>
            </h1>
            <p className="text-[11px] text-[#78716C] truncate max-w-md">
              Paper: {quiz?.quizTitle || quiz?.title || 'Custom Benchmark Assessment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onRetakeExam && (
            <button
              type="button"
              onClick={onRetakeExam}
              className="px-3.5 py-2 text-xs font-bold text-[#173F3D] hover:bg-[#FAF7F2] bg-white border border-[#DCD2C0] rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Exam</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReturnToStudio}
            className="px-4 py-2 text-xs font-bold text-white bg-[#173F3D] hover:bg-[#102B2A] rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FAF7F2]" />
            <span>{isExamPrep ? 'Return to Exam Prep' : 'Return to Studio'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Score */}
          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Total Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1C1917] font-mono">
                {stats.correctCount}
              </span>
              <span className="text-sm font-semibold text-[#78716C] font-mono">
                / {stats.totalQuestions}
              </span>
            </div>
            <p className="text-[11px] text-[#173F3D] font-semibold">
              {stats.overallPercentage}% overall score
            </p>
          </div>

          {/* Metric 2: Accuracy */}
          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Strict Accuracy
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#173F3D] font-mono">
                {stats.accuracyPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Based on {stats.attemptedCount} attempted
            </p>
          </div>

          {/* Metric 3: Attempted Count */}
          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Attempted Questions
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#1C1917] font-mono">
                {stats.attemptedCount}
              </span>
              <span className="text-sm font-semibold text-[#78716C] font-mono">
                / {stats.totalQuestions}
              </span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              {stats.unattemptedCount} skipped questions
            </p>
          </div>

          {/* Metric 4: Average Time */}
          <div className="bg-white border border-[#E6DFD3] rounded-2xl p-5 shadow-xs space-y-1">
            <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
              Avg. Time / Question
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#173F3D] font-mono">
                {stats.averageTimePerQuestion}s
              </span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Total duration: {formatTime(timeTakenSeconds || stats.totalTimeSeconds)}
            </p>
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div className="bg-white border border-[#E6DFD3] rounded-3xl p-6 shadow-xs space-y-5">
          {/* Section Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6DFD3]">
            <div>
              <h2 className="text-base font-extrabold text-[#1C1917] flex items-center gap-2">
                <span>Detailed Paper Review & Step-by-Step Solutions</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Review your selected answers, official answer keys, and analytical derivations.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#E6DFD3] text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#173F3D] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                All ({stats.totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setFilter('correct')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'correct'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                Correct ({stats.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'incorrect'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'text-rose-700 hover:text-rose-800'
                }`}
              >
                Incorrect ({stats.incorrectCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unattempted')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'unattempted'
                    ? 'bg-[#173F3D] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Skipped ({stats.unattemptedCount})
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredQuestions.map((item) => {
              const isExpanded = expandedId === item.questionId;
              return (
                <div
                  key={item.questionId}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-3 transition-colors"
                >
                  {/* Question header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-white border border-[#DCD2C0] font-mono text-xs font-extrabold flex items-center justify-center text-[#173F3D] shrink-0 shadow-2xs">
                        Q{item.questionNumber}
                      </span>

                      {/* Result Tag */}
                      {item.isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct</span>
                        </span>
                      ) : item.isAttempted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Incorrect</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-[#78716C] border border-[#E6DFD3] flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Unattempted</span>
                        </span>
                      )}

                      {/* Time Spent Tracker */}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white text-[#78716C] border border-[#E6DFD3] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#173F3D]" />
                        <span>Time spent: {item.timeSpent}s</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.questionId)}
                      className="text-xs text-[#173F3D] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Options' : 'View Options'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Question Statement */}
                  <p className="text-xs sm:text-sm font-semibold text-[#1C1917] leading-relaxed whitespace-pre-wrap">
                    {cleanQuestionStatement(item.questionText, quiz?.sourceFiles)}
                  </p>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {item.options.map((opt) => {
                      const isCorrectOpt = opt.key === item.correctAnswer;
                      const isUserSelected = item.userAnswer === opt.key;

                      let optClass = 'bg-white border-[#E6DFD3] text-[#1C1917]';
                      let badge = null;

                      if (isCorrectOpt) {
                        optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-300';
                        badge = (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            ✓ Correct Key
                          </span>
                        );
                      } else if (isUserSelected && !item.isCorrect) {
                        optClass = 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-300';
                        badge = (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            ✗ Your Answer
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs transition-colors ${optClass}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#DCD2C0] font-mono font-bold flex items-center justify-center shrink-0 text-[#173F3D]">
                            {opt.key}
                          </span>
                          <span className="flex-1 leading-snug">{opt.text}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation */}
                  {item.explanation && (
                    <div className="mt-2 p-3.5 rounded-xl bg-white border border-[#E6DFD3] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#173F3D] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Step-by-Step Derivation & Solution:</span>
                      </div>
                      <p className="text-xs text-[#44403C] leading-relaxed whitespace-pre-wrap">
                        {item.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
