import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  User,
  Shield,
  HelpCircle,
  Award
} from 'lucide-react';
import { getSafeOptions, formatTime, cleanQuestionStatement } from '../utils/helpers';

export default function ExamView({ quiz, onSubmitExam, onExit }) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-[#E6DFD3] p-8 rounded-2xl max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#173F3D] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#1C1917] mb-2">No Active Exam Data</h2>
          <p className="text-xs text-[#78716C] mb-6 leading-relaxed">
            The exam session could not be located in local storage. Please return to the AI Studio and launch a generated paper.
          </p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-[#173F3D] hover:bg-[#102B2A] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;

  // Restore or initialize state from localStorage
  const examStorageKey = `edumind_cbt_session_${quiz.generatedAt || 'active'}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  // Status map: 'answered' | 'not_answered' | 'marked' | 'not_visited'
  const [questionStatus, setQuestionStatus] = useState(() => {
    const initialStatus = {};
    questions.forEach((q, idx) => {
      initialStatus[q.id !== undefined ? q.id : idx + 1] = idx === 0 ? 'not_answered' : 'not_visited';
    });
    return initialStatus;
  });

  const [questionTimes, setQuestionTimes] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const activeQuestion = questions[currentIndex];
  const activeQuestionId = activeQuestion.id !== undefined ? activeQuestion.id : currentIndex + 1;
  const safeOptions = getSafeOptions(activeQuestion.options);

  // Restore previous CBT session if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(examStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userAnswers) setUserAnswers(parsed.userAnswers);
        if (parsed.questionStatus) setQuestionStatus(parsed.questionStatus);
        if (parsed.questionTimes) setQuestionTimes(parsed.questionTimes);
        if (parsed.currentIndex !== undefined) setCurrentIndex(parsed.currentIndex);
      }
    } catch (e) {
      console.warn('Failed to restore CBT session:', e);
    }
  }, [examStorageKey]);

  // Save session state to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(
        examStorageKey,
        JSON.stringify({
          userAnswers,
          questionStatus,
          questionTimes,
          currentIndex
        })
      );
    } catch (e) {
      // quota or local storage restriction
    }
  }, [userAnswers, questionStatus, questionTimes, currentIndex, examStorageKey]);

  // Per-question active time counter (tracks time spent on current question)
  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionTimes((prev) => ({
        ...prev,
        [activeQuestionId]: (prev[activeQuestionId] || 0) + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuestionId]);

  function handleSelectOption(optKey) {
    setUserAnswers((prev) => ({
      ...prev,
      [activeQuestionId]: optKey
    }));
  }

  function handleClearResponse() {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[activeQuestionId];
      return copy;
    });

    setQuestionStatus((prev) => ({
      ...prev,
      [activeQuestionId]: 'not_answered'
    }));
  }

  function handleSaveAndNext() {
    const hasAnswer = userAnswers[activeQuestionId] !== undefined;

    setQuestionStatus((prev) => ({
      ...prev,
      [activeQuestionId]: hasAnswer ? 'answered' : 'not_answered'
    }));

    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 1);
    }
  }

  function handleMarkForReviewAndNext() {
    setQuestionStatus((prev) => ({
      ...prev,
      [activeQuestionId]: 'marked'
    }));

    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 1);
    }
  }

  function goToQuestion(index) {
    if (index < 0 || index >= totalQuestions) return;

    // If moving to a question that hasn't been visited, mark it as not_answered
    const targetQ = questions[index];
    const targetId = targetQ.id !== undefined ? targetQ.id : index + 1;

    setQuestionStatus((prev) => {
      if (prev[targetId] === 'not_visited' || !prev[targetId]) {
        return {
          ...prev,
          [targetId]: 'not_answered'
        };
      }
      return prev;
    });

    setCurrentIndex(index);
  }

  function handleFinalSubmit() {
    // Clear in-flight CBT session from localStorage
    localStorage.removeItem(examStorageKey);
    const totalSpent = Object.values(questionTimes).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    onSubmitExam({
      quiz,
      userAnswers,
      questionTimes,
      timeTakenSeconds: totalSpent
    });
  }

  // Calculate live legend counts
  const statusCounts = {
    answered: 0,
    not_answered: 0,
    marked: 0,
    not_visited: 0
  };

  questions.forEach((q, idx) => {
    const qId = q.id !== undefined ? q.id : idx + 1;
    const st = questionStatus[qId] || 'not_visited';
    if (statusCounts[st] !== undefined) {
      statusCounts[st]++;
    } else {
      statusCounts.not_visited++;
    }
  });

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col select-none">
      {/* Top Professional CBT Header */}
      <header className="h-16 bg-dark-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 duo-gradient text-white rounded-lg shadow-sm shadow-indigo-500/20">
              <Award className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-slate-100 flex items-center gap-2">
                <span>{quiz.quizTitle || 'CBT Examination Portal'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-cyan-300 border border-cyan-500/30">
                  {quiz.difficulty || 'Medium'}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Candidate ID: EDUMIND-CBT-{String(quiz.totalQuestions || 10).padStart(3, '0')} • Section: Computer Science & Systems
              </p>
            </div>
          </div>
        </div>

        {/* Time Spent on Question & Submit */}
        <div className="flex items-center gap-6">
          {/* Active Time Tracker Per Question */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 font-mono text-cyan-300 shadow-sm">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase mr-1.5 font-sans font-medium">
                Time on Q{currentIndex + 1}:
              </span>
              <span className="text-base font-bold tracking-wider text-cyan-200">
                {formatTime(questionTimes[activeQuestionId] || 0)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 duo-gradient duo-gradient-hover text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Active Question & Radio Options */}
        <main className="flex-1 flex flex-col bg-dark-950 overflow-y-auto border-r border-slate-800">
          {/* Question Sub-header */}
          <div className="px-8 py-3.5 bg-dark-900/50 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-200 text-sm">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">
                Marks: <strong className="text-emerald-400">+1.00</strong> / Negative:{' '}
                <strong className="text-rose-400">-0.33</strong>
              </span>
            </div>

            {/* Dual-Timer 2: Per-question active timer */}
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] bg-dark-950 px-2.5 py-1 rounded-md border border-slate-800">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>
                Spent on Q{currentIndex + 1}:{' '}
                <strong className="text-cyan-300">
                  {formatTime(questionTimes[activeQuestionId] || 0)}
                </strong>
              </span>
            </div>
          </div>

          {/* Question Statement & Options (Seamless, Frameless Layout) */}
          <div className="flex-1 p-8 max-w-3xl space-y-6">
            {/* Question Text */}
            <div className="py-2">
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed font-sans whitespace-pre-wrap">
                {cleanQuestionStatement(activeQuestion.question, quiz?.sourceFiles)}
              </p>
            </div>

            {/* Options List (Clean, Boxless Choices) */}
            <div className="space-y-1.5 pt-1">
              {safeOptions.map((opt) => {
                const isSelected = userAnswers[activeQuestionId] === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`flex items-start gap-3 py-2.5 px-3 rounded-xl transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-500/15 text-white font-medium'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {/* Radio Indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500 text-white'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      <span className={`font-bold mr-2 font-mono ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {opt.key}.
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <footer className="p-4 px-8 border-t border-slate-800 bg-dark-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearResponse}
                disabled={userAnswers[activeQuestionId] === undefined}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 disabled:opacity-30 rounded-xl border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Response</span>
              </button>

              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-600 rounded-xl border border-indigo-500/30 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mark for Review & Next</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 disabled:opacity-30 rounded-xl border border-slate-700/60 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-5 py-2 text-xs font-semibold text-white duo-gradient duo-gradient-hover rounded-xl flex items-center gap-1 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </main>

        {/* Right Side: Professional Color-Coded Question Palette */}
        <aside className="w-80 bg-dark-900 flex flex-col shrink-0 overflow-y-auto">
          {/* Candidate Card */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-dark-850">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Candidate Workspace</h3>
              <p className="text-[11px] text-slate-400 font-mono">Roll: #2026-GATE-091</p>
            </div>
          </div>

          {/* Color-Coded Status Legend */}
          <div className="p-4 border-b border-slate-800 space-y-2 text-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Question Palette Legend
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm shadow-cyan-600/20">
                  {statusCounts.answered}
                </span>
                <span className="text-slate-300">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm shadow-indigo-600/20">
                  {statusCounts.marked}
                </span>
                <span className="text-slate-300">Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-[10px]">
                  {statusCounts.not_answered}
                </span>
                <span className="text-slate-300">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-dark-950 text-slate-500 border border-slate-800 font-bold flex items-center justify-center text-[10px]">
                  {statusCounts.not_visited}
                </span>
                <span className="text-slate-400">Not Visited</span>
              </div>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="flex-1 p-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Navigate to Question
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const qId = q.id !== undefined ? q.id : idx + 1;
                const status = questionStatus[qId] || 'not_visited';
                const isCurrent = idx === currentIndex;

                let colorClass = 'bg-dark-950 text-slate-400 border-slate-800 hover:border-slate-700';
                if (status === 'answered') {
                  colorClass = 'bg-cyan-600 text-white border-cyan-500 shadow-sm shadow-cyan-600/20';
                } else if (status === 'marked') {
                  colorClass = 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/20';
                } else if (status === 'not_answered') {
                  colorClass = 'bg-slate-700 text-slate-200 border-slate-600 shadow-sm';
                } else if (status === 'not_visited') {
                  colorClass = 'bg-dark-950 text-slate-500 border-slate-800 hover:bg-dark-850';
                }

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-center relative cursor-pointer ${colorClass} ${
                      isCurrent ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-dark-900 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions footer */}
          <div className="p-4 border-t border-slate-800 bg-dark-950/60 text-[11px] text-slate-500">
            <p>
              Active time spent per question is tracked in real-time. Answers are continuously saved and synced across sessions.
            </p>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Submit Examination?</h3>
                <p className="text-xs text-slate-400">Review your attempt summary before final submission.</p>
              </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-dark-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-dark-900">
                <span className="text-slate-400">Total Questions:</span>
                <strong className="text-slate-100 font-mono">{totalQuestions}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-dark-900">
                <span className="text-emerald-400">Answered:</span>
                <strong className="text-emerald-400 font-mono">{statusCounts.answered}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-dark-900">
                <span className="text-rose-400">Not Answered:</span>
                <strong className="text-rose-400 font-mono">{statusCounts.not_answered}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-dark-900">
                <span className="text-blue-400">Marked for Review:</span>
                <strong className="text-blue-400 font-mono">{statusCounts.marked}</strong>
              </div>
            </div>

            <div className="text-xs text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              ⚠️ Once submitted, you cannot resume or alter your responses. You will be taken immediately to the Analytics & Review Dashboard.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Resume Test
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
              >
                Yes, Submit Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
