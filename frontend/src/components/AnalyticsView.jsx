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
          <div className="p-2 duo-gradient rounded-xl text-white shadow-sm shadow-indigo-500/20">
            <Trophy className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Performance Analytics & Assessment Review</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-cyan-300 border border-cyan-500/30">
                {quiz.difficulty || 'Medium'}
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
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-dark-850 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>
          <button
            onClick={onReturnToStudio}
            className="px-4 py-2 text-xs font-semibold text-white duo-gradient duo-gradient-hover rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </button>
        </div>
      </header>

      {/* Main Content Area (Open, Boxless Layout) */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        {/* Performance Summary Metrics (Seamless, Open, No Box Containers) */}
        <div className="py-2 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Metric 1 */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Total Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {stats.correctCount}
              </span>
              <span className="text-sm font-semibold text-slate-500 font-mono">
                / {stats.totalQuestions}
              </span>
            </div>
            <p className="text-[11px] text-cyan-400 mt-1">
              {stats.overallPercentage}% overall score
            </p>
          </div>

          {/* Metric 2 */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Strict Accuracy
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-cyan-300 font-mono">
                {stats.accuracyPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Based on {stats.attemptedCount} attempted
            </p>
          </div>

          {/* Metric 3 */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Attempted
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
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

          {/* Metric 4 */}
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
        </div>

        {/* Detailed Question Review Section (Clean, Open Paper Review) */}
        <div className="border-t border-slate-800/80 pt-6 space-y-4">
          {/* Section Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Detailed Paper Review</span>
                <span className="text-xs font-normal text-slate-400">
                  (Time tracking & solutions)
                </span>
              </h2>
            </div>

            {/* Filter Pills (Clean, Borderless Switch) */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-800/40'
                }`}
              >
                All ({stats.totalQuestions})
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  filter === 'correct'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-cyan-400 hover:text-cyan-300 bg-slate-800/40'
                }`}
              >
                Correct ({stats.correctCount})
              </button>
              <button
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  filter === 'incorrect'
                    ? 'bg-slate-700 text-rose-300'
                    : 'text-rose-400 hover:text-rose-300 bg-slate-800/40'
                }`}
              >
                Incorrect ({stats.incorrectCount})
              </button>
              <button
                onClick={() => setFilter('unattempted')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  filter === 'unattempted'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-300 bg-slate-800/40'
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
                    {cleanQuestionStatement(item.questionText, quiz?.sourceFiles)}
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
