import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  Lock
} from 'lucide-react';

export default function AIStudio({
  currentUser = null,
  selectedSources = [],
  recentQuizzes = [],
  generating = false,
  onGenerateQuiz,
  onLaunchExam,
  onDeleteRecentQuiz,
  onRequireLogin
}) {
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);

  const difficultyLevels = [
    { id: 'Easy', label: 'Easy' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Hard', label: 'Hard' }
  ];

  function handleGenerate() {
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (selectedSources.length === 0 || generating) return;
    onGenerateQuiz({
      difficulty,
      questionCount
    });
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header matching mockup */}
      <div className="p-4 border-b border-[#E6DFD3] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
              AI CBT STUDIO
            </h2>
            <p className="text-[11px] text-[#78716C]">
              Exam Generator & Recent Outputs
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
        {/* Source Context */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#173F3D]" />
              Source Context
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                !currentUser
                  ? 'bg-[#FAF7F2] text-[#78716C] border-[#E6DFD3]'
                  : selectedSources.length > 0
                  ? 'bg-[#E8DFCF] text-[#173F3D] border-[#DCD2C0]'
                  : 'bg-[#FAF7F2] text-[#78716C] border-[#E6DFD3]'
              }`}
            >
              {!currentUser ? 'Sign In Required' : `${selectedSources.length} Selected`}
            </span>
          </div>

          {!currentUser ? (
            <div className="text-[11px] text-[#78716C] flex items-center justify-between py-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#173F3D] shrink-0" />
                Sign in to create & attempt assessments
              </span>
              <button
                type="button"
                onClick={onRequireLogin}
                className="text-[10px] text-[#173F3D] hover:underline font-bold ml-2 cursor-pointer"
              >
                Log In
              </button>
            </div>
          ) : selectedSources.length > 0 ? (
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {selectedSources.map((s) => (
                <div
                  key={s.id}
                  className="text-xs font-medium text-[#1C1917] truncate flex items-center gap-2 py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173F3D] shrink-0" />
                  <span className="truncate">{s.original_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-[#78716C] flex items-center gap-1.5 py-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#173F3D]" />
              <span>Select files from the Sources panel to unlock assessment generation.</span>
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-xs font-bold text-[#1C1917] mb-2">
            Assessment Difficulty
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F2] rounded-xl border border-[#E6DFD3] text-xs">
            {difficultyLevels.map((lvl) => {
              const isActive = difficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-[#173F3D] text-white shadow-2xs'
                      : 'text-[#1C1917] hover:bg-white/80'
                  }`}
                >
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count Slider matching mockup */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#1C1917]">
              Number of Questions
            </label>
            <span className="text-xs font-bold text-[#173F3D]">
              {questionCount} Qs
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-[#173F3D] bg-[#E6DFD3] h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#78716C] mt-1 font-medium">
            <span>10 s</span>
            <span>10 Qs</span>
            <span>20 Qs</span>
            <span>10 Qs</span>
          </div>
        </div>

        {/* Generate Button (Solid Deep Forest Teal matching mockup) */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || (currentUser && selectedSources.length === 0)}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
            !currentUser
              ? 'bg-[#173F3D] hover:bg-[#102B2A] cursor-pointer'
              : selectedSources.length === 0
              ? 'bg-[#DCD2C0] text-[#78716C] cursor-not-allowed'
              : generating
              ? 'bg-[#173F3D] opacity-90 cursor-wait'
              : 'bg-[#173F3D] hover:bg-[#102B2A] cursor-pointer'
          }`}
        >
          {!currentUser ? (
            <>
              <Lock className="w-4 h-4 text-[#FAF7F2]" />
              <span>Generate CBT Assessment (Sign In Required)</span>
            </>
          ) : generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
              <span>Generate CBT Assessment</span>
            </>
          )}
        </button>

        {/* Recent Outputs */}
        <div className="pt-3 border-t border-[#E6DFD3]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#173F3D]" />
              RECENT OUTPUTS
            </h3>
            <span className="text-[10px] text-[#78716C] font-mono">
              {recentQuizzes.length} available
            </span>
          </div>

          {recentQuizzes.length === 0 ? (
            <div className="py-6 text-center text-[#78716C] text-xs">
              No tests generated yet. Click "Generate CBT Assessment" above.
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentQuizzes.map((quiz, idx) => (
                <div
                  key={quiz.generatedAt || idx}
                  className="group p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] transition-colors flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#1C1917] truncate">
                      {quiz.quizTitle || 'Generated Practice Paper'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#78716C]">
                      <span className="text-[#173F3D] font-semibold">{quiz.difficulty || 'Custom'}</span>
                      <span>•</span>
                      <span>{quiz.questions?.length || quiz.totalQuestions || 0} Qs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLaunchExam(quiz)}
                      className="px-3 py-1 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Launch exam"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecentQuiz(idx)}
                      className="p-1 text-[#78716C] hover:text-rose-500 rounded transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
