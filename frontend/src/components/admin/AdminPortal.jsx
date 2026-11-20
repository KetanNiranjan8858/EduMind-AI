import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  User,
  Activity,
  Layers,
  Settings,
  Database,
  ChevronRight,
  Shield
} from 'lucide-react';
import AdminStudentManager from './AdminStudentManager';
import AdminQuestionManager from './AdminQuestionManager';

export default function AdminPortal({
  currentUser
}) {
  // 'students' | 'questions'
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="h-screen w-screen flex bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* ==================================================== */}
      {/* 1. Dedicated Admin Sidebar (Left Navigation)         */}
      {/* ==================================================== */}
      <aside className="w-64 shrink-0 bg-dark-900 border-r border-slate-800 flex flex-col justify-between h-full select-none z-20 shadow-lg">
        {/* Top: Branding & Title */}
        <div>
          <div className="h-14 px-5 border-b border-slate-800 flex items-center gap-3 bg-dark-900/90">
            <div className="w-9 h-9 rounded-xl duo-gradient flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  EduMind <span className="duo-gradient-text">Admin</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                Institutional Control Center
              </span>
            </div>
          </div>

          {/* Core Modules Navigation */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Management Modules
            </div>

            {/* Students & Performance */}
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'students' ? 'text-white' : 'text-indigo-400'}`} />
                <span>Students & Performance</span>
              </div>
              {activeTab === 'students' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Exam Prep Question Bank */}
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className={`w-4 h-4 ${activeTab === 'questions' ? 'text-white' : 'text-cyan-400'}`} />
                <span>Exam Prep Questions</span>
              </div>
              {activeTab === 'questions' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom: Admin Account & System Status */}
        <div className="p-3 border-t border-slate-800 bg-dark-950/60 space-y-2">
          {/* Status Indicator */}
          <div className="px-3 py-1.5 bg-dark-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300 font-medium">Exam Prep DB</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">Active</span>
          </div>

          {/* Current Admin Identity */}
          <div className="px-3 py-2 bg-dark-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-amber-400 font-medium truncate">
                  Staff / Admin
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
        <header className="h-14 bg-dark-900/60 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-sm z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold">
              {activeTab === 'students' ? 'Students & Performance Directory' : 'Exam Prep Question Bank'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Admin Session Active
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'students' ? (
            <AdminStudentManager />
          ) : (
            <AdminQuestionManager />
          )}
        </main>
      </div>
    </div>
  );
}
