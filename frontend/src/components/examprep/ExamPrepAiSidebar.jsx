import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  Brain,
  Loader2,
  Send,
  Layers,
  Clock,
  Play,
  Flame,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import FormattedChatMessage from '../FormattedChatMessage';
import { generateExamPrepTest } from '../../utils/api';

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
  // Generator props
  activeTab = 'generator',
  onTabChange,
  selectedSubjectIds = ['all'],
  isAllSelected = true,
  dbSubjects = [],
  dbQuestions = [],
  publishedTests = [],
  onLaunchExam,
  onRequireLogin,
  currentUser = null
}) {
  const [internalTab, setInternalTab] = useState(activeTab);
  const currentTab = onTabChange ? activeTab : internalTab;
  const setTab = onTabChange || setInternalTab;

  // Generator configuration: Default difficulty is HARD as requested
  const [difficulty, setDifficulty] = useState('Hard');
  const [questionCount, setQuestionCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const difficultyLevels = [
    { id: 'Hard', label: 'Hard', badge: 'GATE Benchmark' },
    { id: 'Medium', label: 'Medium', badge: 'Standard' },
    { id: 'Easy', label: 'Easy', badge: 'Foundational' }
  ];

  const questionCountOptions = [5, 10, 15, 25];

  // Calculated CBT time: ~2.5 mins per question
  const timeLimitMinutes = Math.max(15, Math.round(questionCount * 2.5));

  // Determine active subject name for context display
  const activeSubjectName = React.useMemo(() => {
    if (isAllSelected) return 'Full GATE CS/IT Syllabus';
    const names = dbSubjects
      .filter((s) => selectedSubjectIds.includes(s.id))
      .map((s) => s.name);
    if (names.length === 1) return names[0];
    if (names.length > 1) return `${names.length} Selected Subjects`;
    return 'GATE CS/IT Question Bank';
  }, [isAllSelected, selectedSubjectIds, dbSubjects]);

  // Questions available in Admin DB matching current scope
  const availableQuestionsCount = React.useMemo(() => {
    if (isAllSelected) return dbQuestions.length;
    return dbQuestions.filter((q) => selectedSubjectIds.includes(q.subjectId || q.subject_id)).length;
  }, [isAllSelected, selectedSubjectIds, dbQuestions]);

  async function handleGenerateCBT() {
    if (!currentUser && onRequireLogin) {
      onRequireLogin();
      return;
    }
    if (generating) return;

    setGenerating(true);
    try {
      const res = await generateExamPrepTest({
        examId: 'gate_cs',
        subjectIds: isAllSelected ? ['all'] : selectedSubjectIds,
        difficulty,
        questionCount,
        timeLimitMinutes
      });

      if (res.quiz) {
        onLaunchExam(res.quiz);
        return;
      }
    } catch (err) {
      console.warn('API generation failed, picking from loaded database questions:', err.message);
    } finally {
      setGenerating(false);
    }

    // Direct fallback from loaded dbQuestions
    let pool = dbQuestions.filter((q) => {
      if (!isAllSelected && selectedSubjectIds.length > 0 && !selectedSubjectIds.includes('all')) {
        if (!selectedSubjectIds.includes(q.subjectId || q.subject_id)) return false;
      }
      if (difficulty !== 'all') {
        if ((q.difficulty || '').toLowerCase() !== difficulty.toLowerCase()) return false;
      }
      return true;
    });

    if (pool.length === 0) {
      pool = dbQuestions.filter((q) =>
        isAllSelected || selectedSubjectIds.includes(q.subjectId || q.subject_id)
      );
    }
    if (pool.length === 0) pool = dbQuestions;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, questionCount).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    const quiz = {
      id: `quiz_examprep_${Date.now()}`,
      track: 'gate_cs',
      subject: activeSubjectName,
      quizTitle: `GATE CS/IT: ${activeSubjectName} (${picked.length} Qs)`,
      difficulty,
      totalQuestions: picked.length,
      timeLimitMinutes,
      description: `Official benchmark CBT test generated from Admin Database questions.`,
      topics: Array.from(new Set(picked.map((q) => q.topic))).filter(Boolean),
      questions: picked,
      generatedAt: Date.now()
    };

    onLaunchExam(quiz);
  }

  function handleAskHardQuestion() {
    const prompt = `Generate 1 challenging, novel, Hard-difficulty GATE CS benchmark question on ${activeSubjectName} with 4 options (A, B, C, D). Provide the question, options, the correct answer, and a rigorous step-by-step derivation.`;
    onSendMessage(prompt);
    setTab('chat');
  }

  const suggestedQueries = [
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
      {/* 1. Dual Mode Header Tabs */}
      <div className="p-3 border-b border-[#E6DFD3] bg-[#FAF7F2] shrink-0">
        <div className="flex bg-white p-1 rounded-xl border border-[#E6DFD3] shadow-2xs">
          <button
            type="button"
            onClick={() => setTab('generator')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'generator'
                ? 'bg-[#173F3D] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CBT Generator</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('chat')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentTab === 'chat'
                ? 'bg-[#173F3D] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI GATE Tutor</span>
            {chatMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB 1: CBT QUESTION GENERATOR */}
      {currentTab === 'generator' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">
          {/* Header Description */}
          <div>
            <h3 className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#173F3D]" />
              AI CBT Studio
            </h3>
            <p className="text-[11px] text-[#78716C] mt-0.5">
              Picks benchmark questions from Admin Database to generate timed mock tests.
            </p>
          </div>

          {/* Subject Scope Context */}
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1C1917] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#173F3D]" />
                Syllabus Scope
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
                {availableQuestionsCount} Qs in DB
              </span>
            </div>
            <p className="text-xs font-semibold text-[#173F3D] truncate">
              {activeSubjectName}
            </p>
          </div>

          {/* Difficulty Selector (Crucial: "ask for question hard") */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#173F3D]" />
                Question Difficulty
              </label>
              <span className="text-[10px] font-mono text-[#78716C]">
                Target: <strong className="text-[#173F3D]">{difficulty}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {difficultyLevels.map((level) => {
                const isSelected = difficulty === level.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setDifficulty(level.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#173F3D] text-white border-[#173F3D] shadow-xs'
                        : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917] hover:bg-[#F2EAE0]'
                    }`}
                  >
                    <div className="text-xs font-bold">{level.label}</div>
                    <div
                      className={`text-[9px] mt-0.5 font-medium truncate ${
                        isSelected ? 'text-[#FAF7F2]' : 'text-[#78716C]'
                      }`}
                    >
                      {level.badge}
                    </div>
                  </button>
                );
              })}
            </div>

            {difficulty === 'Hard' && (
              <div className="p-2.5 rounded-xl bg-[#E5ECEB] border border-[#C9DCDA] text-[11px] text-[#173F3D] leading-snug">
                ⚡ <strong>Hard Benchmark</strong>: Targets multi-step proofs, recurrence limits, and analytical calculations matching the official GATE CS standard.
              </div>
            )}
          </div>

          {/* Number of Questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1C1917]">Number of Questions</span>
              <span className="font-bold text-[#173F3D]">{questionCount} Qs</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {questionCountOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    questionCount === count
                      ? 'bg-[#173F3D] text-white border-[#173F3D] shadow-xs'
                      : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#1C1917] hover:bg-[#F2EAE0]'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
              <Clock className="w-3.5 h-3.5 text-[#173F3D]" />
              <span>Time Limit: <strong>{timeLimitMinutes} Minutes</strong> (2.5 min/Q CBT pacing)</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleGenerateCBT}
            disabled={generating}
            className="w-full py-3 bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Picking from Admin Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
                <span>Generate CBT Assessment</span>
              </>
            )}
          </button>

          {/* Secondary Quick Action: Ask AI for a Hard Question */}
          <div className="pt-2 border-t border-[#E6DFD3]">
            <button
              type="button"
              onClick={handleAskHardQuestion}
              className="w-full py-2 px-3 bg-[#FAF7F2] hover:bg-[#F2EAE0] border border-[#E6DFD3] text-[#173F3D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-[#173F3D]" />
              <span>Ask AI for a Hard Question</span>
            </button>
          </div>

          {/* Published Benchmark Tests from Admin DB */}
          {publishedTests && publishedTests.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-[#E6DFD3]">
              <div className="flex items-center justify-between text-xs font-bold text-[#1C1917]">
                <span>Published Mock Tests</span>
                <span className="text-[10px] text-[#78716C] font-normal">
                  {publishedTests.length} Available
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {publishedTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1C1917] truncate">
                        {test.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[#78716C] mt-0.5">
                        <span className="font-bold text-[#173F3D]">{test.difficulty || 'Hard'}</span>
                        <span>•</span>
                        <span>{test.total_questions || test.totalQuestions} Qs</span>
                        <span>•</span>
                        <span>{test.time_limit_minutes || test.timeLimitMinutes} min</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        let parsedQuestions = [];
                        try {
                          parsedQuestions = typeof test.questions_json === 'string'
                            ? JSON.parse(test.questions_json)
                            : (test.questions || []);
                        } catch {
                          parsedQuestions = test.questions || [];
                        }

                        onLaunchExam({
                          id: test.id,
                          track: test.exam_id || 'gate_cs',
                          subject: test.title,
                          quizTitle: test.title,
                          difficulty: test.difficulty || 'Hard',
                          totalQuestions: test.total_questions || parsedQuestions.length,
                          timeLimitMinutes: test.time_limit_minutes || 25,
                          description: test.title,
                          topics: [],
                          questions: parsedQuestions
                        });
                      }}
                      className="px-2.5 py-1 bg-[#173F3D] hover:bg-[#102B2A] text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3. TAB 2: AI GATE TUTOR */
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {/* Tutor Header with Clear Button */}
          <div className="p-3 border-b border-[#E6DFD3] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FAF7F2] text-[#173F3D] border border-[#E6DFD3]">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                  AI GATE Tutor
                </h3>
                <p className="text-[10px] text-[#78716C]">
                  Step-by-step derivations & concept explanations
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
                    GATE AI Tutor Ready
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
          <div className="p-3 border-t border-[#E6DFD3] bg-white shrink-0">
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
        </div>
      )}
    </aside>
  );
}
