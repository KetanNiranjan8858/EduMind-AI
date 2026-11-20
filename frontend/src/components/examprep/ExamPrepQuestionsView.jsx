import React from 'react';
import { Clock } from 'lucide-react';

export default function ExamPrepQuestionsView({
  contentWidth = 600,
  isResizing = false
}) {
  const isCompact = contentWidth < 500;

  return (
    <main
      className={`flex-1 flex flex-col items-center justify-center min-w-0 bg-white rounded-2xl border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] select-none font-sans relative ${
        isCompact ? 'p-4' : 'p-8'
      } ${isResizing ? 'transition-none pointer-events-none' : ''}`}
    >
      {/* Live Width HUD Indicator while resizing */}
      {isResizing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#173F3D]/10 border border-[#173F3D]/30 text-[10px] font-mono text-[#173F3D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#173F3D] animate-pulse" />
          <span>Questions View: {Math.round(contentWidth)}px</span>
        </div>
      )}

      <div className={`text-center space-y-3.5 mx-auto transition-all ${
        isCompact ? 'max-w-xs' : 'max-w-sm'
      }`}>
        <div className={`rounded-2xl bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3] flex items-center justify-center mx-auto ${
          isCompact ? 'w-10 h-10' : 'w-12 h-12'
        }`}>
          <Clock className={isCompact ? 'w-5 h-5' : 'w-6 h-6'} />
        </div>

        <h2 className={`font-bold text-[#1C1917] tracking-tight ${
          isCompact ? 'text-xl' : 'text-2xl'
        }`}>
          Yet to come
        </h2>

        <p className="text-xs text-[#78716C] leading-relaxed">
          Content is being prepared and will be available soon.
        </p>
      </div>
    </main>
  );
}
