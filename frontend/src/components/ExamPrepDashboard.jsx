import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Target,
  Brain,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Trash2,
  User,
  Award,
  ChevronDown,
  ChevronRight,
  Layers,
  Percent,
  Timer,
  BarChart3,
  TrendingUp,
  HelpCircle,
  Code,
  Cpu,
  Server,
  Network,
  FileCode,
  HardDrive,
  Database,
  Wifi,
  GitBranch,
  Sigma,
  Filter,
  Check,
  XCircle,
  Eye,
  EyeOff,
  Flame,
  Zap,
  BookMarked
} from 'lucide-react';
import { AVAILABLE_EXAMS, GATE_SUBJECTS, GATE_EXAMS } from '../data/curatedExams';
import { sendChatMessage } from '../utils/api';

// Helper to map subject ID to Lucide icon
function getSubjectIcon(id) {
  switch (id) {
    case 'all':
      return Layers;
    case 'math':
      return Sigma;
    case 'dl':
      return Cpu;
    case 'coa':
      return Server;
    case 'ds':
      return Code;
    case 'algo':
      return GitBranch;
    case 'toc':
      return Network;
    case 'cd':
      return FileCode;
    case 'os':
      return HardDrive;
    case 'dbms':
      return Database;
    case 'cn':
      return Wifi;
    default:
      return BookOpen;
  }
}

