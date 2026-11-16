import React from 'react';
import { Filter } from 'lucide-react';

export default function ExamPrepSubjectSidebar({
  subjects = [],
  isAllSelected,
  selectedSubjectIds = [],
  onToggleSubject,
  onSelectAll,
  onClearAll,
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

      {/* Clean Subject Checkbox List — Only Subject Name and Checkbox (No enclosing box per subject) */}
      <div className="flex-1 overflow-y-auto py-3 px-3.5 space-y-2">
        {subjects.map((subject) => {
          const isChecked = isSubjectChecked(subject.id);

          return (
            <label
              key={subject.id}
              className="flex items-center gap-3 py-1.5 px-1 cursor-pointer select-none group transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleSubject(subject.id)}
                className="w-4 h-4 rounded border-slate-700 bg-dark-950 text-rose-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-rose-600 shrink-0"
              />
              <span
                className={`text-xs transition-colors truncate ${
                  isChecked
                    ? 'text-rose-300 font-semibold'
                    : 'text-slate-300 group-hover:text-white font-medium'
                }`}
              >
                {subject.name}
              </span>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
