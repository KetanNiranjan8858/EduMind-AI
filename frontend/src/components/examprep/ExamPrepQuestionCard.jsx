import React from 'react';
import { Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ExamPrepQuestionCard({
  question: q,
  index,
  isRevealed,
  onToggleExplanation,
  onAskAi
}) {
  return (
    <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-sm space-y-3.5 transition-all hover:border-slate-700/80">
      {/* Question Header & Prompt */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
            {q.question}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAskAi(q)}
          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          title="Ask AI to explain this question"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-9">
        {Object.entries(q.options || {}).map(([key, value]) => {
          const isCorrect = isRevealed && key === q.correctAnswer;
          return (
            <div
              key={key}
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${
                isCorrect
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold shadow-sm'
                  : 'bg-dark-950/70 border-slate-800/80 text-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isCorrect
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {key}
              </span>
              <span className="leading-snug">{value}</span>
            </div>
          );
        })}
      </div>

      {/* Toggle Explanation & Solution */}
      <div className="pl-9 pt-1 flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleExplanation(q.id)}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Solution & Explanation</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Solution & Explanation</span>
            </>
          )}
        </button>

        {isRevealed && (
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            Correct Option: {q.correctAnswer}
          </span>
        )}
      </div>

      {/* Expanded Detailed GATE Explanation */}
      {isRevealed && (
        <div className="ml-9 p-3.5 rounded-xl bg-dark-950 border border-slate-800/90 text-xs text-slate-300 space-y-1.5 animation-fadeIn">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Detailed GATE Solution:</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
