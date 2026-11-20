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
    <div className="p-3.5 rounded-xl bg-dark-900/90 border border-slate-800/80 shadow-sm space-y-2 transition-all hover:border-slate-700/80">
      {/* Question Header & Compact Prompt */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-[11px] font-mono font-bold text-rose-400 shrink-0 mt-0.5">
            Q{index + 1}.
          </span>
          <div className="text-xs text-slate-200 font-medium leading-snug whitespace-pre-wrap">
            {q.question}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAskAi(q)}
          className="px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          title="Ask AI to explain this question"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Multiple Choice Options (No Boxes, Clean Typography List) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-6 pt-0.5">
        {Object.entries(q.options || {}).map(([key, value]) => {
          const isCorrect = isRevealed && key === q.correctAnswer;
          return (
            <div
              key={key}
              className={`flex items-baseline gap-1.5 text-xs transition-colors ${
                isCorrect
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span
                className={`font-mono font-bold text-[11px] shrink-0 ${
                  isCorrect ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                ({key})
              </span>
              <span className="leading-snug">{value}</span>
              {isCorrect && (
                <span className="text-[10px] font-bold text-emerald-400 ml-1">✓ Correct</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Toggle Explanation & Solution */}
      <div className="pl-6 pt-1 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => onToggleExplanation(q.id)}
          className="font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3 h-3" />
              <span>Hide Solution</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span>Show Solution</span>
            </>
          )}
        </button>

        {isRevealed && (
          <span className="font-mono text-emerald-400 font-bold text-[11px]">
            Correct Answer: ({q.correctAnswer})
          </span>
        )}
      </div>

      {/* Expanded Detailed Solution */}
      {isRevealed && (
        <div className="ml-6 p-2.5 rounded-lg bg-dark-950 border border-slate-800 text-[11px] text-slate-300 space-y-1 animate-in fade-in duration-150">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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
