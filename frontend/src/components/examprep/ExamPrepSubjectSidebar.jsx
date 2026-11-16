import React from 'react';
import { Filter, Check } from 'lucide-react';
import { getSubjectIcon } from './subjectIcons';

export default function ExamPrepSubjectSidebar({
  subjects = [],
  isAllSelected,
  selectedSubjectIds = [],
  onToggleSubject,
  onSelectAll,
  onClearAll,
  totalQuestionsInBank = 100,
  gateExams = [],
  attemptedSubjectIds = new Set(),
  allSubjectIds = []
}) {
  function isSubjectChecked(subjectId) {
    if (subjectId === 'all') return isAllSelected;
    if (selectedSubjectIds.includes('all')) return true;
    return selectedSubjectIds.includes(subjectId);
  }

  return (
    <aside className="w-72 shrink-0 border-r border-slate-800 bg-dark-900/60 flex flex-col overflow-hidden">
      {/* Sidebar Header with Selection Counter */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-dark-850/70">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Select Subject
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
            {isAllSelected ? 'All' : selectedSubjectIds.length}/{allSubjectIds.length} Selected
          </span>
        </div>
      </div>

      {/* Quick Select All / Clear All Row */}
      <div className="px-3 py-2 border-b border-slate-800/60 bg-dark-950/40 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={onSelectAll}
          className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
        >
          Select All
        </button>
        <span className="text-slate-600">•</span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-slate-400 hover:text-slate-200 font-semibold cursor-pointer transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Subject Checkbox Navigation List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {subjects.map((subject) => {
          const isChecked = isSubjectChecked(subject.id);
          const IconComponent = getSubjectIcon(subject.id);
          const isAttempted = attemptedSubjectIds.has(subject.id);
          const qCount =
            subject.id === 'all'
              ? totalQuestionsInBank
              : gateExams
                  .filter((e) => e.subjectId === subject.id)
                  .reduce((s, e) => s + (e.questions?.length || 0), 0);

          return (
            <div
              key={subject.id}
              onClick={() => onToggleSubject(subject.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all cursor-pointer group select-none ${
                isChecked
                  ? 'bg-rose-500/15 border border-rose-500/40 text-rose-200 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Checkbox Icon */}
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    isChecked
                      ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                      : 'bg-dark-950 border-slate-700 group-hover:border-slate-500'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Subject Icon */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-dark-950 text-slate-400 group-hover:text-slate-200 group-hover:bg-dark-850 border border-slate-800'
                  }`}
                >
                  <IconComponent className="w-3 h-3" />
                </div>

                {/* Subject Title */}
                <div className="min-w-0">
                  <div className="truncate text-xs tracking-tight">{subject.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {qCount} Questions
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isAttempted && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"
                    title="Subject Practiced"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
