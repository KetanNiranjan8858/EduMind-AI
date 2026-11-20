import React from 'react';
import { Filter } from 'lucide-react';

export default function ExamPrepSubjectSidebar({
  subjects = [],
  isAllSelected,
  selectedSubjectIds = [],
  onToggleSubject,
  onSelectAll,
  onClearAll,
  allSubjectIds = [],
  style,
  className = ''
}) {
  function isSubjectChecked(subjectId) {
    if (subjectId === 'all') return isAllSelected;
    if (selectedSubjectIds.includes('all')) return true;
    return selectedSubjectIds.includes(subjectId);
  }

  return (
    <aside
      style={style}
      className={`shrink-0 rounded-2xl border border-[#E6DFD3] bg-white shadow-[0_2px_12px_rgba(40,30,20,0.04)] flex flex-col overflow-hidden ${
        style?.width ? '' : 'w-72'
      } ${className}`}
    >
      {/* Sidebar Header with Selection Counter */}
      <div className="p-3.5 border-b border-[#E6DFD3] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#173F3D]" />
          <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
            Select Subject
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0] font-bold">
            {isAllSelected ? 'All' : selectedSubjectIds.length}/{allSubjectIds.length} Selected
          </span>
        </div>
      </div>

      {/* Quick Select All / Clear All Row */}
      <div className="px-3 py-2 border-b border-[#E6DFD3] bg-white flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={onSelectAll}
          className="text-[#173F3D] hover:underline font-semibold cursor-pointer transition-colors"
        >
          Select All
        </button>
        <span className="text-[#DCD2C0]">•</span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[#78716C] hover:text-[#1C1917] font-semibold cursor-pointer transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Clean Subject Checkbox List */}
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
                className="w-4 h-4 rounded border-[#DCD2C0] text-[#173F3D] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#173F3D] shrink-0"
              />
              <span
                className={`text-xs transition-colors truncate ${
                  isChecked
                    ? 'text-[#173F3D] font-bold'
                    : 'text-[#1C1917] group-hover:text-[#173F3D] font-medium'
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
