import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  Percent,
  Timer
} from 'lucide-react';
import { AVAILABLE_EXAMS, GATE_EXAMS } from '../data/curatedExams';
import { sendChatMessage } from '../utils/api';

export default function ExamPrepDashboard({
  currentUser,
  examHistory = [],
  onLaunchExam,
  onReturnToStudio,
  onRequireLogin
}) {
  // Menu Option to select exam track (Currently GATE CS/IT only)
  const [selectedExamId, setSelectedExamId] = useState('gate_cs');

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

  // Total questions in the GATE question bank
  const totalQuestionsInBank = GATE_EXAMS.reduce(
    (acc, e) => acc + (e.questions?.length || e.totalQuestions || 0),
    0
  );

  // Compute Analytics from Candidate's Exam History for GATE CS/IT
  const gateAttempts = (examHistory || []).filter(
    (h) =>
      !h.quiz?.track ||
      h.quiz?.track === 'gate_cs' ||
      h.quiz_title?.toLowerCase().includes('gate')
  );

  const totalAttempted = gateAttempts.reduce(
    (sum, h) => sum + (Number(h.attempted_count) || 0),
    0
  );
  const totalCorrect = gateAttempts.reduce(
    (sum, h) => sum + (Number(h.correct_count) || 0),
    0
  );
  const totalQuestionsInRuns = gateAttempts.reduce(
    (sum, h) => sum + (Number(h.total_questions) || 0),
    0
  );
  const totalTimeTakenSeconds = gateAttempts.reduce(
    (sum, h) => sum + (Number(h.time_taken_seconds) || 0),
    0
  );

  // 1. Questions Attempted Out of Total
  const questionsDenominator =
    totalQuestionsInRuns > 0 ? totalQuestionsInRuns : totalQuestionsInBank;

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
    setChatInput('');
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

  return (
    <div className="h-screen flex flex-col bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
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
                Exam Preparation
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
              <span className="font-medium max-w-[120px] truncate">{currentUser.name}</span>
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

      {/* Main Split Layout: Left = Exam Selection, Analytics & Test Papers | Right = AI Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Exam Selection & Analytics */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-dark-950 overflow-hidden">
          {/* Top Controls: Exam Selection Menu & Analytics Bar */}
          <div className="p-4 border-b border-slate-800 bg-dark-900/70 space-y-4 shrink-0">
            {/* Exam Select Menu Option */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-rose-400" />
                  Select Exam Track:
                </span>
                <div className="relative">
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="pl-3.5 pr-8 py-1.5 bg-dark-950 hover:bg-dark-850 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-200 focus:outline-none focus:border-rose-400 appearance-none cursor-pointer transition-colors shadow-sm"
                  >
                    {AVAILABLE_EXAMS.map((exam) => (
                      <option key={exam.id} value={exam.id} className="bg-dark-900 text-slate-200">
                        {exam.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-rose-300 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                <strong className="text-white">{GATE_EXAMS.length}</strong> subject papers available
              </span>
            </div>

            {/* Exam Analytics Bar (Replaces Search Bar) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Metric 1: Questions Attempted Out of Total */}
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Questions Attempted</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <div className="text-base font-extrabold text-white font-mono">
                  {totalAttempted} <span className="text-xs text-slate-500 font-normal">/ {questionsDenominator}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {gateAttempts.length} test attempt{gateAttempts.length === 1 ? '' : 's'} recorded
                </div>
              </div>

              {/* Metric 2: Accuracy */}
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Accuracy</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  {accuracy}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {totalCorrect} correct answers
                </div>
              </div>

              {/* Metric 3: Overall Percentage */}
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Overall Percentage</span>
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-base font-extrabold text-cyan-400 font-mono">
                  {overallPercentage}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Calculated against total questions
                </div>
              </div>

              {/* Metric 4: Average Time Taken Per Question */}
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Avg Time / Question</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-base font-extrabold text-amber-400 font-mono">
                  {avgTimePerQuestion}s
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Pace per question
                </div>
              </div>
            </div>
          </div>

          {/* Exam Cards Grid (GATE CS/IT Papers Only) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {GATE_EXAMS.map((exam) => (
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
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold border ${
                            exam.difficulty === 'Hard'
                              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                              : 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                          }`}
                        >
                          {exam.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-200 transition-colors">
                        {exam.quizTitle}
                      </h3>
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

                  {/* Bottom Metadata & Start Button */}
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

                    {/* Primary CTA: Launch and Attempt Exam */}
                    <button
                      type="button"
                      onClick={() => onLaunchExam(exam)}
                      className="px-4 py-2 bg-gradient-to-r from-rose-600 via-indigo-600 to-brand-600 hover:from-rose-500 hover:via-indigo-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                      title="Open in CBT Exam Screen"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Attempt Exam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: AI Assistant for Understanding Concepts */}
        <aside className="w-96 shrink-0 h-full flex flex-col bg-dark-900 border-l border-slate-800">
          {/* AI Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-tr from-purple-500 to-rose-600 rounded-lg text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  AI Assistant
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ask any concept, formula or doubt
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
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <Brain className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-xs text-slate-200 font-semibold">GATE CS/IT AI Assistant</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                  Ask any question, formula derivation, or doubt regarding GATE CS/IT subjects.
                </p>
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
                          ? 'bg-rose-600 text-white rounded-tr-none'
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
                <span>AI is analyzing...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-dark-900">
            <div className="relative flex items-center">
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask anything about GATE CS/IT..."
                className="w-full pl-3 pr-10 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-rose-500/70 resize-none transition-colors"
              />
              <button
                type="button"
                onClick={() => handleSendChatMessage()}
                disabled={!chatInput.trim() || isAiThinking}
                className="absolute right-2 p-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
                title="Send"
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
