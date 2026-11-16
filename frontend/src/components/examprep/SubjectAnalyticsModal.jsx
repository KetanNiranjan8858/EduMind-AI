import React from 'react';
import {
  BarChart3,
  X,
  Award,
  Target,
  Layers,
  TrendingUp
} from 'lucide-react';
import { getSubjectIcon } from './subjectIcons';

export default function SubjectAnalyticsModal({
  isOpen,
  onClose,
  subjectAnalytics = [],
  bestSubject,
  focusSubject,
  attemptedSubjectIds = new Set(),
  accuracy = 0,
  totalCorrect = 0,
  totalAttempted = 0,
  onPracticeSubject
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-rose-600 to-purple-600 rounded-xl text-white shadow-md shadow-rose-600/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                GATE CS/IT Subject-Wise Performance Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed breakdown across all 10 official syllabus modules
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Highlight 1: Strongest Subject */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                <span>Highest Accuracy</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-extrabold text-emerald-400 truncate">
                {bestSubject ? bestSubject.shortName : 'No Tests Yet'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {bestSubject
                  ? `${bestSubject.accuracy}% accuracy (${bestSubject.correct}/${bestSubject.attempted} Qs)`
                  : 'Attempt mock tests to assess'}
              </div>
            </div>

            {/* Highlight 2: Recommended Focus Subject */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                <span>Recommended Focus</span>
                <Target className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm font-extrabold text-amber-400 truncate">
                {focusSubject ? focusSubject.shortName : 'All Modules'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {focusSubject?.attemptsCount > 0
                  ? `${focusSubject.accuracy}% accuracy (${focusSubject.incorrect} incorrect)`
                  : 'Not attempted yet'}
              </div>
            </div>

            {/* Highlight 3: Modules Practiced */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                <span>Syllabus Coverage</span>
                <Layers className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-base font-extrabold text-purple-400 font-mono">
                {attemptedSubjectIds.size} / 10 Subjects
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {Math.round((attemptedSubjectIds.size / 10) * 100)}% of GATE modules attempted
              </div>
            </div>

            {/* Highlight 4: Global Accuracy */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                <span>Overall Accuracy</span>
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-base font-extrabold text-cyan-400 font-mono">
                {accuracy}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                {totalCorrect} Correct / {totalAttempted} Attempted
              </div>
            </div>
          </div>

          {/* Subject Analytics Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Subject-by-Subject Score & Speed Breakdown
              </h4>
              <span className="text-[11px] text-slate-400">
                Click "Practice" to isolate any subject
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-dark-950">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-900 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-3">Tests Taken</th>
                    <th className="py-3 px-3">Questions</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-3">Breakdown</th>
                    <th className="py-3 px-3">Avg Pace</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {subjectAnalytics.map((s) => {
                    const IconComp = getSubjectIcon(s.id);
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Subject Name & Icon */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-dark-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 text-xs">
                                {s.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {s.bankQuestionsCount} Questions in bank
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tests Taken */}
                        <td className="py-3 px-3 font-mono text-slate-200">
                          {s.attemptsCount}
                        </td>

                        {/* Questions Attempted / Bank */}
                        <td className="py-3 px-3 font-mono">
                          <span className="text-white font-bold">{s.attempted}</span>
                          <span className="text-slate-500"> / {s.bankQuestionsCount}</span>
                        </td>

                        {/* Accuracy with progress bar */}
                        <td className="py-3 px-4">
                          <div className="w-28 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span
                                className={`font-bold ${
                                  s.accuracy >= 75
                                    ? 'text-emerald-400'
                                    : s.accuracy >= 50
                                    ? 'text-blue-400'
                                    : s.attempted > 0
                                    ? 'text-amber-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {s.accuracy}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.accuracy >= 75
                                    ? 'bg-emerald-500'
                                    : s.accuracy >= 50
                                    ? 'bg-blue-500'
                                    : s.attempted > 0
                                    ? 'bg-amber-500'
                                    : 'bg-slate-700'
                                }`}
                                style={{ width: `${s.accuracy}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Correct / Incorrect breakdown */}
                        <td className="py-3 px-3 font-mono text-[10px]">
                          {s.attempted > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-semibold">
                                ✓{s.correct}
                              </span>
                              <span className="text-slate-600">|</span>
                              <span className="text-rose-400 font-semibold">
                                ✗{s.incorrect}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Average Pace */}
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {s.avgTime > 0 ? `${s.avgTime}s / Q` : '—'}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              s.statusColor === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : s.statusColor === 'blue'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : s.statusColor === 'amber'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        {/* Practice Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onPracticeSubject(s.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Practice
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-dark-850 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Data updates automatically as you complete CBT mock tests.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
