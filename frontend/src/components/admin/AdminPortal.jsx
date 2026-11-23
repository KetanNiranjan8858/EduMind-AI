import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Layers,
  Database,
  ChevronRight,
  Shield,
  Upload
} from 'lucide-react';
import AdminQuestionManager from './AdminQuestionManager';
import AdminMockTestManager from './AdminMockTestManager';

export default function AdminPortal({
  currentUser,
  onReturnToPrep,
  onLaunchExam
}) {
  // 'questions' | 'mocktests'
  const [activeTab, setActiveTab] = useState('questions');

  return (
    <div className="h-screen w-screen flex bg-[#F4EFE6] text-[#1C1917] overflow-hidden font-sans">
      {/* ==================================================== */}
      {/* 1. Dedicated Admin Sidebar (Left Navigation)         */}
      {/* ==================================================== */}
      <aside className="w-64 shrink-0 bg-white border-r border-[#E6DFD3] flex flex-col justify-between h-full select-none z-20 shadow-xs">
        {/* Top: Branding & Title */}
        <div>
          <div className="h-14 px-5 border-b border-[#E6DFD3] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#173F3D] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#FAF7F2]" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-[#1C1917]">
                  Exam Prep <span className="text-[#173F3D]">Admin</span>
                </span>
                <span className="text-[10px] text-[#78716C] block -mt-0.5 font-medium">
                  GATE Question Control
                </span>
              </div>
            </div>
          </div>

          {/* Core Modules Navigation */}
          <div className="p-3 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
              Exam Prep Operations
            </div>

            {/* Questions Bank & Uploads */}
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-[#173F3D] text-white shadow-xs'
                  : 'text-[#1C1917] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className={`w-4 h-4 ${activeTab === 'questions' ? 'text-white' : 'text-[#173F3D]'}`} />
                <span>Question Bank & Upload</span>
              </div>
              {activeTab === 'questions' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Mock Test Generator */}
            <button
              type="button"
              onClick={() => setActiveTab('mocktests')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'mocktests'
                  ? 'bg-[#173F3D] text-white shadow-xs'
                  : 'text-[#1C1917] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${activeTab === 'mocktests' ? 'text-white' : 'text-[#173F3D]'}`} />
                <span>Mock Test Generator</span>
              </div>
              {activeTab === 'mocktests' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom: Admin Account & System Status */}
        <div className="p-3 border-t border-[#E6DFD3] bg-[#FAF7F2] space-y-2">
          {/* Status Indicator */}
          <div className="px-3 py-1.5 bg-white border border-[#E6DFD3] rounded-xl flex items-center justify-between text-[11px] text-[#78716C]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#173F3D] animate-ping" />
              <span className="text-[#1C1917] font-medium">Exam Prep DB</span>
            </div>
            <span className="text-[10px] font-mono text-[#173F3D] font-bold">Active</span>
          </div>

          {/* Current Admin Identity */}
          <div className="px-3 py-2 bg-white border border-[#E6DFD3] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#173F3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1C1917] truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-[#173F3D] font-semibold truncate">
                  Staff / Admin Access
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* 2. Main Content Area                                  */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header of Main Area */}
        <header className="h-14 bg-white border-b border-[#E6DFD3] px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
          <div className="flex items-center gap-3 text-xs">
            {onReturnToPrep && (
              <button
                type="button"
                onClick={onReturnToPrep}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3] rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Return to Exam Preparation Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#173F3D]" />
                <span>Return to Exam Prep</span>
              </button>
            )}

            <div className="h-4 w-px bg-[#E6DFD3]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#78716C] font-medium">Exam Prep Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
              <span className="text-[#1C1917] font-bold">
                {activeTab === 'questions' ? 'Questions Bank & Upload Center' : 'Mock Test Generator & Management'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
              Exam Prep DB Active
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#F4EFE6]">
          {activeTab === 'questions' ? (
            <AdminQuestionManager onSwitchToMockTests={() => setActiveTab('mocktests')} />
          ) : (
            <AdminMockTestManager onLaunchExam={onLaunchExam} />
          )}
        </main>
      </div>
    </div>
  );
}
