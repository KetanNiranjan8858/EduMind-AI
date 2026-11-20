import React from 'react';
import { Target, ArrowLeft, User } from 'lucide-react';

export default function ExamPrepHeader({
  currentUser,
  onReturnToStudio,
  onRequireLogin
}) {
  return (
    <header className="h-14 bg-[#F4EFE6] border-b border-[#E6DFD3] px-5 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReturnToStudio}
          className="px-3 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#DCD2C0] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          title="Return to Study Studio"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#173F3D]" />
          <span>Return to Studio</span>
        </button>

        <div className="h-4 w-px bg-[#DCD2C0]" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#173F3D] flex items-center justify-center text-white shadow-sm">
            <Target className="w-4 h-4 text-[#FAF7F2]" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#1C1917]">
              Exam Preparation <span className="text-[#173F3D]">Dashboard</span>
            </span>
            <span className="text-[10px] text-[#78716C] block -mt-0.5 font-medium">
              Official GATE CS/IT Benchmark Question Bank
            </span>
          </div>
        </div>
      </div>

      {/* User Identity / Login Button */}
      <div className="flex items-center gap-2.5">
        {currentUser ? (
          <div className="px-3.5 py-1.5 bg-white border border-[#DCD2C0] rounded-xl text-xs flex items-center gap-2 text-[#1C1917] font-semibold shadow-xs">
            <div className="w-5 h-5 rounded-full bg-[#173F3D] text-[#FAF7F2] flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[130px] truncate">{currentUser.name}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequireLogin}
            className="px-3.5 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
