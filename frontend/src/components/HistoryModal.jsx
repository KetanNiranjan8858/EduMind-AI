import React from 'react';
import {
  X,
  History,
  Trophy,
  Target,
  Clock,
  Eye,
  RotateCcw,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatTime } from '../utils/helpers';

export default function HistoryModal({
  isOpen,
  onClose,
  history = [],
  activeWorkspace,
  currentUser,
  onReviewAttempt,
  onRetakeAttempt,
  onDeleteAttempt
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-100 text-sm">Exam Attempt History</h3>
                {currentUser ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-brand-500/15 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                    <span>ID:</span>
                    <strong>{currentUser.candidateId}</strong>
                    <span>• {currentUser.name}</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-dark-950 text-brand-300 border border-brand-500/20">
                    {activeWorkspace?.name || 'Workspace'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? `Filtered for candidate ID ${currentUser.candidateId}. Review solutions and timings.`
                  : 'Review past submissions, accuracy metrics, and AI explanations'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Attempts */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-dark-950/40">
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="p-3.5 bg-dark-850 rounded-2xl border border-slate-800 mb-3 text-slate-500">
                <Trophy className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-200 mb-1">No Exam History Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Completed assessments in "{activeWorkspace?.name}" will be automatically cataloged here with full question analytics and timing metrics.
              </p>
            </div>
          ) : (
            history.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 rounded-xl bg-dark-900 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {attempt.quiz_title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        attempt.difficulty === 'Hard'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : attempt.difficulty === 'Easy'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-brand-400 border-brand-500/30 bg-brand-500/10'
                      }`}
                    >
                      {attempt.difficulty}
                    </span>
                    {(attempt.candidate_id || attempt.user_email) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-950 text-slate-300 border border-slate-800 font-mono">
                        Candidate ID: {attempt.candidate_id || attempt.user_email}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Trophy className="w-3.5 h-3.5 text-brand-400" />
                      Score: <strong className="text-white">{attempt.correct_count}</strong>/{attempt.total_questions}
                    </span>

                    <span className="flex items-center gap-1 text-slate-300">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      Accuracy: <strong className="text-emerald-400">{attempt.accuracy_percentage}%</strong>
                    </span>

                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Time: <strong className="text-cyan-300">{formatTime(attempt.time_taken_seconds)}</strong>
                    </span>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                      <Calendar className="w-3 h-3" />
                      {new Date(attempt.submitted_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onReviewAttempt(attempt);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Review complete paper, solutions & timing"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Solutions</span>
                  </button>

                  <button
                    onClick={() => {
                      onRetakeAttempt(attempt);
                      onClose();
                    }}
                    className="p-1.5 text-slate-400 hover:text-white bg-dark-850 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
                    title="Retake this test"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteAttempt(attempt.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 bg-dark-850 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
                    title="Delete attempt record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
