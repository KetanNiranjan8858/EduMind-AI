import React from 'react';
import {
  X,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Zap,
  Layers
} from 'lucide-react';

const PREP_TRACKS = [
  {
    id: 'gate',
    title: 'GATE Computer Science & IT',
    badge: 'Competitive Exam',
    color: 'from-rose-500/20 to-purple-500/20 border-rose-500/30 text-rose-300',
    description: 'High-rigor focus on Operating Systems, Computer Architecture, Data Structures, Algorithms, DBMS, and Theory of Computation.',
    topics: ['Virtual Memory & Paging', 'CPU Scheduling & Semaphores', 'Cache Memory Mapping', 'Relational Algebra & Normalization', 'Graph Algorithms & Dynamic Programming'],
    defaultQuestions: 15,
    difficulty: 'Hard'
  },
  {
    id: 'tcs',
    title: 'TCS NQT & IT Placements',
    badge: 'Placement & Qualifier',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
    description: 'Aptitude benchmarks, programming logic invariants, pseudo-code analysis, arrays, string manipulations, and systems fundamentals.',
    topics: ['Programming Logic & Pointers', 'Data Structures (Trees, Queues)', 'Time Complexity Calculations', 'OOP Concepts & Polymorphism', 'SQL Queries & Indexing'],
    defaultQuestions: 10,
    difficulty: 'Medium'
  },
  {
    id: 'univ',
    title: 'University Engineering Finals',
    badge: 'Academic Curriculum',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    description: 'Detailed theoretical definitions, step-by-step mathematical proofs, architectural diagrams, and comprehensive exam questions.',
    topics: ['System Architecture Layers', 'Design Trade-offs & Invariants', 'Algorithm Correctness Proofs', 'Network Protocols & OSI Layers'],
    defaultQuestions: 10,
    difficulty: 'Medium'
  }
];

export default function ExamPrepModal({ isOpen, onClose, onSelectTrack }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-xl text-white">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Exam Preparation Tracks</h3>
              <p className="text-[11px] text-slate-400">
                Curated curriculum benchmarks tailored for competitive and academic excellence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracks List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-dark-950/40">
          {PREP_TRACKS.map((track) => (
            <div
              key={track.id}
              className={`p-5 rounded-2xl bg-gradient-to-r border transition-all hover:border-brand-500/50 flex flex-col gap-3 ${track.color}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{track.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-dark-950/80 text-white border border-white/10">
                      {track.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTrack(track);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-white text-dark-950 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Prepare Track</span>
                </button>
              </div>

              {/* Topics Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-semibold text-slate-400 mr-1">Key Focus:</span>
                {track.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-dark-900/80 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700/60 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
