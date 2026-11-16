import React from 'react';
import { Sparkles, Trash2, Brain, Loader2, Send } from 'lucide-react';

export default function ExamPrepAiSidebar({
  chatMessages = [],
  chatInput = '',
  onChangeChatInput,
  onKeyDownChatInput,
  onSendMessage,
  onClearChat,
  isAiThinking = false,
  chatEndRef
}) {
  const suggestedQueries = [
    'Explain Paging vs Segmentation with translation lookaside buffer (TLB)',
    'How does Dijkstra algorithm differ from Bellman-Ford in negative cycles?',
    'Derive time complexity of building a Binary Heap bottom-up'
  ];

  return (
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
            onClick={onClearChat}
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
              {suggestedQueries.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(preset)}
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
            onChange={(e) => onChangeChatInput(e.target.value)}
            onKeyDown={onKeyDownChatInput}
            placeholder="Ask about formulas, algorithms, or GATE concepts..."
            className="w-full pl-3 pr-10 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-rose-500/70 resize-none transition-colors"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!chatInput.trim() || isAiThinking}
            className="absolute right-2 p-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            title="Send to AI Tutor"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
