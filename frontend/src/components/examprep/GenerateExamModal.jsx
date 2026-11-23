import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Play,
  Clock,
  Layers,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen
} from 'lucide-react';
import { generateExamPrepTest } from '../../utils/api';

export default function GenerateExamModal({
  isOpen,
  onClose,
  selectedSubjectIds = ['all'],
  isAllSelected = true,
  subjects = [],
  questionsPool = [],
  onTestGenerated,
  onLaunchExam
}) {
  if (!isOpen) return null;

  // Form State
  const [difficulty, setDifficulty] = useState('Hard'); // 'Hard' | 'Medium' | 'Easy'
  const [questionCount, setQuestionCount] = useState(10);
  const [syllabusScope, setSyllabusScope] = useState(isAllSelected ? 'all' : 'selected'); // 'all' | 'selected'
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const difficultyLevels = [
    { id: 'Hard', label: 'Hard', desc: 'GATE CS benchmark standard', recommended: true },
    { id: 'Medium', label: 'Medium', desc: 'Standard concept verification', recommended: false },
    { id: 'Easy', label: 'Easy', desc: 'Foundational review', recommended: false }
  ];

  const questionCountOptions = [
    { count: 5, label: '5 Questions', time: 15, desc: 'Quick concept drill' },
    { count: 10, label: '10 Questions', time: 25, desc: 'Sectional practice (Recommended)' },
    { count: 15, label: '15 Questions', time: 40, desc: 'Comprehensive practice' },
    { count: 25, label: '25 Questions', time: 65, desc: 'Full sectional mock' },
    { count: 65, label: '65 Questions', time: 180, desc: 'Official GATE simulation' }
  ];

  const activeCountOption = questionCountOptions.find((o) => o.count === questionCount) || questionCountOptions[1];
  const timeLimitMinutes = activeCountOption.time;

  // Active Subject Scope Description
  const activeSubjectNames = React.useMemo(() => {
    if (syllabusScope === 'all') return 'Full GATE CS/IT Syllabus';
    const names = subjects
      .filter((s) => selectedSubjectIds.includes(s.id))
      .map((s) => s.name);
    if (names.length === 1) return names[0];
    if (names.length > 1) return `${names.length} Selected Subjects`;
    return 'Full GATE CS/IT Syllabus';
  }, [syllabusScope, selectedSubjectIds, subjects]);

  async function handleGenerate(andLaunch = false) {
    if (generating) return;
    setGenerating(true);
    setError(null);

    const targetSubjectIds = syllabusScope === 'all'
      ? ['all']
      : selectedSubjectIds.length > 0 ? selectedSubjectIds : ['all'];

    try {
      const res = await generateExamPrepTest({
        examId: 'gate_cs',
        subjectIds: targetSubjectIds,
        difficulty,
        questionCount,
        timeLimitMinutes
      });

      if (res.success && res.quiz) {
        if (onTestGenerated) {
          onTestGenerated(res.quiz);
        }
        onClose();
        if (andLaunch && onLaunchExam) {
          onLaunchExam(res.quiz);
        }
        return;
      }
    } catch (err) {
      console.warn('API test generation fallback:', err.message);
    } finally {
      setGenerating(false);
    }

    // Direct fallback from questionsPool
    let pool = [...(questionsPool || [])];
    if (difficulty !== 'all') {
      const diffPool = pool.filter((q) => (q.difficulty || '').toLowerCase() === difficulty.toLowerCase());
      if (diffPool.length > 0) pool = diffPool;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, questionCount).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    const quiz = {
      id: `test_${Date.now()}`,
      exam_id: 'gate_cs',
      track: 'gate_cs',
      title: `GATE CS: ${activeSubjectNames} (${picked.length} Qs)`,
      quizTitle: `GATE CS: ${activeSubjectNames} (${picked.length} Qs)`,
      subject: activeSubjectNames,
      subject_ids: targetSubjectIds.join(','),
      difficulty,
      total_questions: picked.length,
      totalQuestions: picked.length,
      time_limit_minutes: timeLimitMinutes,
      timeLimitMinutes,
      description: `Benchmark test generated from official question bank.`,
      topics: [],
      questions: picked
    };

    if (onTestGenerated) {
      onTestGenerated(quiz);
    }
    onClose();
    if (andLaunch && onLaunchExam) {
      onLaunchExam(quiz);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#E6DFD3] rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E6DFD3] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1C1917] tracking-tight">
                Generate Question Test
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Pick questions from the Admin Database to generate a benchmark mock test.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Syllabus Scope */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-[#173F3D]" />
              Syllabus Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSyllabusScope('selected')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  syllabusScope === 'selected'
                    ? 'bg-[#173F3D] text-white border-[#173F3D] shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917] hover:bg-[#F2EAE0]'
                }`}
              >
                <div className="text-xs font-bold truncate">Selected Subject(s)</div>
                <div className={`text-[10px] mt-0.5 truncate ${syllabusScope === 'selected' ? 'text-[#FAF7F2]' : 'text-[#78716C]'}`}>
                  {activeSubjectNames}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSyllabusScope('all')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  syllabusScope === 'all'
                    ? 'bg-[#173F3D] text-white border-[#173F3D] shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917] hover:bg-[#F2EAE0]'
                }`}
              >
                <div className="text-xs font-bold">All 10 GATE Subjects</div>
                <div className={`text-[10px] mt-0.5 ${syllabusScope === 'all' ? 'text-[#FAF7F2]' : 'text-[#78716C]'}`}>
                  Full syllabus benchmark
                </div>
              </button>
            </div>
          </div>

          {/* 2. Question Difficulty (Crucial: "ask for question and difficulty") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-[#173F3D]" />
                Select Difficulty Level
              </label>
              <span className="text-[10px] text-[#173F3D] font-bold">
                Target: {difficulty}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {difficultyLevels.map((lvl) => {
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#173F3D] text-white border-[#173F3D] shadow-xs'
                        : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917] hover:bg-[#F2EAE0]'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-center gap-1">
                      <span>{lvl.label}</span>
                      {lvl.recommended && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-[#1C1917] font-extrabold">
                          GATE
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-[#FAF7F2]' : 'text-[#78716C]'}`}>
                      {lvl.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {difficulty === 'Hard' && (
              <div className="p-2.5 rounded-xl bg-[#E5ECEB] border border-[#C9DCDA] text-[11px] text-[#173F3D]">
                ⚡ <strong>Hard Benchmark</strong>: Calibrated to challenging, multi-tier derivations and official GATE CS examination standards.
              </div>
            )}
          </div>

          {/* 3. Number of Questions ("ask for question") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#1C1917] flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#173F3D]" />
                Number of Questions
              </label>
              <span className="font-bold text-[#173F3D]">
                {questionCount} Questions ({timeLimitMinutes} Mins)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {questionCountOptions.map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setQuestionCount(opt.count)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    questionCount === opt.count
                      ? 'bg-[#173F3D] text-white border-[#173F3D] shadow-xs'
                      : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917] hover:bg-[#F2EAE0]'
                  }`}
                >
                  <div>{opt.count} Qs</div>
                  <div className={`text-[9px] font-normal ${questionCount === opt.count ? 'text-[#FAF7F2]' : 'text-[#78716C]'}`}>
                    {opt.time}m
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#78716C] pt-1">
              <Clock className="w-3.5 h-3.5 text-[#173F3D]" />
              <span>Standard pacing: ~2.5 minutes per question under CBT timer.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-5 border-t border-[#E6DFD3] bg-[#FAF7F2] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F2EAE0] text-[#1C1917] border border-[#DCD2C0] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={generating}
              onClick={() => handleGenerate(false)}
              className="px-4 py-2 bg-white hover:bg-[#F2EAE0] text-[#173F3D] border border-[#173F3D] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Generate to Dashboard
            </button>

            <button
              type="button"
              disabled={generating}
              onClick={() => handleGenerate(true)}
              className="px-5 py-2 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Generate & Attempt Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
