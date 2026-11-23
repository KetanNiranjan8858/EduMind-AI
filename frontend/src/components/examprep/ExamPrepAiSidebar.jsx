import React, { useMemo } from 'react';
import {
  Brain,
  Trash2,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  AlertTriangle,
  Award
} from 'lucide-react';
import FormattedChatMessage from '../FormattedChatMessage';

export default function ExamPrepAiSidebar({
  chatMessages = [],
  chatInput = '',
  onChangeChatInput,
  onKeyDownChatInput,
  onSendMessage,
  onClearChat,
  isAiThinking = false,
  chatEndRef,
  style,
  className = '',
  // Subject Analytics Props for Performance Coaching
  subjectAnalytics = [],
  focusSubject = null,
  bestSubject = null,
  accuracy = 0,
  totalAttempted = 0,
  totalCorrect = 0
}) {
  // Build a concise coaching prompt summarizing candidate's actual subject-wise stats
  function handleAskWhatToFocusOn() {
    const attemptedSubjects = (subjectAnalytics || []).filter((s) => s.id !== 'all' && s.attempted > 0);
    const unattemptedSubjects = (subjectAnalytics || []).filter((s) => s.id !== 'all' && s.attempted === 0);

    let summaryText = '';
    if (attemptedSubjects.length > 0) {
      summaryText += 'Here are my current subject-wise attempt statistics:\n' +
        attemptedSubjects
          .map((s) => `- ${s.name}: ${s.accuracy}% accuracy (${s.correct}/${s.attempted} correct, Status: ${s.status})`)
          .join('\n');
    } else {
      summaryText += 'I have just started practicing and have not logged full attempts yet.';
    }

    if (unattemptedSubjects.length > 0) {
      summaryText += '\nUnattempted Subjects:\n' + unattemptedSubjects.map((s) => `- ${s.name}`).join(', ');
    }

    const coachingPrompt = `Please analyze my GATE CS preparation based on my current subject-wise analytics:\n\n${summaryText}\n\nOverall Accuracy: ${accuracy}%\nTotal Questions Attempted: ${totalAttempted}\nWeakest / Needs Focus Subject: ${focusSubject?.name || 'Operating Systems'}\nStrongest Subject: ${bestSubject?.name || 'Algorithms'}\n\nBased on these analytics, please tell me:\n1. What specific subjects and topics do I need to focus on to improve my score?\n2. What are the common tricky pitfalls in my weakest subjects?\n3. What is the optimal revision order I should follow?`;

    onSendMessage(coachingPrompt);
  }

  function handleAskSubjectImprovement(subjectName) {
    const sName = subjectName || focusSubject?.name || 'Operating Systems';
    const prompt = `Based on my GATE analytics, I need to improve my performance in ${sName}. What are the top high-yield topics, essential formulas, and core derivation steps I must master to get full marks in this subject?`;
    onSendMessage(prompt);
  }

  const defaultSuggestedQueries = [
    'Explain Paging vs Segmentation with translation lookaside buffer (TLB)',
    'How does Dijkstra algorithm differ from Bellman-Ford in negative cycles?',
    'Derive time complexity of building a Binary Heap bottom-up'
  ];

  return (
    <aside
      style={style}
      className={`shrink-0 h-full flex flex-col bg-white rounded-2xl border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] overflow-hidden font-sans ${
        style?.width ? '' : 'w-96'
      } ${className}`}
    >
      {/* 1. Header: Dedicated AI GATE Tutor for Doubts & Performance Coaching */}
      <div className="p-4 border-b border-[#E6DFD3] flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
            <Brain className="w-4 h-4 text-[#FAF7F2]" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
              AI GATE Tutor
            </h3>
            <p className="text-[10px] text-[#78716C]">
              Doubt solver & performance coaching
            </p>
          </div>
        </div>

        {chatMessages.length > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-1.5 text-[#78716C] hover:text-rose-500 hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Candidate Subject-Wise Performance & Coaching Banner */}
      <div className="p-3.5 border-b border-[#E6DFD3] bg-[#FAF7F2] shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#1C1917] flex items-center gap-1.5 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-[#173F3D]" />
            Your Analytics Snapshot
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#173F3D] border border-[#E6DFD3]">
            Accuracy: {accuracy}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {/* Weakest / Focus Subject */}
          <div className="p-2 rounded-xl bg-white border border-[#E6DFD3] space-y-0.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Needs Focus</span>
            </div>
            <p className="font-bold text-[#1C1917] truncate text-xs">
              {focusSubject?.name || 'All Subjects'}
            </p>
            <p className="text-[10px] text-[#78716C]">
              {focusSubject ? `${focusSubject.accuracy}% accuracy` : 'Practice more'}
            </p>
          </div>

          {/* Strongest Subject */}
          <div className="p-2 rounded-xl bg-white border border-[#E6DFD3] space-y-0.5">
            <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <Award className="w-2.5 h-2.5" />
              <span>Strongest Area</span>
            </div>
            <p className="font-bold text-[#1C1917] truncate text-xs">
              {bestSubject?.name || 'Algorithms'}
            </p>
            <p className="text-[10px] text-[#78716C]">
              {bestSubject ? `${bestSubject.accuracy}% accuracy` : 'Top mastery'}
            </p>
          </div>
        </div>

        {/* 1-Click Prompt: "Analyze my analytics and tell me what to focus on" */}
        <button
          type="button"
          onClick={handleAskWhatToFocusOn}
          className="w-full py-2 px-3 rounded-xl bg-[#173F3D] hover:bg-[#102B2A] text-white text-[11px] font-bold flex items-center justify-between transition-all shadow-xs cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#FAF7F2]" />
            <span>What should I focus on next?</span>
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FAF7F2]" />
        </button>
      </div>

      {/* 3. Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {chatMessages.length === 0 ? (
          <div className="py-4 space-y-3">
            <div className="text-center">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-[#173F3D] flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#1C1917]">
                AI GATE Tutor Ready
              </h4>
              <p className="text-[10px] text-[#78716C] max-w-[220px] mx-auto mt-1 leading-relaxed">
                Ask doubts, derive multi-step formulas, or get personalized guidance based on your analytics.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block px-1">
                Suggested Doubts & Coaching
              </span>

              {focusSubject && (
                <button
                  type="button"
                  onClick={() => handleAskSubjectImprovement(focusSubject.name)}
                  className="w-full text-left p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] text-[11px] text-[#1C1917] transition-all cursor-pointer leading-snug shadow-2xs font-medium"
                >
                  🎯 How can I improve my score in {focusSubject.name}?
                </button>
              )}

              {defaultSuggestedQueries.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(preset)}
                  className="w-full text-left p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] text-[11px] text-[#1C1917] transition-all cursor-pointer leading-snug shadow-2xs"
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
                  <div className="w-6 h-6 rounded-lg bg-[#FAF7F2] border border-[#E6DFD3] text-[#173F3D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`leading-relaxed ${
                    isUser
                      ? 'bg-[#173F3D] text-white px-3.5 py-2 rounded-2xl max-w-[85%] text-xs shadow-sm font-medium'
                      : 'text-[#1C1917] flex-1 pt-0.5'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <FormattedChatMessage content={msg.text} />
                  )}
                </div>
              </div>
            );
          })
        )}

        {isAiThinking && (
          <div className="flex items-center gap-2 text-[#78716C] text-xs py-1">
            <Loader2 className="w-4 h-4 animate-spin text-[#173F3D]" />
            <span>AI Tutor is analyzing your problem...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 4. AI Input Box */}
      <div className="p-3 border-t border-[#E6DFD3] bg-white shrink-0">
        <div className="relative flex items-center bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl shadow-xs">
          <textarea
            rows={2}
            value={chatInput}
            onChange={(e) => onChangeChatInput(e.target.value)}
            onKeyDown={onKeyDownChatInput}
            placeholder="Ask a doubt, formula derivation, or study advice..."
            className="w-full pl-3 pr-10 py-2 bg-transparent text-[#1C1917] placeholder-[#78716C] text-xs focus:outline-none resize-none"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!chatInput.trim() || isAiThinking}
            className="absolute right-2 p-1.5 bg-[#E8DFCF] hover:bg-[#DCD2C0] text-[#173F3D] disabled:opacity-40 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Send to AI Tutor"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
