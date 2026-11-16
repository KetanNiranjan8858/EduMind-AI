import React from 'react';
import {
  Layers,
  ChevronDown,
  Flame,
  Zap,
  BarChart3,
  CheckCircle2,
  Target,
  Award,
  Clock,
  Timer
} from 'lucide-react';

export default function ExamPrepAnalyticsBar({
  selectedExamId,
  onSelectExamId,
  availableExams = [],
  attemptedSubjectCount = 0,
  mockTestsCount = 0,
  totalAttempted = 0,
  questionsDenominator = 100,
  attemptPercentage = 0,
  accuracy = 0,
  totalCorrect = 0,
  totalIncorrect = 0,
  overallPercentage = 0,
  avgTimePerQuestion = 0,
  totalTimeTakenSeconds = 0,
  onOpenSubjectAnalytics
}) {
  return (
    <section className="border-b border-slate-800 bg-dark-900/80 shrink-0 p-4">
      <div className="max-w-[1920px] mx-auto space-y-3.5">
        {/* Header Row: Exam Track Selection, Global Badges & Detailed Analytics CTA */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-400" />
              Exam Track:
            </span>
            <div className="relative">
              <select
                value={selectedExamId}
                onChange={(e) => onSelectExamId(e.target.value)}
                className="pl-3.5 pr-8 py-1.5 bg-dark-950 hover:bg-dark-850 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200 focus:outline-none focus:border-rose-400 appearance-none cursor-pointer transition-colors shadow-sm"
              >
                {availableExams.map((exam) => (
                  <option key={exam.id} value={exam.id} className="bg-dark-900 text-slate-200">
                    {exam.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-rose-300 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Performance Summary Pill + Detailed Subject Analytics Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3 py-1 rounded-xl bg-dark-950 border border-slate-800 flex items-center gap-2 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">
                Subjects Practiced:{' '}
                <strong className="text-white font-mono">{attemptedSubjectCount}</strong>/10
              </span>
            </div>

            <div className="px-3 py-1 rounded-xl bg-dark-950 border border-slate-800 flex items-center gap-2 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[11px]">
                Mock Tests Completed:{' '}
                <strong className="text-white font-mono">{mockTestsCount}</strong>
              </span>
            </div>

            {/* Dedicated Subject-wise Detailed Analytics Button */}
            <button
              type="button"
              onClick={onOpenSubjectAnalytics}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 via-purple-600 to-brand-600 hover:from-rose-500 hover:via-purple-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 hover:scale-[1.02] transition-all cursor-pointer group"
              title="View detailed subject-by-subject performance analysis"
            >
              <BarChart3 className="w-3.5 h-3.5 text-rose-200 group-hover:rotate-6 transition-transform" />
              <span>Subject-wise Analytics</span>
            </button>
          </div>
        </div>

        {/* Detailed Performance Analysis Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Metric 1: Questions Attempted Out of Total */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Questions Attempted</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                  {totalAttempted}
                </span>
                <span className="text-xs text-slate-500 font-mono font-normal">
                  / {questionsDenominator}
                </span>
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, attemptPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Coverage</span>
                <span>{attemptPercentage}% of bank</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Accuracy */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Accuracy</span>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  {accuracy}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {accuracy >= 75
                    ? 'Excellent'
                    : accuracy >= 50
                    ? 'Proficient'
                    : totalAttempted > 0
                    ? 'Needs Practice'
                    : 'Untested'}
                </span>
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, accuracy)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Target</span>
                <span>{accuracy >= 75 ? 'Optimal' : totalAttempted > 0 ? '>75% goal' : 'Untested'}</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Overall Percentage */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Overall Score</span>
                <Award className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-cyan-400 font-mono tracking-tight">
                  {overallPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-mono">benchmark</span>
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overallPercentage)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                Total correct / Total syllabus Qs
              </div>
            </div>
          </div>

          {/* Metric 4: Average Time Taken Per Question */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Avg Time / Question</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
                  {avgTimePerQuestion}s
                </span>
                <span className="text-xs text-slate-500 font-normal">/ Q</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono">
                {avgTimePerQuestion === 0
                  ? 'No pace data'
                  : avgTimePerQuestion <= 90
                  ? '⚡ Fast Pace'
                  : avgTimePerQuestion <= 150
                  ? '⏱️ Standard Pace'
                  : '🐢 In-Depth Pace'}
              </span>
              <span className="text-slate-500">Target: &lt;180s</span>
            </div>
          </div>

          {/* Metric 5: Total Study & Test Time */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm hidden lg:flex flex-col justify-between group hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-medium">Total Test Time</span>
                <Timer className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-purple-400 font-mono tracking-tight">
                  {Math.round(totalTimeTakenSeconds / 60)}
                </span>
                <span className="text-xs text-slate-500 font-normal">minutes</span>
              </div>
            </div>

            <div className="mt-2.5 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Total Active CBT Time</span>
              <span className="font-mono text-slate-400">{mockTestsCount} tests</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
