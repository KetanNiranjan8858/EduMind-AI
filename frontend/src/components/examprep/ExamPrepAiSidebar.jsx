import React from 'react';
import { Sparkles, Trash2, Brain, Loader2, Send } from 'lucide-react';
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
  className = ''
}) {
  const suggestedQueries = [
    'Explain Paging vs Segmentation with translation lookaside buffer (TLB)',
    'How does Dijkstra algorithm differ from Bellman-Ford in negative cycles?',
    'Derive time complexity of building a Binary Heap bottom-up'
  ];

  return (
    <aside
      style={style}
      className={`shrink-0 h-full flex flex-col bg-white rounded-2xl border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] overflow-hidden ${
        style?.width ? '' : 'w-96'
      } ${className}`}
    >
      {/* AI Header */}
      <div className="p-4 border-b border-[#E6DFD3] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              AI GATE Tutor
            </h3>
            <p className="text-[10px] text-[#78716C]">
              Concept derivations, formulas & doubt solving
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

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {chatMessages.length === 0 ? (
          <div className="py-6 space-y-3">
            <div className="text-center">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] text-[#173F3D] flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#1C1917]">
                GATE AI Tutor
              </h4>
              <p className="text-[10px] text-[#78716C] max-w-[220px] mx-auto mt-1">
                Ask about any algorithms, proof derivations, or GATE question analysis.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block px-1">
                Suggested Prompts
              </span>
              {suggestedQueries.map((preset, idx) => (
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
                      ? 'bg-[#173F3D] text-white px-3.5 py-2 rounded-2xl max-w-[85%] text-xs shadow-sm'
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
            <span>AI is analyzing problem...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* AI Input Box */}
      <div className="p-3 border-t border-[#E6DFD3] bg-white">
        <div className="relative flex items-center bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl shadow-xs">
          <textarea
            rows={2}
            value={chatInput}
            onChange={(e) => onChangeChatInput(e.target.value)}
            onKeyDown={onKeyDownChatInput}
            placeholder="Ask about formulas, algorithms, or GATE concepts..."
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
