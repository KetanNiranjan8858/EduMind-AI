import React, { useState } from 'react';
import { Sparkles, X, Play, Clock, BookOpen, CheckCircle2, ShieldCheck, Layers, Loader2 } from 'lucide-react';
import { generateExamPrepTest } from '../../utils/api';

export default function GenerateExamModal({
  isOpen,
  onClose,
  selectedSubjectIds = ['all'],
  isAllSelected = true,
  questionsPool = [],
  subjects = [],
  filteredExams = [],
  allExams = [],
  onLaunchExam
}) {
  if (!isOpen) return null;

  const [generating, setGenerating] = useState(false);

  // Extract all questions in pool
  const allAvailableQuestions = questionsPool.length > 0
    ? questionsPool
    : (filteredExams.length > 0 ? filteredExams : allExams).flatMap((e) =>
      (e.questions || []).map((q) => ({
        ...q,
        subjectName: e.subject
      }))
    );

  const maxQuestions = Math.max(1, allAvailableQuestions.length);

  // Preset Configurations
  const presets = [
    { count: 10, time: 25, label: '10 Questions', desc: 'Rapid assessment' },
    { count: 20, time: 50, label: '20 Questions', desc: 'Standard sectional mock' },
    { count: 30, time: 75, label: '30 Questions', desc: 'Half-length benchmark' },
    { count: 65, time: 180, label: '65 Questions', desc: 'Official GATE simulation' },
    { count: Math.min(100, maxQuestions), time: 180, label: `${Math.min(100, maxQuestions)} Questions`, desc: 'Full pool comprehensive' }
  ].filter((p) => p.count <= maxQuestions);

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(
    presets.findIndex((p) => p.count === 20) >= 0 ? presets.findIndex((p) => p.count === 20) : 0
  );

  const activePreset = presets[selectedPresetIndex] || presets[0] || { count: 10, time: 25 };

  async function handleGenerateAndAttempt() {
    setGenerating(true);
    try {
      const res = await generateExamPrepTest({
        subjectIds: isAllSelected ? ['all'] : selectedSubjectIds,
        questionCount: activePreset.count,
        timeLimitMinutes: activePreset.time,
        difficulty: 'Hard'
      });
      if (res.quiz) {
        setGenerating(false);
        onClose();
        onLaunchExam(res.quiz);
        return;
      }
    } catch (err) {
      console.warn('[GenerateExamModal] API generation failed, falling back to local pool:', err.message);
    } finally {
      setGenerating(false);
    }

    // Fallback using loaded questionsPool
    const shuffledPool = [...allAvailableQuestions].sort(() => 0.5 - Math.random());
    const pickedQuestions = shuffledPool.slice(0, activePreset.count).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    const subjectNames = Array.from(new Set(pickedQuestions.map((q) => q.subjectName || q.subject_name))).filter(Boolean);
    const title =
      isAllSelected || subjectNames.length > 3
        ? `GATE CS/IT: Generated Mock Assessment (${activePreset.count} Qs)`
        : `GATE CS: ${subjectNames.join(', ')} (${activePreset.count} Qs)`;

    const generatedQuiz = {
      id: `generated_gate_${Date.now()}`,
      track: 'gate_cs',
      subject: isAllSelected ? 'GATE CS/IT Full Syllabus' : subjectNames.join(', '),
      quizTitle: title,
      difficulty: 'Hard',
      totalQuestions: pickedQuestions.length,
      timeLimitMinutes: activePreset.time,
      description: `Official benchmark assessment generated from database across ${subjectNames.length} GATE CS/IT subjects. Timed under official CBT conditions.`,
      topics: Array.from(new Set(pickedQuestions.map((q) => q.topic))).filter(Boolean).slice(0, 8),
      questions: pickedQuestions,
      generatedAt: Date.now()
    };

    onClose();
    onLaunchExam(generatedQuiz);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-slate-800 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-rose-600 via-purple-600 to-brand-600 rounded-xl text-white shadow-md shadow-rose-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Generate Exam for Attempt
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Custom CBT simulation from official GATE CS/IT subjects
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Included Subjects Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Subjects Included ({poolExams.length}):
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {allAvailableQuestions.length} Total Questions in Pool
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-xl bg-dark-950 border border-slate-800/80 max-h-24 overflow-y-auto">
              {poolExams.map((e) => (
                <span
                  key={e.id}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-rose-300 border border-rose-500/30"
                >
                  {e.subject}
                </span>
              ))}
            </div>
          </div>

          {/* Test Format Presets */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Choose Test Length & Timer:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset, idx) => {
                const isSelected = selectedPresetIndex === idx;
                return (
                  <button
                    key={preset.count}
                    type="button"
                    onClick={() => setSelectedPresetIndex(idx)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/60 shadow-md shadow-rose-950/20 text-white'
                        : 'bg-dark-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-dark-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{preset.label}</span>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Clock className="w-3 h-3 text-rose-400" />
                        <span>{preset.time}m</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GATE CBT Features Info */}
          <div className="p-3.5 rounded-2xl bg-dark-950/70 border border-slate-800 text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2 text-brand-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Computer-Based Test (CBT) Simulation</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Launches into the official CBT test runner with digital countdown timer, question palette, answer marking scheme, and comprehensive performance analytics review upon submission.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-dark-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-dark-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {/* Primary CTA: Attempt Exam */}
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerateAndAttempt}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-purple-600 to-brand-600 hover:from-rose-500 hover:via-purple-500 hover:to-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Exam...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Attempt Generated Exam ({activePreset.count} Qs)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
