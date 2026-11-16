import React, { useState, useRef, useEffect } from 'react';
import {
  Target,
  Brain,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Search,
  Play,
  Clock,
  AlertCircle,
  Send,
  Loader2,
  Trash2,
  User
} from 'lucide-react';
import { CURATED_EXAMS, PREP_TRACK_FILTERS } from '../data/curatedExams';
import { sendChatMessage } from '../utils/api';

export default function ExamPrepDashboard({
  currentUser,
  onLaunchExam,
  onReturnToStudio,
  onRequireLogin
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Assistant Chat State (Starts clean, no demo/default messages)
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  // Filter exams based on track and search query
  const filteredExams = CURATED_EXAMS.filter((exam) => {
    const matchesTrack = activeFilter === 'all' || exam.track === activeFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      exam.quizTitle.toLowerCase().includes(query) ||
      exam.description.toLowerCase().includes(query) ||
      exam.topics.some((t) => t.toLowerCase().includes(query));
    return matchesTrack && matchesSearch;
  });

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
        workspaceId: 'ws_exam_prep',
        userId: currentUser?.id || null
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || 'Here is the explanation for your query.'
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
      {/* Top Navigation Bar */}
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

        {/* User Identity & Info */}
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

      {/* Main Split Body: Left = Exam Question Bank, Right = AI Assistant */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Exam Question Bank */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-dark-950 overflow-hidden">
          {/* Controls Bar: Track Filters + Search */}
          <div className="p-4 border-b border-slate-800 bg-dark-900/60 flex flex-col gap-3">
            {/* Track Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {PREP_TRACK_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                        : 'bg-dark-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-dark-850'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Stats */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exams by topic, keyword, or title..."
                  className="w-full pl-9 pr-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/60 transition-colors"
                />
              </div>

              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                <span className="text-white font-bold">{filteredExams.length}</span> exams available
              </div>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {filteredExams.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No exams found matching your search.</p>
              </div>
            ) : (
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
                          {exam.trackLabel}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold border ${
                              exam.difficulty === 'Hard'
                                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                : exam.difficulty === 'Medium'
                                ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
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
            )}
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
                  Ask any concept or doubt
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
                <p className="text-xs text-slate-200 font-semibold">Exam AI Assistant</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                  Ask questions, concept derivations, or doubts regarding any exam topics.
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
                placeholder="Type your question or doubt..."
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
