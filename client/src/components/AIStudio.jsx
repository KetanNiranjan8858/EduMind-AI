import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Play,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Award
} from 'lucide-react';

export default function AIStudio({
  selectedSources = [],
  recentQuizzes = [],
  generating = false,
  onGenerateQuiz,
  onLaunchExam,
  onDeleteRecentQuiz
}) {
  const [difficulty, setDifficulty] = useState('GATE Level');
  const [questionCount, setQuestionCount] = useState(10);
  const [customTopic, setCustomTopic] = useState('');

  const difficultyLevels = [
    { id: 'Easy', label: 'Easy', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { id: 'Medium', label: 'Medium', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { id: 'Hard', label: 'Hard', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    {
      id: 'GATE Level',
      label: 'GATE Level',
      color: 'border-rose-500/40 text-rose-300 bg-gradient-to-r from-rose-500/20 to-purple-500/20'
    }
  ];

  function handleGenerate() {
    if (selectedSources.length === 0 || generating) return;
    onGenerateQuiz({
      difficulty,
      questionCount,
      customTopic
    });
  }

  return (
    <div className="h-full flex flex-col bg-dark-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-lg text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              AI CBT Studio
            </h2>
            <p className="text-[11px] text-slate-400">
              Exam Generator & Recent Outputs
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Contextual Selection Status */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-dark-950/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              Source Context
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedSources.length > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {selectedSources.length} Selected
            </span>
          </div>

          {selectedSources.length > 0 ? (
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {selectedSources.map((s) => (
                <div
                  key={s.id}
                  className="text-[11px] font-mono text-slate-300 truncate bg-dark-900 px-2 py-1 rounded border border-slate-800/80 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                  <span className="truncate">{s.original_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-amber-400/90 flex items-center gap-1.5 py-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Select files from the Sources panel to unlock assessment generation.</span>
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Assessment Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {difficultyLevels.map((lvl) => {
              const isActive = difficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-center flex items-center justify-center gap-1.5 ${
                    isActive
                      ? `${lvl.color} ring-1 ring-white/20 shadow-sm font-semibold`
                      : 'border-slate-800 bg-dark-950 text-slate-400 hover:bg-dark-850 hover:text-slate-200'
                  }`}
                >
                  {lvl.id === 'GATE Level' && <Award className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Number of Questions
            </label>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {questionCount} Qs ({questionCount} min paper)
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-brand-500 bg-dark-950 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>1 Q</span>
            <span>10 Qs</span>
            <span>20 Qs</span>
            <span>30 Qs</span>
          </div>
        </div>

        {/* Optional Subtopic focus */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Focus Sub-Topic <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. Graph Theory, Paging, Page Faults"
            className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
          />
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || selectedSources.length === 0}
          className={`w-full py-3 px-4 rounded-xl font-medium text-xs text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
            selectedSources.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
              : generating
              ? 'bg-gradient-to-r from-brand-700 to-indigo-800 opacity-90 cursor-wait'
              : 'bg-gradient-to-r from-brand-600 via-indigo-600 to-rose-600 hover:from-brand-500 hover:via-indigo-500 hover:to-rose-500 shadow-brand-500/25 glow-brand'
          }`}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Gemini 2.5 is authoring paper...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate CBT Assessment</span>
            </>
          )}
        </button>

        {/* Recent Outputs (Interactive Buttons) */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Recent Outputs
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {recentQuizzes.length} available
            </span>
          </div>

          {recentQuizzes.length === 0 ? (
            <div className="p-4 rounded-xl bg-dark-950/40 border border-slate-800/80 text-center text-slate-500 text-xs">
              No tests generated yet. Click "Generate CBT Assessment" above.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentQuizzes.map((quiz, idx) => (
                <div
                  key={quiz.generatedAt || idx}
                  className="group relative p-3 rounded-xl bg-dark-950 border border-slate-800/90 hover:border-brand-500/50 hover:bg-dark-850 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                        {quiz.quizTitle || 'Generated Practice Paper'}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded border ${
                            quiz.difficulty === 'GATE Level'
                              ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                              : 'text-brand-400 border-brand-500/30 bg-brand-500/10'
                          }`}
                        >
                          {quiz.difficulty || 'Custom'}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono">
                          {quiz.questions?.length || quiz.totalQuestions || 0} Questions
                        </span>
                        {quiz.isMock && (
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 rounded border border-amber-500/20">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRecentQuiz(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Remove from recent outputs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Launch Exam Button */}
                  <button
                    type="button"
                    onClick={() => onLaunchExam(quiz)}
                    className="w-full py-1.5 px-3 bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/40 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch CBT Exam Portal</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
