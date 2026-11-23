import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Clock,
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';
import { GATE_SUBJECTS } from '../../data/curatedExams';
import { generateExamPrepTest, fetchExamPrepTests, deleteExamPrepTest, fetchAdminQuestions } from '../../utils/api';

export default function AdminMockTestManager({ onLaunchExam }) {
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [totalBankQuestions, setTotalBankQuestions] = useState(0);

  // Form State for Generator
  const [testTitle, setTestTitle] = useState('GATE CS/IT Benchmark Full Mock Test');
  const [selectedSubjects, setSelectedSubjects] = useState(['all']);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Hard');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(25);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadTests();
    loadQuestionStats();
  }, []);

  async function loadQuestionStats() {
    try {
      const res = await fetchAdminQuestions({ examId: 'gate_cs', limit: 1 });
      setTotalBankQuestions(res.total || 0);
    } catch {}
  }

  async function loadTests() {
    setLoadingTests(true);
    try {
      const res = await fetchExamPrepTests('gate_cs');
      setTests(res.tests || []);
    } catch (err) {
      console.warn('Failed to load mock tests:', err.message);
    } finally {
      setLoadingTests(false);
    }
  }

  function handleToggleSubject(subId) {
    if (subId === 'all') {
      setSelectedSubjects(['all']);
      return;
    }

    let updated = selectedSubjects.filter((s) => s !== 'all');
    if (updated.includes(subId)) {
      updated = updated.filter((s) => s !== subId);
      if (updated.length === 0) updated = ['all'];
    } else {
      updated.push(subId);
    }
    setSelectedSubjects(updated);
  }

  function handleQuestionCountChange(count) {
    setQuestionCount(count);
    // Auto-calculate standard CBT time: ~2.5 mins per question
    setTimeLimitMinutes(Math.max(15, Math.round(count * 2.5)));
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (generating) return;

    setGenerating(true);
    setMessage(null);

    try {
      const res = await generateExamPrepTest({
        examId: 'gate_cs',
        subjectIds: selectedSubjects,
        difficulty,
        questionCount,
        timeLimitMinutes
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: `Mock test "${res.quiz?.quizTitle || testTitle}" successfully generated and published to Exam Prep DB!`
        });
        loadTests();
        loadQuestionStats();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to generate test.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Generation failed.' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Are you sure you want to delete mock test "${title}"?`)) return;
    try {
      await deleteExamPrepTest(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete mock test: ' + err.message);
    }
  }

  return (
    <div className="min-h-full flex flex-col min-w-0 bg-[#F4EFE6] p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E6DFD3] p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917]">
              Mock Test Generator & Management
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Assemble, configure, and publish CBT mock tests directly into the Exam Prep database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-xs">
            <span className="text-[#78716C]">Questions in DB: </span>
            <strong className="text-[#173F3D] font-bold">{totalBankQuestions}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              loadTests();
              loadQuestionStats();
            }}
            className="p-2 bg-white hover:bg-[#FAF7F2] text-[#173F3D] border border-[#DCD2C0] rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Refresh tests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border shadow-2xs ${
            message.type === 'success'
              ? 'bg-[#E5ECEB] text-[#173F3D] border-[#C9DCDA]'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#173F3D]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Left = Generator Form, Right = Published Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Configuration Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6DFD3] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6DFD3]">
            <Plus className="w-4 h-4 text-[#173F3D]" />
            <h3 className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
              Configure New Mock Test
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Test Title */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">
                Mock Test Title
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. GATE CS/IT Benchmark Mock Test #1"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#173F3D] transition-colors"
                required
              />
            </div>

            {/* Target Subjects Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">
                  Target Subjects
                </label>
                <span className="text-[11px] text-[#78716C]">
                  {selectedSubjects.includes('all') ? 'Full Syllabus' : `${selectedSubjects.length} Selected`}
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto p-2 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl space-y-1">
                <button
                  type="button"
                  onClick={() => handleToggleSubject('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedSubjects.includes('all')
                      ? 'bg-[#173F3D] text-white'
                      : 'text-[#1C1917] hover:bg-white'
                  }`}
                >
                  <span>All 10 Subjects (Full Syllabus)</span>
                  {selectedSubjects.includes('all') && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                {GATE_SUBJECTS.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleToggleSubject(sub.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'bg-[#173F3D] text-white'
                          : 'text-[#1C1917] hover:bg-white'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count Pills */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">
                  Number of Questions
                </label>
                <span className="text-xs font-bold text-[#173F3D]">
                  {questionCount} Questions
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 15, 25, 65].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleQuestionCountChange(cnt)}
                    className={`py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      questionCount === cnt
                        ? 'bg-[#173F3D] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3]'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Assessment Difficulty
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Easy', 'Medium', 'Hard', 'Mixed'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-[#173F3D] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">
                  Time Limit (Minutes)
                </label>
                <span className="text-xs font-bold text-[#173F3D]">
                  {timeLimitMinutes} Mins
                </span>
              </div>
              <input
                type="number"
                min="5"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#173F3D]"
                required
              />
            </div>

            {/* Generate & Publish Button */}
            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 px-4 bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Drawing Questions & Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
                  <span>Generate & Publish to Exam Prep</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Published Mock Tests List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6DFD3] p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD3] mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#173F3D]" />
              <h3 className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
                Published Mock Tests in Exam Prep DB
              </h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D]">
              {tests.length} Active Tests
            </span>
          </div>

          {loadingTests ? (
            <div className="py-16 text-center text-[#78716C] text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#173F3D]" />
              <span>Loading published mock tests...</span>
            </div>
          ) : tests.length === 0 ? (
            <div className="py-16 text-center text-[#78716C] text-xs flex flex-col items-center gap-3">
              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E6DFD3] text-[#78716C]">
                <BookOpen className="w-8 h-8 text-[#173F3D]" />
              </div>
              <p className="font-semibold text-[#1C1917]">No Mock Tests Generated Yet</p>
              <p className="text-[11px] max-w-sm">
                Use the generator panel on the left to configure subjects, difficulty, and publish benchmark tests.
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
              {tests.map((test) => {
                const qList = test.questions || [];
                return (
                  <div
                    key={test.id}
                    className="p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-[#1C1917]">
                          {test.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                          {test.difficulty || 'Hard'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#78716C]">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#173F3D]" />
                          {test.totalQuestions || qList.length} Questions
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#173F3D]" />
                          {test.timeLimitMinutes || 25} Mins
                        </span>
                        <span>•</span>
                        <span>
                          {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onLaunchExam && (
                        <button
                          type="button"
                          onClick={() => {
                            const quizPayload = {
                              id: test.id,
                              quizTitle: test.title,
                              track: 'gate_cs',
                              difficulty: test.difficulty,
                              totalQuestions: test.totalQuestions || qList.length,
                              timeLimitMinutes: test.timeLimitMinutes || 25,
                              questions: qList,
                              generatedAt: Date.now()
                            };
                            onLaunchExam(quizPayload);
                          }}
                          className="px-3 py-1.5 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                          title="Preview taking this CBT test"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Attempt CBT</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(test.id, test.title)}
                        className="p-1.5 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