export default function ExamPrepDashboard({
  currentUser,
  examHistory = [],
  onLaunchExam,
  onReturnToStudio,
  onRequireLogin
}) {
  // Menu Option to select exam track (Currently GATE CS/IT)
  const [selectedExamId, setSelectedExamId] = useState('gate_cs');

  // Left Sidebar: Selected Subject State (Default: 'all')
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');

  // Question inspection & answer reveal state
  const [revealedExplanations, setRevealedExplanations] = useState({});

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  // Selected Exam Track metadata
  const currentExamTrack =
    AVAILABLE_EXAMS.find((e) => e.id === selectedExamId) || AVAILABLE_EXAMS[0];

  // Total questions in the GATE question bank across all subjects
  const totalQuestionsInBank = useMemo(() => {
    return GATE_EXAMS.reduce(
      (acc, e) => acc + (e.questions?.length || e.totalQuestions || 0),
      0
    );
  }, []);

  // Compute Analytics from Candidate's Exam History for GATE CS/IT
  const gateAttempts = useMemo(() => {
    return (examHistory || []).filter(
      (h) =>
        !h.quiz?.track ||
        h.quiz?.track === 'gate_cs' ||
        h.quiz_title?.toLowerCase().includes('gate')
    );
  }, [examHistory]);

  const totalAttempted = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.attempted_count) || 0), 0);
  }, [gateAttempts]);

  const totalCorrect = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.correct_count) || 0), 0);
  }, [gateAttempts]);

  const totalIncorrect = Math.max(0, totalAttempted - totalCorrect);

  const totalQuestionsInRuns = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.total_questions) || 0), 0);
  }, [gateAttempts]);

  const totalTimeTakenSeconds = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.time_taken_seconds) || 0), 0);
  }, [gateAttempts]);

  // Track which subjects candidate has attempted
  const attemptedSubjectIds = useMemo(() => {
    const set = new Set();
    gateAttempts.forEach((h) => {
      if (h.quiz?.subjectId) {
        set.add(h.quiz.subjectId);
      } else {
        GATE_SUBJECTS.forEach((sub) => {
          if (
            sub.id !== 'all' &&
            (h.quiz_title?.toLowerCase().includes(sub.shortName.toLowerCase()) ||
              h.quiz_title?.toLowerCase().includes(sub.name.toLowerCase()))
          ) {
            set.add(sub.id);
          }
        });
      }
    });
    return set;
  }, [gateAttempts]);

  // 1. Questions Attempted Out of Total
  const questionsDenominator =
    totalQuestionsInRuns > 0 ? totalQuestionsInRuns : totalQuestionsInBank;
  const attemptPercentage =
    questionsDenominator > 0
      ? Math.round((totalAttempted / questionsDenominator) * 100)
      : 0;

  // 2. Accuracy (%)
  const accuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // 3. Overall Percentage (%)
  const overallPercentage =
    questionsDenominator > 0
      ? Math.round((totalCorrect / questionsDenominator) * 100)
      : 0;

  // 4. Average Time Taken Per Question (seconds)
  const avgTimePerQuestion =
    totalAttempted > 0 ? Math.round(totalTimeTakenSeconds / totalAttempted) : 0;

  // Filtered Subject Papers based on Left Sidebar selection
  const filteredExams = useMemo(() => {
    if (selectedSubjectId === 'all') {
      return GATE_EXAMS;
    }
    return GATE_EXAMS.filter((e) => e.subjectId === selectedSubjectId);
  }, [selectedSubjectId]);

  const currentSubjectObj = useMemo(() => {
    return GATE_SUBJECTS.find((s) => s.id === selectedSubjectId) || GATE_SUBJECTS[0];
  }, [selectedSubjectId]);

  // Toggle answer / explanation reveal
  function toggleExplanation(qId) {
    setRevealedExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  }

  // Handle AI Chat submission
  async function handleSendChatMessage(customQuery) {
    const text = (customQuery || chatInput).trim();
    if (!text || isAiThinking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setChatInput('');
    setIsAiThinking(true);

    try {
      const res = await sendChatMessage({
        sourceIds: [],
        messages: chatMessages.map((m) => ({ sender: m.sender, text: m.text })),
        userQuery: text,
        workspaceId: 'ws_gate_prep',
        userId: currentUser?.id || null
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || 'Here is the conceptual breakdown for your query.'
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Notice**: ${err.message || 'Could not fetch response. Please try again.'}`
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  }

  function handleChatKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  }

  function handleClearChat() {
    setChatMessages([]);
  }

  // Pre-fill question into AI Assistant
  function handleAskAiQuestion(q, subjectName) {
    const prompt = `Please provide a step-by-step conceptual explanation and solution derivation for this GATE CS question from **${subjectName}**:\n\n**Question:** ${q.question}\n\n**Options:**\nA) ${q.options.A}\nB) ${q.options.B}\nC) ${q.options.C}\nD) ${q.options.D}\n\n**Correct Answer:** Option ${q.correctAnswer}\n\nExplain the underlying concept, formulas, and how to arrive at this answer efficiently in the GATE exam.`;
    handleSendChatMessage(prompt);
  }

  return (
    <div className="h-screen flex flex-col bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <header className="h-14 bg-dark-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToStudio}
            className="px-3 py-1.5 bg-dark-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Return to Study Studio"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-brand-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">
                Exam Preparation Dashboard
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                Official GATE CS/IT Benchmark Question Bank
              </span>
            </div>
          </div>
        </div>

        {/* User Identity / Login */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="px-3 py-1.5 bg-dark-850 border border-slate-700/80 rounded-xl text-xs flex items-center gap-2 text-slate-200">
              <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium max-w-[130px] truncate">{currentUser.name}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRequireLogin}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </header>

      {/* Top Detailed Analytics Panel (Replaces old text and search bar) */}
      <section className="border-b border-slate-800 bg-dark-900/80 shrink-0 p-4">
        <div className="max-w-[1920px] mx-auto space-y-3.5">
          {/* Header Row: Exam Track Selection & Global Status */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-rose-400" />
                Exam Track:
              </span>
              <div className="relative">
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="pl-3.5 pr-8 py-1.5 bg-dark-950 hover:bg-dark-850 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200 focus:outline-none focus:border-rose-400 appearance-none cursor-pointer transition-colors shadow-sm"
                >
                  {AVAILABLE_EXAMS.map((exam) => (
                    <option key={exam.id} value={exam.id} className="bg-dark-900 text-slate-200">
                      {exam.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-rose-300 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium">
                10 Official Subjects • 100 High-Yield Questions
              </span>
            </div>

            {/* Performance Summary Pill */}
            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-1 rounded-xl bg-dark-950 border border-slate-800 flex items-center gap-2 text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">
                  Subjects Practiced:{' '}
                  <strong className="text-white font-mono">{attemptedSubjectIds.size}</strong>/10
                </span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-dark-950 border border-slate-800 flex items-center gap-2 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-[11px]">
                  Mock Tests Completed:{' '}
                  <strong className="text-white font-mono">{gateAttempts.length}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Performance Analysis Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Metric 1: Questions Attempted Out of Total */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-medium">Questions Attempted</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                    {totalAttempted}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-normal">
                    / {questionsDenominator}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 space-y-1">
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, attemptPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Coverage</span>
                  <span>{attemptPercentage}% of bank</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Accuracy with Correct vs Incorrect */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-medium">Accuracy</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    {accuracy}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {accuracy >= 75 ? 'Excellent' : accuracy >= 50 ? 'Proficient' : totalAttempted > 0 ? 'Needs Practice' : 'Untested'}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  ✓ {totalCorrect} Correct
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                  ✗ {totalIncorrect} Incorrect
                </span>
              </div>
            </div>

            {/* Metric 3: Overall Percentage */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-medium">Overall Score</span>
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-cyan-400 font-mono tracking-tight">
                    {overallPercentage}%
                  </span>
                  <span className="text-xs text-slate-500 font-mono">benchmark</span>
                </div>
              </div>

              <div className="mt-2.5 space-y-1">
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Total correct / Total syllabus Qs
                </div>
              </div>
            </div>

            {/* Metric 4: Average Time Taken Per Question */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-medium">Avg Time / Question</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
                    {avgTimePerQuestion}s
                  </span>
                  <span className="text-xs text-slate-500 font-normal">/ Q</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono">
                  {avgTimePerQuestion === 0
                    ? 'No pace data'
                    : avgTimePerQuestion <= 90
                    ? '⚡ Fast Pace'
                    : avgTimePerQuestion <= 150
                    ? '⏱️ Standard Pace'
                    : '🐢 In-Depth Pace'}
                </span>
                <span className="text-slate-500">Target: &lt;180s</span>
              </div>
            </div>

            {/* Metric 5: Total Study & Test Time */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/90 shadow-sm hidden lg:flex flex-col justify-between group hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-medium">Total Test Time</span>
                  <Timer className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-purple-400 font-mono tracking-tight">
                    {Math.round(totalTimeTakenSeconds / 60)}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">minutes</span>
                </div>
              </div>

              <div className="mt-2.5 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Total Active CBT Time</span>
                <span className="font-mono text-slate-400">{gateAttempts.length} tests</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body: Left Sidebar (Subject Selector) + Center (Filtered Subject Questions/Exams) + Right (AI Assistant) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Select Subject (All GATE CS/IT Official Subjects) */}
        <aside className="w-72 shrink-0 border-r border-slate-800 bg-dark-900/60 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-dark-850/70">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Select Subject
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
              {GATE_SUBJECTS.length - 1} Subjects
            </span>
          </div>

          {/* Subject Navigation List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {GATE_SUBJECTS.map((subject) => {
              const isSelected = selectedSubjectId === subject.id;
              const IconComponent = getSubjectIcon(subject.id);
              const isAttempted = attemptedSubjectIds.has(subject.id);
              const examCount =
                subject.id === 'all'
                  ? GATE_EXAMS.length
                  : GATE_EXAMS.filter((e) => e.subjectId === subject.id).length;
              const qCount =
                subject.id === 'all'
                  ? totalQuestionsInBank
                  : GATE_EXAMS.filter((e) => e.subjectId === subject.id).reduce(
                      (s, e) => s + (e.questions?.length || 0),
                      0
                    );

              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-rose-500/15 border border-rose-500/40 text-rose-200 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-dark-950 text-slate-400 group-hover:text-slate-200 group-hover:bg-dark-850 border border-slate-800'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

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
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-rose-400 translate-x-0.5' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Hint */}
          <div className="p-3 border-t border-slate-800/80 bg-dark-950/60 text-[10px] text-slate-500 leading-relaxed">
            💡 Selecting a subject isolates question papers and questions strictly for that module.
          </div>
        </aside>

        {/* Center Main Content: Subject Questions & Mock Exam Cards */}
        <main className="flex-1 flex flex-col min-w-0 bg-dark-950 overflow-y-auto">
          {/* Active Subject Banner */}
          <div className="p-4 border-b border-slate-800 bg-dark-900/40 flex items-center justify-between flex-wrap gap-3 shrink-0">
            <div className="flex items-center gap-3">
              {(() => {
                const ActiveIcon = getSubjectIcon(currentSubjectObj.id);
                return (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/10">
                    <ActiveIcon className="w-4 h-4" />
                  </div>
                );
              })()}
              <div>
                <h2 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                  <span>{currentSubjectObj.name}</span>
                  {selectedSubjectId !== 'all' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      GATE CS Official Module
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedSubjectId === 'all'
                    ? 'Showing all 10 GATE CS benchmark papers. Select any subject from the left sidebar to isolate questions.'
                    : `Showing high-yield GATE questions and official benchmark exam for ${currentSubjectObj.name}.`}
                </p>
              </div>
            </div>

            {selectedSubjectId !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedSubjectId('all')}
                className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-dark-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                ← View All Subjects
              </button>
            )}
          </div>

          {/* Content Area: Subject Question Papers & Individual Questions Browser */}
          <div className="p-5 space-y-6">
            {/* If All Subjects is selected: Display Grid of All 10 Subject Papers */}
            {selectedSubjectId === 'all' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-rose-400" />
                    All 10 GATE CS/IT Subject Benchmark Papers
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    Total {GATE_EXAMS.length} Papers • {totalQuestionsInBank} Questions
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-5 rounded-2xl bg-dark-900 border border-slate-800/90 hover:border-rose-500/40 hover:bg-dark-850/80 transition-all shadow-sm flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-2.5">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            {exam.subject}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              exam.difficulty === 'Hard'
                                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                : 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                            }`}
                          >
                            {exam.difficulty}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="font-bold text-sm text-slate-100 group-hover:text-rose-200 transition-colors">
                            {exam.quizTitle}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {exam.description}
                          </p>
                        </div>

                        {/* Topics Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {exam.topics.slice(0, 4).map((topic, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 text-slate-300 border border-slate-800"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Metadata & Action Buttons */}
                      <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            {exam.totalQuestions} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {exam.timeLimitMinutes} Mins
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSubjectId(exam.subjectId)}
                            className="px-3 py-1.5 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                          >
                            View Questions
                          </button>
                          <button
                            type="button"
                            onClick={() => onLaunchExam(exam)}
                            className="px-4 py-1.5 bg-gradient-to-r from-rose-600 via-indigo-600 to-brand-600 hover:from-rose-500 hover:via-indigo-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                            title="Attempt Exam in CBT Engine"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Attempt Exam</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* When a specific subject is selected: Show Subject Exam Header + Questions of Selected Subject */
              <div className="space-y-6">
                {filteredExams.map((exam) => (
                  <div key={exam.id} className="space-y-6">
                    {/* Subject Test Paper Launch Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 border border-rose-500/30 shadow-lg shadow-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            {exam.subject}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            GATE Level: {exam.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {exam.timeLimitMinutes} Minutes Timed Test
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-500" />
                            {exam.questions.length} Benchmark Questions
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-white">
                          {exam.quizTitle}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                          {exam.description}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold mr-1">
                            Topics:
                          </span>
                          {exam.topics.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-950 text-slate-300 border border-slate-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Primary CTA: Launch Full CBT Exam */}
                      <button
                        type="button"
                        onClick={() => onLaunchExam(exam)}
                        className="px-6 py-3 bg-gradient-to-r from-rose-600 via-indigo-600 to-brand-600 hover:from-rose-500 hover:via-indigo-500 hover:to-brand-500 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all cursor-pointer shrink-0"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Attempt {exam.subject} Exam</span>
                      </button>
                    </div>

                    {/* Questions Browser for the Selected Subject */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-brand-400" />
                          Questions for {exam.subject} ({exam.questions.length} Questions)
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Inspect questions, reveal answers, or ask AI for derivations
                        </span>
                      </div>

                      {/* List of Questions strictly for the selected subject */}
                      <div className="space-y-4">
                        {exam.questions.map((q, idx) => {
                          const isRevealed = Boolean(revealedExplanations[q.id]);
                          return (
                            <div
                              key={q.id || idx}
                              className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-sm space-y-3.5 transition-all hover:border-slate-700/80"
                            >
                              {/* Question Header & Prompt */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                                    {q.question}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleAskAiQuestion(q, exam.subject)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                                  title="Ask AI to explain this question"
                                >
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                  <span>Ask AI</span>
                                </button>
                              </div>

                              {/* Multiple Choice Options */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-9">
                                {Object.entries(q.options || {}).map(([key, value]) => {
                                  const isCorrect = isRevealed && key === q.correctAnswer;
                                  return (
                                    <div
                                      key={key}
                                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${
                                        isCorrect
                                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold shadow-sm'
                                          : 'bg-dark-950/70 border-slate-800/80 text-slate-300'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          isCorrect
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-800 text-slate-400'
                                        }`}
                                      >
                                        {key}
                                      </span>
                                      <span className="leading-snug">{value}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Toggle Explanation & Solution */}
                              <div className="pl-9 pt-1 flex items-center justify-between flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleExplanation(q.id)}
                                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  {isRevealed ? (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5" />
                                      <span>Hide Solution & Explanation</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Show Solution & Explanation</span>
                                    </>
                                  )}
                                </button>

                                {isRevealed && (
                                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                                    Correct Option: {q.correctAnswer}
                                  </span>
                                )}
                              </div>

                              {/* Expanded Detailed GATE Explanation */}
                              {isRevealed && (
                                <div className="ml-9 p-3.5 rounded-xl bg-dark-950 border border-slate-800/90 text-xs text-slate-300 space-y-1.5 animation-fadeIn">
                                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Detailed GATE Solution:</span>
                                  </div>
                                  <p className="leading-relaxed text-slate-300">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Column: AI Assistant for Doubt Clearing & Concept Derivations */}
        <aside className="w-96 shrink-0 h-full flex flex-col bg-dark-900 border-l border-slate-800">
          {/* AI Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-tr from-purple-500 to-rose-600 rounded-lg text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  AI GATE Tutor
                </h3>
                <p className="text-[10px] text-slate-400">
                  Concept derivations, formulas & doubt solving
                </p>
              </div>
            </div>

            {chatMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-dark-950/40">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                  <Brain className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-200 font-bold">GATE CS/IT AI Assistant</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                    Ask any question, formula derivation, or doubt regarding GATE CS/IT subjects.
                  </p>
                </div>

                <div className="w-full pt-3 space-y-1.5 text-left">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Suggested Queries:
                  </span>
                  {[
                    'Explain Paging vs Segmentation with translation lookaside buffer (TLB)',
                    'How does Dijkstra algorithm differ from Bellman-Ford in negative cycles?',
                    'Derive time complexity of building a Binary Heap bottom-up'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendChatMessage(preset)}
                      className="w-full text-left p-2 rounded-xl bg-dark-900 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer leading-snug"
                    >
                      💡 {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        isUser
                          ? 'bg-rose-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-dark-900 border border-slate-800 text-slate-200 rounded-tl-none prose prose-invert prose-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                );
              })
            )}

            {isAiThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                <span>AI is analyzing problem...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* AI Input Box */}
          <div className="p-3 border-t border-slate-800 bg-dark-900">
            <div className="relative flex items-center">
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask about formulas, algorithms, or GATE concepts..."
                className="w-full pl-3 pr-10 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-rose-500/70 resize-none transition-colors"
              />
              <button
                type="button"
                onClick={() => handleSendChatMessage()}
                disabled={!chatInput.trim() || isAiThinking}
                className="absolute right-2 p-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
                title="Send to AI Tutor"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
