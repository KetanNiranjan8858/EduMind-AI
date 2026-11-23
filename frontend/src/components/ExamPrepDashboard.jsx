import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AVAILABLE_EXAMS, GATE_SUBJECTS, GATE_EXAMS } from '../data/curatedExams';
import { sendChatMessage, fetchExamPrepQuestions, fetchExamPrepSubjects, fetchExamPrepTests, deleteExamPrepTest } from '../utils/api';
import {
  ExamPrepHeader,
  ExamPrepAnalyticsBar,
  ExamPrepSubjectSidebar,
  ExamPrepTestsView,
  ExamPrepAiSidebar,
  SubjectAnalyticsModal,
  GenerateExamModal
} from './examprep';
import ResizeHandle from './ResizeHandle';

/**
 * ExamPrepDashboard — Main orchestrator for GATE CS/IT CBT preparation
 * Modularized into focused subcomponents in /components/examprep/
 */
export default function ExamPrepDashboard({
  currentUser,
  examHistory = [],
  onLaunchExam,
  onReviewAttempt,
  onReturnToStudio,
  onRequireLogin
}) {
  // Menu Option to select exam track (Currently GATE CS/IT)
  const [selectedExamId, setSelectedExamId] = useState('gate_cs');

  // Database-backed Questions, Subjects and Published Tests State
  const [dbQuestions, setDbQuestions] = useState([]);
  const [dbSubjects, setDbSubjects] = useState(GATE_SUBJECTS);
  const [publishedTests, setPublishedTests] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Handle test created from modal
  function handleTestGenerated(newTest) {
    setPublishedTests((prev) => [newTest, ...prev.filter((t) => t.id !== newTest.id)]);
  }

  // Handle test deletion
  async function handleDeleteTest(testId, testTitle) {
    if (!window.confirm(`Are you sure you want to delete test "${testTitle}"?`)) return;
    try {
      await deleteExamPrepTest(testId);
      setPublishedTests((prev) => prev.filter((t) => t.id !== testId));
    } catch (err) {
      alert('Failed to delete test: ' + err.message);
    }
  }

  // Load Question Bank and Subjects directly from Database on mount
  useEffect(() => {
    let mounted = true;
    async function loadDb() {
      try {
        const [qRes, sRes, tRes] = await Promise.all([
          fetchExamPrepQuestions({ examId: 'gate_cs' }).catch(() => ({ questions: [] })),
          fetchExamPrepSubjects().catch(() => ({ subjects: [] })),
          fetchExamPrepTests('gate_cs').catch(() => ({ tests: [] }))
        ]);
        if (!mounted) return;
        if (qRes.questions && qRes.questions.length > 0) {
          setDbQuestions(qRes.questions);
        } else {
          // Fallback from GATE_EXAMS
          const fallbackQ = GATE_EXAMS.flatMap((e) =>
            (e.questions || []).map((q) => ({
              ...q,
              subjectId: e.subjectId,
              subjectName: e.subject,
              topic: e.topics?.[0] || e.subject
            }))
          );
          setDbQuestions(fallbackQ);
        }
        if (sRes.subjects && sRes.subjects.length > 0) {
          setDbSubjects(sRes.subjects);
        }
        if (tRes.tests && tRes.tests.length > 0) {
          setPublishedTests(tRes.tests);
        }
      } catch (err) {
        console.warn('[ExamPrep] Error loading database questions:', err);
      } finally {
        if (mounted) setLoadingDb(false);
      }
    }
    loadDb();
    return () => {
      mounted = false;
    };
  }, []);

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

  // Window width tracking for real-time questions view layout reflow
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isResizing, setIsResizing] = useState(false);

  // Draggable sidebar widths with persistence
  const [prepLeftWidth, setPrepLeftWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_prep_left_width');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 200 && parsed <= 500 ? parsed : 288;
    } catch {
      return 288;
    }
  });

  const [prepRightWidth, setPrepRightWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_prep_right_width');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 260 && parsed <= 560 ? parsed : 384;
    } catch {
      return 384;
    }
  });

  // Calculate dynamic main questions view width in real time
  const prepMainWidth = Math.max(300, windowWidth - prepLeftWidth - prepRightWidth - 16);

  const handlePrepLeftResize = useCallback((clientX) => {
    const minWidth = 200;
    const maxWidth = 500;
    const clamped = Math.max(minWidth, Math.min(maxWidth, clientX));
    setPrepLeftWidth(clamped);
  }, []);

  const handlePrepLeftDragEnd = useCallback((clientX) => {
    setIsResizing(false);
    const minWidth = 200;
    const maxWidth = 500;
    const clamped = Math.max(minWidth, Math.min(maxWidth, clientX));
    try {
      localStorage.setItem('edumind_prep_left_width', clamped.toString());
    } catch {}
  }, []);

  const handlePrepLeftReset = useCallback(() => {
    setPrepLeftWidth(288);
    try {
      localStorage.removeItem('edumind_prep_left_width');
    } catch {}
  }, []);

  const handlePrepRightResize = useCallback((clientX) => {
    const minWidth = 260;
    const maxWidth = 560;
    const newWidth = window.innerWidth - clientX;
    const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setPrepRightWidth(clamped);
  }, []);

  const handlePrepRightDragEnd = useCallback((clientX) => {
    setIsResizing(false);
    const minWidth = 260;
    const maxWidth = 560;
    const newWidth = window.innerWidth - clientX;
    const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));
    try {
      localStorage.setItem('edumind_prep_right_width', clamped.toString());
    } catch {}
  }, []);

  const handlePrepRightReset = useCallback(() => {
    setPrepRightWidth(384);
    try {
      localStorage.removeItem('edumind_prep_right_width');
    } catch {}
  }, []);

  // List of all individual official subject IDs (excluding 'all')
  const allSubjectIds = useMemo(() => {
    return dbSubjects.filter((s) => s.id !== 'all').map((s) => s.id);
  }, [dbSubjects]);

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

  // Total questions in the GATE question bank across all subjects from Database
  const totalQuestionsInBank = useMemo(() => {
    return dbQuestions.length > 0 ? dbQuestions.length : 100;
  }, [dbQuestions]);

  // Compute Analytics strictly from Candidate's Exam Prep History for GATE CS/IT
  const gateAttempts = useMemo(() => {
    return (examHistory || []).filter(
      (h) =>
        h.category === 'examprep' ||
        h.workspace_id === 'ws_gate_prep' ||
        h.quiz?.track === 'gate_cs' ||
        Boolean(h.quiz?.subjectId) ||
        (h.quiz_title && h.quiz_title.toLowerCase().includes('gate'))
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

  // Filtered Subject Groups with Questions loaded from Database
  const subjectGroups = useMemo(() => {
    const subjectsToUse = isAllSelected
      ? dbSubjects.filter((s) => s.id !== 'all')
      : dbSubjects.filter((s) => selectedSubjectIds.includes(s.id));

    return subjectsToUse.map((sub) => {
      const questions = dbQuestions.filter((q) => q.subjectId === sub.id);
      return {
        ...sub,
        questions
      };
    }).filter((group) => group.questions.length > 0);
  }, [dbQuestions, dbSubjects, isAllSelected, selectedSubjectIds]);

  const selectedTotalQuestions = useMemo(() => {
    return subjectGroups.reduce((sum, g) => sum + g.questions.length, 0);
  }, [subjectGroups]);

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

  // Pre-fill question into AI Assistant with strict precision instruction
  function handleAskAiQuestion(q, subjectName) {
    const prompt = `Solve this GATE CS question from ${subjectName}:\n\nQuestion: ${q.question}\nOptions:\nA) ${q.options?.A || ''}\nB) ${q.options?.B || ''}\nC) ${q.options?.C || ''}\nD) ${q.options?.D || ''}\n\nCorrect Answer: Option ${q.correctAnswer}\n\nProvide only the precise step-by-step derivation and key formulas. Do not include greetings, pleasantries, or extraneous commentary.`;
    handleSendChatMessage(prompt);
  }

  return (
    <div className="h-screen flex flex-col bg-[#F4EFE6] text-[#1C1917] overflow-hidden font-sans">
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

      {/* 3. Main Split View with Floating Cards */}
      <div className="flex-1 flex overflow-hidden px-3 pb-3 gap-2 bg-[#F4EFE6]">
        {/* Left Sidebar: Select Subject with Checkboxes */}
        <ExamPrepSubjectSidebar
          subjects={dbSubjects}
          isAllSelected={isAllSelected}
          selectedSubjectIds={selectedSubjectIds}
          onToggleSubject={handleToggleSubject}
          onSelectAll={() => setSelectedSubjectIds(['all'])}
          onClearAll={() => setSelectedSubjectIds([])}
          allSubjectIds={allSubjectIds}
          style={{ width: `${prepLeftWidth}px` }}
        />

        {/* Draggable Resize Handle between Left Sidebar and Questions View */}
        <ResizeHandle
          onResize={handlePrepLeftResize}
          onReset={handlePrepLeftReset}
          onDragStart={() => setIsResizing(true)}
          onDragEnd={handlePrepLeftDragEnd}
        />

        {/* Center Main Content Box: Generated Tests Viewer */}
        <ExamPrepTestsView
          contentWidth={prepMainWidth}
          isResizing={isResizing}
          tests={publishedTests}
          attempts={gateAttempts}
          selectedSubjectIds={selectedSubjectIds}
          isAllSelected={isAllSelected}
          dbSubjects={dbSubjects}
          onLaunchExam={onLaunchExam}
          onReviewAttempt={onReviewAttempt}
          onOpenGenerateModal={() => setShowGenerateModal(true)}
          onDeleteTest={handleDeleteTest}
        />

        {/* Draggable Resize Handle between Questions View and AI Sidebar */}
        <ResizeHandle
          onResize={handlePrepRightResize}
          onReset={handlePrepRightReset}
          onDragStart={() => setIsResizing(true)}
          onDragEnd={handlePrepRightDragEnd}
        />

        {/* Right Panel: AI GATE Tutor for Doubts & Performance Coaching */}
        <ExamPrepAiSidebar
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChangeChatInput={setChatInput}
          onKeyDownChatInput={handleChatKeyDown}
          onSendMessage={handleSendChatMessage}
          onClearChat={handleClearChat}
          isAiThinking={isAiThinking}
          chatEndRef={chatEndRef}
          subjectAnalytics={subjectAnalytics}
          focusSubject={focusSubject}
          bestSubject={bestSubject}
          accuracy={accuracy}
          totalAttempted={totalAttempted}
          totalCorrect={totalCorrect}
          style={{ width: `${prepRightWidth}px` }}
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
        selectedSubjectIds={selectedSubjectIds}
        isAllSelected={isAllSelected}
        questionsPool={dbQuestions.filter((q) => isAllSelected || selectedSubjectIds.includes(q.subjectId))}
        subjects={dbSubjects}
        onTestGenerated={handleTestGenerated}
        onLaunchExam={onLaunchExam}
      />
    </div>
  );
}
