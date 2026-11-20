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
  BookOpen,
  Loader2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { sendChatMessage, fetchChatHistory, clearChatHistory } from '../utils/api';
import FormattedChatMessage from './FormattedChatMessage';

export default function ChatHub({
  selectedSources = [],
  allSources = [],
  workspaceId = 'ws_default',
  workspaceName = 'Workspace',
  userId = null,
  onUpdateWorkspaceName,
  contentWidth = 700,
  isResizing = false
}) {
  const isCompact = contentWidth < 640;
  const isSpacious = contentWidth >= 960;
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(workspaceName);

  useEffect(() => {
    setEditedName(workspaceName);
  }, [workspaceName]);

  async function handleSaveWorkspaceName() {
    if (!editedName.trim() || editedName.trim() === workspaceName) {
      setIsEditingName(false);
      return;
    }
    if (onUpdateWorkspaceName) {
      await onUpdateWorkspaceName(workspaceId, editedName.trim());
    }
    setIsEditingName(false);
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveWorkspaceName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(workspaceName);
    }
  }

  const defaultWelcome = {
    id: 'welcome',
    sender: 'ai',
    text: `### Welcome to ${workspaceName} 🎓

This central workspace allows you to converse with Google Gemini 2.5 Flash grounded strictly in your study materials.

- **Select sources** from the left panel to constrain AI answers.
- Ask for formula derivations, concept summaries, or practice explanations.
- Choose a difficulty and click **Generate Assessment** to create exams.`
  };

  const [messages, setMessages] = useState([defaultWelcome]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history when workspace or user changes
  useEffect(() => {
    async function loadHistory() {
      try {
        setLoadingHistory(true);
        const res = await fetchChatHistory(workspaceId, userId);
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        } else {
          setMessages([defaultWelcome]);
        }
      } catch (err) {
        setMessages([defaultWelcome]);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [workspaceId, userId]);

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
        userQuery: text,
        workspaceId,
        userId
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

  async function handleClearHistory() {
    if (!window.confirm('Clear all conversation history in this workspace?')) return;
    try {
      await clearChatHistory(workspaceId, userId);
      setMessages([
        {
          id: `cleared-${Date.now()}`,
          sender: 'ai',
          text: `Workspace conversation cleared for **${workspaceName}**. How can I help you study next?`
        }
      ]);
    } catch (err) {
      alert('Could not clear chat history: ' + err.message);
    }
  }

  const promptSuggestions = [
    'Summarize key principles from the selected notes',
    'List all critical formulas and their definitions',
    'What are the common tricky exam questions on this?',
    'Explain the core mechanism step-by-step'
  ];

  return (
    <div className={`h-full flex flex-col bg-white overflow-hidden ${isResizing ? 'transition-none select-none' : ''}`}>
      {/* Top Header */}
      <div className={`border-b border-[#E6DFD3] bg-white flex items-center justify-between ${
        isCompact ? 'px-3 py-2.5' : 'px-5 py-3'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3] flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {!isCompact && (
                <h2 className="text-sm font-bold text-[#1C1917] whitespace-nowrap">
                  Central Study Workspace
                </h2>
              )}
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    className="px-2 py-0.5 text-xs bg-[#FAF7F2] text-[#1C1917] rounded-md border border-[#173F3D] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveWorkspaceName}
                    className="p-1 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded text-xs"
                    title="Save name"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(workspaceName);
                    }}
                    className="p-1 bg-white hover:bg-[#FAF7F2] text-[#78716C] rounded text-xs"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="group px-2.5 py-0.5 text-[11px] font-semibold bg-[#E8DFCF] hover:bg-[#DCD2C0] text-[#173F3D] rounded-md border border-[#DCD2C0] flex items-center gap-1.5 transition-colors cursor-pointer max-w-[160px] sm:max-w-xs truncate"
                  title="Click to edit workspace name"
                >
                  <span className="truncate">{workspaceName}</span>
                  <Edit2 className="w-2.5 h-2.5 text-[#173F3D]/70 group-hover:text-[#173F3D] transition-colors shrink-0" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Live Drag & Layout HUD Indicator */}
          {isResizing ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#173F3D]/10 border border-[#173F3D]/30 text-[10px] font-mono text-[#173F3D] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#173F3D] animate-pulse" />
              <span>{Math.round(contentWidth)}px • {isCompact ? 'Compact' : isSpacious ? 'Spacious' : 'Standard'}</span>
            </div>
          ) : selectedSources.length > 0 ? (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3]">
              {selectedSources.length} source{selectedSources.length > 1 ? 's' : ''} grounded
            </span>
          ) : null}

          <button
            onClick={handleClearHistory}
            className="p-1.5 text-[#78716C] hover:text-rose-500 hover:bg-[#FAF7F2] rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed — Clean White Reading Area */}
      <div className={`flex-1 overflow-y-auto bg-white ${
        isCompact ? 'p-3.5 space-y-3.5' : isSpacious ? 'p-8 space-y-6' : 'p-6 space-y-5'
      }`}>
        {loadingHistory ? (
          <div className="flex items-center justify-center h-48 text-[#78716C] text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#173F3D]" />
            <span>Loading workspace chat...</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 w-full mx-auto transition-all ${
                isCompact ? 'max-w-full' : isSpacious ? 'max-w-5xl' : 'max-w-3xl'
              } ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`rounded-lg flex items-center justify-center shrink-0 font-semibold mt-0.5 ${
                  isCompact ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'
                } ${
                  msg.sender === 'user'
                    ? 'bg-[#173F3D] text-white'
                    : 'bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? `bg-[#173F3D] text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-sm ${
                        isCompact ? 'max-w-[85%]' : isSpacious ? 'max-w-2xl' : 'max-w-xl'
                      }`
                    : 'text-[#1C1917] flex-1 pt-0.5 min-w-0'
                }`}
              >
                {msg.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <FormattedChatMessage content={msg.text} />
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className={`flex gap-3.5 w-full mx-auto ${
            isCompact ? 'max-w-full' : isSpacious ? 'max-w-5xl' : 'max-w-3xl'
          }`}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3] mt-0.5">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="py-1 text-xs text-[#78716C] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#173F3D] animate-pulse" />
              <span>Analyzing selected materials and generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts matching screenshot */}
      <div className="px-5 py-2.5 border-t border-[#E6DFD3] bg-[#FAF7F2]/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-[#78716C] shrink-0 font-semibold">Quick Prompts:</span>
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[#1C1917] hover:text-[#173F3D] bg-[#E8DFCF] hover:bg-[#DCD2C0] border border-[#DCD2C0] rounded-full shrink-0 transition-colors cursor-pointer text-[11px] px-3.5 py-1 font-medium shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area (Clean Floating Bar on White) */}
      <div className={`bg-white border-t border-[#E6DFD3] ${isCompact ? 'p-2.5' : 'p-3.5'}`}>
        <div className={`relative flex items-center mx-auto w-full transition-all bg-[#FAF7F2] border border-[#E6DFD3] rounded-2xl shadow-xs ${
          isCompact ? 'max-w-full' : isSpacious ? 'max-w-5xl' : 'max-w-4xl'
        }`}>
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedSources.length > 0
                ? `Ask anything about ${selectedSources.length} source(s) in ${workspaceName}...`
                : `Ask a question or select files from the left panel...`
            }
            rows={1}
            className="w-full pl-4 pr-12 py-3 bg-transparent text-[#1C1917] placeholder-[#78716C] focus:outline-none text-xs sm:text-sm font-sans resize-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="absolute right-2.5 p-2 bg-[#173F3D] hover:bg-[#102B2A] text-white disabled:opacity-40 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
