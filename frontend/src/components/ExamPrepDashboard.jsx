import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AVAILABLE_EXAMS, GATE_SUBJECTS, GATE_EXAMS } from '../data/curatedExams';
import { sendChatMessage } from '../utils/api';
import {
  ExamPrepHeader,
  ExamPrepAnalyticsBar,
  ExamPrepSubjectSidebar,
  ExamPrepQuestionsView,
  ExamPrepAiSidebar,
  SubjectAnalyticsModal,
  GenerateExamModal
} from './examprep';

/**
 * ExamPrepDashboard — Main orchestrator for GATE CS/IT CBT preparation
 * Modularized into focused subcomponents in /components/examprep/
 */
export default function ExamPrepDashboard({
  currentUser,
  examHistory = [],
  onLaunchExam,
  onReturnToStudio,
  onRequireLogin
}) {
  // Menu Option to select exam track (Currently GATE CS/IT)
  const [selectedExamId, setSelectedExamId] = useState('gate_cs');

  // Left Sidebar: Checkbox selection of subjects (Default: ['all'])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(['all']);

  // Modal State: Subject-wise Detailed Analytics Modal
  const [showSubjectAnalytics, setShowSubjectAnalytics] = useState(false);

  // Modal State: Generate Custom Exam for Attempt Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Question inspection & answer reveal state
  const [revealedExplanations, setRevealedExplanations] = useState({});

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  // List of all individual official subject IDs (excluding 'all')
  const allSubjectIds = useMemo(() => {
    return GATE_SUBJECTS.filter((s) => s.id !== 'all').map((s) => s.id);
  }, []);

  // Determine if all subjects are currently selected
  const isAllSelected = useMemo(() => {
    return (
      selectedSubjectIds.includes('all') ||
      allSubjectIds.every((id) => selectedSubjectIds.includes(id))
    );
  }, [selectedSubjectIds, allSubjectIds]);

  // Handle checking / unchecking a subject
  function handleToggleSubject(subjectId) {
    if (subjectId === 'all') {
      if (isAllSelected) {
        setSelectedSubjectIds([]);
      } else {
        setSelectedSubjectIds(['all']);
      }
      return;
    }

    setSelectedSubjectIds((prev) => {
      let current = prev.includes('all') ? [...allSubjectIds] : [...prev];
      if (current.includes(subjectId)) {
        current = current.filter((id) => id !== subjectId);
      } else {
        current = [...current, subjectId];
      }

      if (allSubjectIds.every((id) => current.includes(id))) {
        return ['all'];
      }
      return current;
    });
  }

  // Quick Action: Select Only One Subject
  function handleSelectOnlySubject(subjectId) {
    if (subjectId === 'all') {
      setSelectedSubjectIds(['all']);
    } else {
      setSelectedSubjectIds([subjectId]);
    }
  }

  // Total questions in the GATE question bank across all subjects
  const totalQuestionsInBank = useMemo(() => {
    return GATE_EXAMS.reduce(
      (acc, e) => acc + (e.questions?.length || e.totalQuestions || 0),
      0
    );
  }, []);

  // Compute Analytics from Candidate's Exam History for GATE CS/IT
  const gateAttempts = useMemo(() => {
    return (examHistory || []).filter(
      (h) =>
        !h.quiz?.track ||
        h.quiz?.track === 'gate_cs' ||
        h.quiz_title?.toLowerCase().includes('gate')
    );
  }, [examHistory]);

  const totalAttempted = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.attempted_count) || 0), 0);
  }, [gateAttempts]);

  const totalCorrect = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.correct_count) || 0), 0);
  }, [gateAttempts]);

  const totalIncorrect = Math.max(0, totalAttempted - totalCorrect);

  const totalQuestionsInRuns = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.total_questions) || 0), 0);
  }, [gateAttempts]);

  const totalTimeTakenSeconds = useMemo(() => {
    return gateAttempts.reduce((sum, h) => sum + (Number(h.time_taken_seconds) || 0), 0);
  }, [gateAttempts]);

  // Track which subjects candidate has attempted
  const attemptedSubjectIds = useMemo(() => {
    const set = new Set();
    gateAttempts.forEach((h) => {
      if (h.quiz?.subjectId) {
        set.add(h.quiz.subjectId);
      } else {
        GATE_SUBJECTS.forEach((sub) => {
          if (
            sub.id !== 'all' &&
            (h.quiz_title?.toLowerCase().includes(sub.shortName.toLowerCase()) ||
              h.quiz_title?.toLowerCase().includes(sub.name.toLowerCase()))
          ) {
            set.add(sub.id);
          }
        });
      }
    });
    return set;
  }, [gateAttempts]);

  // 1. Questions Attempted Out of Total
  const questionsDenominator =
    totalQuestionsInRuns > 0 ? totalQuestionsInRuns : totalQuestionsInBank;
  const attemptPercentage =
    questionsDenominator > 0
      ? Math.round((totalAttempted / questionsDenominator) * 100)
      : 0;

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

  // Detailed Subject-Wise Analytics Breakdown
  const subjectAnalytics = useMemo(() => {
    return GATE_SUBJECTS.filter((s) => s.id !== 'all').map((subject) => {
      const attempts = gateAttempts.filter((h) => {
        if (h.quiz?.subjectId) {
          return h.quiz.subjectId === subject.id;
        }
        return (
          h.quiz_title?.toLowerCase().includes(subject.shortName.toLowerCase()) ||
          h.quiz_title?.toLowerCase().includes(subject.name.toLowerCase())
        );
      });

      const attempted = attempts.reduce(
        (sum, h) => sum + (Number(h.attempted_count) || 0),
        0
      );
      const correct = attempts.reduce(
        (sum, h) => sum + (Number(h.correct_count) || 0),
        0
      );
      const incorrect = Math.max(0, attempted - correct);
      const timeSeconds = attempts.reduce(
        (sum, h) => sum + (Number(h.time_taken_seconds) || 0),
        0
      );

      const subjAccuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      const avgTime = attempted > 0 ? Math.round(timeSeconds / attempted) : 0;

      const exam = GATE_EXAMS.find((e) => e.subjectId === subject.id);
      const bankQuestionsCount = exam?.questions?.length || 10;

      let status = 'Not Attempted';
      let statusColor = 'slate';
      if (attempts.length > 0) {
        if (subjAccuracy >= 75) {
          status = 'Strong';
          statusColor = 'emerald';
        } else if (subjAccuracy >= 50) {
          status = 'Moderate';
          statusColor = 'blue';
        } else {
          status = 'Needs Practice';
          statusColor = 'amber';
        }
      }

      return {
        ...subject,
        attemptsCount: attempts.length,
        attempted,
        correct,
        incorrect,
        accuracy: subjAccuracy,
        avgTime,
        bankQuestionsCount,
        status,
        statusColor
      };
    });
  }, [gateAttempts]);

  // Top performing subject & Needs focus subject for analytics summary
  const bestSubject = useMemo(() => {
    const attemptedList = subjectAnalytics.filter((s) => s.attemptsCount > 0);
    if (attemptedList.length === 0) return null;
    return [...attemptedList].sort((a, b) => b.accuracy - a.accuracy)[0];
  }, [subjectAnalytics]);

  const focusSubject = useMemo(() => {
    const attemptedList = subjectAnalytics.filter((s) => s.attemptsCount > 0);
    if (attemptedList.length === 0) {
      return subjectAnalytics[0];
    }
    return [...attemptedList].sort((a, b) => a.accuracy - b.accuracy)[0];
  }, [subjectAnalytics]);

  // Filtered Subject Papers based on Checked Subjects
  const filteredExams = useMemo(() => {
    if (isAllSelected) {
      return GATE_EXAMS;
    }
    return GATE_EXAMS.filter((e) => selectedSubjectIds.includes(e.subjectId));
  }, [isAllSelected, selectedSubjectIds]);

  const selectedTotalQuestions = useMemo(() => {
    return filteredExams.reduce(
      (sum, e) => sum + (e.questions?.length || e.totalQuestions || 0),
      0
    );
  }, [filteredExams]);

  // Toggle answer / explanation reveal
  function toggleExplanation(qId) {
    setRevealedExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  }

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
    if (!customQuery) setChatInput('');
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

  // Pre-fill question into AI Assistant
  function handleAskAiQuestion(q, subjectName) {
    const prompt = `Please provide a step-by-step conceptual explanation and solution derivation for this GATE CS question from **${subjectName}**:\n\n**Question:** ${q.question}\n\n**Options:**\nA) ${q.options.A}\nB) ${q.options.B}\nC) ${q.options.C}\nD) ${q.options.D}\n\n**Correct Answer:** Option ${q.correctAnswer}\n\nExplain the underlying concept, formulas, and how to arrive at this answer efficiently in the GATE exam.`;
    handleSendChatMessage(prompt);
  }

  return (
    <div className="h-screen flex flex-col bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Header */}
      <ExamPrepHeader
        currentUser={currentUser}
        onReturnToStudio={onReturnToStudio}
        onRequireLogin={onRequireLogin}
      />

      {/* 2. Top Analytics Bar */}
      <ExamPrepAnalyticsBar
        selectedExamId={selectedExamId}
        onSelectExamId={setSelectedExamId}
        availableExams={AVAILABLE_EXAMS}
        attemptedSubjectCount={attemptedSubjectIds.size}
        mockTestsCount={gateAttempts.length}
        totalAttempted={totalAttempted}
        questionsDenominator={questionsDenominator}
        attemptPercentage={attemptPercentage}
        accuracy={accuracy}
        totalCorrect={totalCorrect}
        totalIncorrect={totalIncorrect}
        overallPercentage={overallPercentage}
        avgTimePerQuestion={avgTimePerQuestion}
        totalTimeTakenSeconds={totalTimeTakenSeconds}
        onOpenSubjectAnalytics={() => setShowSubjectAnalytics(true)}
      />

      {/* 3. Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Select Subject with Checkboxes (Clean: No enclosing boxes) */}
        <ExamPrepSubjectSidebar
          subjects={GATE_SUBJECTS}
          isAllSelected={isAllSelected}
          selectedSubjectIds={selectedSubjectIds}
          onToggleSubject={handleToggleSubject}
          onSelectAll={() => setSelectedSubjectIds(['all'])}
          onClearAll={() => setSelectedSubjectIds([])}
          allSubjectIds={allSubjectIds}
        />

        {/* Center Main Content: Filtered Subject Question Papers & Questions */}
        <ExamPrepQuestionsView
          isAllSelected={isAllSelected}
          filteredExams={filteredExams}
          selectedTotalQuestions={selectedTotalQuestions}
          totalQuestionsInBank={totalQuestionsInBank}
          gateExams={GATE_EXAMS}
          onSelectAllSubjects={() => setSelectedSubjectIds(['all'])}
          onSelectOnlySubject={handleSelectOnlySubject}
          onLaunchExam={onLaunchExam}
          onOpenGenerateModal={() => setShowGenerateModal(true)}
          revealedExplanations={revealedExplanations}
          onToggleExplanation={toggleExplanation}
          onAskAiQuestion={handleAskAiQuestion}
        />

        {/* Right AI Assistant Sidebar */}
        <ExamPrepAiSidebar
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChangeChatInput={setChatInput}
          onKeyDownChatInput={handleChatKeyDown}
          onSendMessage={handleSendChatMessage}
          onClearChat={handleClearChat}
          isAiThinking={isAiThinking}
          chatEndRef={chatEndRef}
        />
      </div>

      {/* 4. Subject-Wise Detailed Analytics Modal */}
      <SubjectAnalyticsModal
        isOpen={showSubjectAnalytics}
        onClose={() => setShowSubjectAnalytics(false)}
        subjectAnalytics={subjectAnalytics}
        bestSubject={bestSubject}
        focusSubject={focusSubject}
        attemptedSubjectIds={attemptedSubjectIds}
        accuracy={accuracy}
        totalCorrect={totalCorrect}
        totalAttempted={totalAttempted}
        onPracticeSubject={(subjectId) => {
          setSelectedSubjectIds([subjectId]);
          setShowSubjectAnalytics(false);
        }}
      />

      {/* 5. Generate Exam for Attempt Modal */}
      <GenerateExamModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        filteredExams={filteredExams}
        allExams={GATE_EXAMS}
        isAllSelected={isAllSelected}
        onLaunchExam={onLaunchExam}
      />
    </div>
  );
}
