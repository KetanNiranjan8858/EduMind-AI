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
    <div className="p-4 rounded-2xl bg-white border border-[#E6DFD3] shadow-xs space-y-3 transition-all hover:border-[#173F3D]/30">
      {/* Question Header & Meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-xs font-mono font-extrabold text-[#173F3D] shrink-0 mt-0.5">
            Q{index + 1}.
          </span>
          <div className="space-y-1 min-w-0">
            <div className="text-xs text-[#1C1917] font-semibold leading-relaxed whitespace-pre-wrap">
              {q.question}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              {q.topic && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#78716C] border border-[#E6DFD3]">
                  {q.topic}
                </span>
              )}
              {q.difficulty && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                  {q.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAskAi(q)}
          className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#173F3D] border border-[#DCD2C0] text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-2xs cursor-pointer"
          title="Ask AI Tutor for step-by-step derivation"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#173F3D]" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-1">
        {Object.entries(q.options || {}).map(([key, value]) => {
          const isCorrect = isRevealed && key === q.correctAnswer;
          return (
            <div
              key={key}
              className={`p-2.5 rounded-xl border text-xs flex items-baseline gap-2 transition-all ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                  : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917]'
              }`}
            >
              <span
                className={`font-mono font-bold text-xs shrink-0 ${
                  isCorrect ? 'text-emerald-700' : 'text-[#78716C]'
                }`}
              >
                ({key})
              </span>
              <span className="leading-snug">{value}</span>
              {isCorrect && (
                <span className="text-[10px] font-bold text-emerald-700 ml-auto shrink-0">
                  ✓ Correct
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Toggle Explanation & Solution */}
      <div className="pl-6 pt-1 flex items-center justify-between text-xs border-t border-[#E6DFD3]/60">
        <button
          type="button"
          onClick={() => onToggleExplanation(q.id)}
          className="font-semibold text-[#173F3D] hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {isRevealed ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Solution & Derivation</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Solution & Derivation</span>
            </>
          )}
        </button>

        {isRevealed && (
          <span className="font-mono text-emerald-800 font-bold text-xs">
            Correct Answer: ({q.correctAnswer})
          </span>
        )}
      </div>

      {/* Expanded Detailed Solution */}
      {isRevealed && (
        <div className="ml-6 p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-xs text-[#1C1917] space-y-1.5 animate-in fade-in duration-150">
          <div className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Step-by-Step Derivation:</span>
          </div>
          <p className="leading-relaxed text-[#44403C] whitespace-pre-wrap">
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
