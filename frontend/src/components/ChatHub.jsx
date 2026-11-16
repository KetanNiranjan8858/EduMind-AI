import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  FileText,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { sendChatMessage } from '../utils/api';

export default function ChatHub({ selectedSources = [], allSources = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Welcome to EduMind AI Workspace 🎓

This central workspace allows you to converse with Google Gemini 2.5 Flash grounded strictly in your study materials.

- **Select sources** from the left panel to constrain AI answers.
- Ask for formula derivations, concept summaries, or practice explanations.
- Set difficulty and click **Generate Assessment** on the right panel to launch a GATE/TCS NQT style CBT exam.`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(queryToSend) {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const sourceIds = selectedSources.map((s) => s.id);
      const res = await sendChatMessage({
        sourceIds,
        messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
        userQuery: text
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply || 'No response generated.'
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Error communicating with AI**: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearHistory() {
    setMessages([
      {
        id: 'cleared',
        sender: 'ai',
        text: 'Workspace cleared. How can I help you study next?'
      }
    ]);
  }

  const promptSuggestions = [
    'Summarize key principles from the selected notes',
    'List all critical formulas and their definitions',
    'What are the typical GATE-level tricky questions on this?',
    'Explain the core mechanism step-by-step'
  ];

  return (
    <div className="h-full flex flex-col bg-dark-950">
      {/* Top Header */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-dark-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">
                Central Study Workspace
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedSources.length > 0 ? (
                <span>
                  Grounded in{' '}
                  <strong className="text-brand-400">
                    {selectedSources.length} selected source(s)
                  </strong>
                  : {selectedSources.map((s) => s.original_name).join(', ')}
                </span>
              ) : (
                <span className="text-amber-400/90 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 inline" />
                  No sources selected. Check boxes in the left panel to ground answers.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
          title="Clear Chat History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-850 text-brand-400 border border-slate-700/80'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-dark-900 border border-slate-800/90 text-slate-200 rounded-tl-none prose-invert font-sans'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 max-w-3xl">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-dark-850 text-brand-400 border border-slate-700">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 bg-dark-900 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
              <span>Analyzing selected materials and generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-2 border-t border-slate-800/60 bg-dark-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-500 shrink-0 font-medium">Quick Prompts:</span>
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] text-slate-400 hover:text-white bg-dark-850 hover:bg-slate-800 px-3 py-1 rounded-full border border-slate-800 shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-dark-900">
        <div className="relative flex items-center">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedSources.length > 0
                ? `Ask anything about ${selectedSources.length} selected source(s)... (Shift + Enter for newline)`
                : 'Ask a question or select files from the left panel...'
            }
            rows={2}
            className="w-full pl-4 pr-12 py-3 bg-dark-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs sm:text-sm font-sans transition-colors resize-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="absolute right-3 p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow-md shadow-brand-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
