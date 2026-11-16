import React from 'react';
import { Target, ArrowLeft, User } from 'lucide-react';

export default function ExamPrepHeader({
  currentUser,
  onReturnToStudio,
  onRequireLogin
}) {
  return (
    <header className="h-14 bg-dark-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 shadow-sm z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onReturnToStudio}
          className="px-3 py-1.5 bg-dark-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Return to Study Studio"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Studio</span>
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              Exam Preparation Dashboard
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
              Official GATE CS/IT Benchmark Question Bank
            </span>
          </div>
        </div>
      </div>

      {/* User Identity / Login Button */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="px-3 py-1.5 bg-dark-850 border border-slate-700/80 rounded-xl text-xs flex items-center gap-2 text-slate-200">
            <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium max-w-[130px] truncate">{currentUser.name}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onRequireLogin}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <User className="w-3 h-3" />
            <span>Login / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
