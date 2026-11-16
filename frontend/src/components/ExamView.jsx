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
import { getSafeOptions, formatTime } from '../utils/helpers';

export default function ExamView({ quiz, onSubmitExam, onExit }) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 text-center">
        <div className="bg-dark-900 border border-slate-800 p-8 rounded-2xl max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">No Active Exam Data</h2>
          <p className="text-xs text-slate-400 mb-6">
            The exam session could not be located in local storage. Please return to the AI Studio and launch a generated paper.
          </p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;
  // Dual-Timer 1: Total paper countdown starts at 60s per question
  const initialTotalSeconds = totalQuestions * 60;

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

  const [totalTimeRemaining, setTotalTimeRemaining] = useState(initialTotalSeconds);
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
        if (parsed.totalTimeRemaining !== undefined) setTotalTimeRemaining(parsed.totalTimeRemaining);
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
          totalTimeRemaining,
          currentIndex
        })
      );
    } catch (e) {
      // quota or local storage restriction
    }
  }, [userAnswers, questionStatus, questionTimes, totalTimeRemaining, currentIndex, examStorageKey]);

  // Dual-Timer 1: Total paper countdown
  useEffect(() => {
    if (totalTimeRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTotalTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalTimeRemaining]);

  // Dual-Timer 2: Per-question active time counter (silently counts seconds)
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
    onSubmitExam({
      quiz,
      userAnswers,
      questionTimes,
      timeTakenSeconds: initialTotalSeconds - totalTimeRemaining
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

  const isLowTime = totalTimeRemaining < 120; // under 2 minutes
  const isCriticalTime = totalTimeRemaining < 30; // under 30 seconds

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col select-none">
      {/* Top Professional CBT Header (TCS / GATE Style) */}
      <header className="h-16 bg-dark-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase text-slate-100 flex items-center gap-2">
                <span>{quiz.quizTitle || 'CBT Examination Portal'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  {quiz.difficulty || 'Medium'}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Candidate ID: EDUMIND-CBT-{String(quiz.totalQuestions || 10).padStart(3, '0')} • Section: Computer Science & Systems
              </p>
            </div>
          </div>
        </div>

        {/* Dual Timer 1 & Submit */}
        <div className="flex items-center gap-6">
          {/* Dual-Timer: Total Countdown */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono transition-all ${
              isCriticalTime
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse font-bold'
                : isLowTime
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-dark-950 border-slate-800 text-brand-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase mr-1.5 font-sans font-medium">
                Time Remaining:
              </span>
              <span className="text-base font-bold tracking-wider">
                {formatTime(totalTimeRemaining)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
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

          {/* Question Statement & Options */}
          <div className="flex-1 p-8 max-w-4xl space-y-6">
            {/* Question Text */}
            <div className="p-6 rounded-2xl bg-dark-900/80 border border-slate-800/90 shadow-sm">
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed font-sans whitespace-pre-wrap">
                {activeQuestion.question}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {safeOptions.map((opt) => {
                const isSelected = userAnswers[activeQuestionId] === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500/50 shadow-md shadow-brand-500/10'
                        : 'bg-dark-900/50 border-slate-800/80 hover:bg-dark-850 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {/* Radio Button */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-brand-400 bg-brand-500 text-white'
                          : 'border-slate-600 bg-dark-950'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      <span className="font-bold mr-2 text-brand-400 font-mono">
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
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 disabled:opacity-30 rounded-xl border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Response</span>
              </button>

              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2 text-xs font-semibold text-blue-300 hover:text-white bg-blue-500/15 hover:bg-blue-600 rounded-xl border border-blue-500/30 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Mark for Review & Next</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-850 hover:bg-slate-800 disabled:opacity-30 rounded-xl border border-slate-700/60 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl flex items-center gap-1 shadow-md shadow-brand-500/20 transition-all"
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
                <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {statusCounts.answered}
                </span>
                <span className="text-slate-300">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {statusCounts.not_answered}
                </span>
                <span className="text-slate-300">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {statusCounts.marked}
                </span>
                <span className="text-slate-300">Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                  {statusCounts.not_visited}
                </span>
                <span className="text-slate-300">Not Visited</span>
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

                let colorClass = 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500';
                if (status === 'answered') {
                  colorClass = 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
                } else if (status === 'not_answered') {
                  colorClass = 'bg-rose-600 text-white border-rose-500 shadow-sm';
                } else if (status === 'marked') {
                  colorClass = 'bg-blue-600 text-white border-blue-500 shadow-sm';
                } else if (status === 'not_visited') {
                  colorClass = 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750';
                }

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-center relative ${colorClass} ${
                      isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-105' : ''
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
              Auto-submission triggers immediately when the total countdown expires. Answers are continuously synced to cross-tab storage.
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
