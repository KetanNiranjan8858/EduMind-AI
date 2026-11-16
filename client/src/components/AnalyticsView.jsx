import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Home,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateScore, formatTime } from '../utils/helpers';

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

  const stats = calculateScore(quiz.questions, userAnswers, questionTimes);

  useEffect(() => {
    // Trigger confetti if high accuracy / score
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
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-dark-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl text-white">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Performance Analytics & Assessment Review</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {quiz.difficulty || 'GATE Level'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Paper: {quiz.quizTitle || 'Custom Assessment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetakeExam}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>
          <button
            onClick={onReturnToStudio}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Performance Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Score */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Total Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {stats.correctCount}
                </span>
                <span className="text-sm font-semibold text-slate-500 font-mono">
                  / {stats.totalQuestions}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">
                {stats.overallPercentage}% overall score
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Strict Accuracy % */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Strict Accuracy
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {stats.accuracyPercentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Based strictly on {stats.attemptedCount} attempted
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Attempt Breakdown */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Questions Attempted
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {stats.attemptedCount}
                </span>
                <span className="text-sm font-semibold text-slate-500 font-mono">
                  / {stats.totalQuestions}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {stats.unattemptedCount} unattempted
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Avg Time Per Question */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Avg. Time / Question
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                  {stats.averageTimePerQuestion}s
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Total duration: {formatTime(timeTakenSeconds || stats.totalTimeSeconds)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div className="bg-dark-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          {/* Section Header & Filters */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-850">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Detailed Paper Review</span>
                <span className="text-xs font-normal text-slate-400">
                  (Includes exact time tracking & AI explanations)
                </span>
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({stats.totalQuestions})
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'correct'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Correct ({stats.correctCount})
              </button>
              <button
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'incorrect'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Incorrect ({stats.incorrectCount})
              </button>
              <button
                onClick={() => setFilter('unattempted')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filter === 'unattempted'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Skipped ({stats.unattemptedCount})
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="divide-y divide-slate-800/80">
            {filteredQuestions.map((item) => {
              const isExpanded = expandedId === item.questionId;
              return (
                <div key={item.questionId} className="p-6 space-y-4 hover:bg-dark-950/40 transition-colors">
                  {/* Question header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-dark-950 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-slate-300 shrink-0">
                        Q{item.questionNumber}
                      </span>

                      {/* Result Tag */}
                      {item.isCorrect ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : item.isAttempted ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorrect</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Unattempted</span>
                        </span>
                      )}

                      {/* Exact Time Spent Tracker */}
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Exact time spent: {item.timeSpent}s</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.questionId)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Options' : 'View Options'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed pl-1">
                    {item.questionText}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2 pt-1 pl-1">
                    {item.options.map((opt) => {
                      const isCorrectOpt = opt.key === item.correctAnswer;
                      const isUserSelected = item.userAnswer === opt.key;

                      let optClass = 'bg-dark-950/60 border-slate-800/80 text-slate-400';
                      let badge = null;

                      if (isCorrectOpt) {
                        optClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-medium ring-1 ring-emerald-500/30';
                        badge = (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                            Correct Answer
                          </span>
                        );
                      } else if (isUserSelected && !item.isCorrect) {
                        optClass = 'bg-rose-500/15 border-rose-500 text-rose-200 font-medium ring-1 ring-rose-500/30';
                        badge = (
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                            Your Incorrect Answer
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-colors ${optClass}`}
                        >
                          <span className="w-6 h-6 rounded-md bg-dark-900 border border-slate-700/80 font-mono font-bold flex items-center justify-center shrink-0">
                            {opt.key}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Gemini AI Detailed Explanation */}
                  <div className="mt-3 p-4 rounded-xl bg-dark-950 border border-slate-800 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-brand-300">
                        Gemini 2.5 AI Solution & In-depth Explanation:
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
