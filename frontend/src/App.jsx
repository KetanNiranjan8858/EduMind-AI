import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Layers,
  History,
  Target,
  User,
  Sparkles,
  Shield
} from 'lucide-react';

import SourcePanel from './components/SourcePanel';
import ChatHub from './components/ChatHub';
import AIStudio from './components/AIStudio';
import NoteModal from './components/NoteModal';
import SourcePreviewModal from './components/SourcePreviewModal';
import WorkspaceModal from './components/WorkspaceModal';
import HistoryModal from './components/HistoryModal';
import LoginModal from './components/LoginModal';
import ExamPrepDashboard from './components/ExamPrepDashboard';
import ExamView from './components/ExamView';
import AnalyticsView from './components/AnalyticsView';
import { AdminPortal, AdminAccessGate } from './components/admin';
import ResizeHandle from './components/ResizeHandle';

import {
  fetchWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  fetchSources,
  uploadFiles,
  createNote,
  deleteSource,
  generateQuiz,
  fetchExamHistory,
  saveExamAttempt,
  deleteExamAttempt
} from './utils/api';
import { calculateScore } from './utils/helpers';

export default function App() {
  // Mode: 'studio' | 'exam' | 'analytics' | 'examprep' | 'admin'
  const [viewMode, setViewMode] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    if (path === '/admin' || urlParams.get('mode') === 'admin') {
      return 'admin';
    }
    if (path === '/examprep' || urlParams.get('mode') === 'examprep' || urlParams.get('mode') === 'prep') {
      return 'examprep';
    }
    if (urlParams.get('mode') === 'cbt' || urlParams.get('mode') === 'exam') {
      return 'exam';
    }
    return 'studio';
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');

  // Workspace State
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    return localStorage.getItem('edumind_active_workspace_id') || 'ws_default';
  });
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Pinned Workspaces State
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_pinned_workspaces');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic window width for real-time main content calculation
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isResizing, setIsResizing] = useState(false);

  // Draggable sidebar widths with localStorage persistence
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_sidebar_width');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 220 && parsed <= 560 ? parsed : 320;
    } catch {
      return 320;
    }
  });

  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_right_sidebar_width');
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 260 && parsed <= 560 ? parsed : 352;
    } catch {
      return 352;
    }
  });

  // Calculate dynamic main content width in real time
  const mainContentWidth = Math.max(300, windowWidth - leftSidebarWidth - rightSidebarWidth - 16);

  const handleLeftSidebarResize = useCallback((clientX) => {
    const minWidth = 220;
    const maxWidth = 560;
    const clamped = Math.max(minWidth, Math.min(maxWidth, clientX));
    setLeftSidebarWidth(clamped);
  }, []);

  const handleLeftSidebarDragEnd = useCallback((clientX) => {
    setIsResizing(false);
    const minWidth = 220;
    const maxWidth = 560;
    const clamped = Math.max(minWidth, Math.min(maxWidth, clientX));
    try {
      localStorage.setItem('edumind_sidebar_width', clamped.toString());
    } catch {}
  }, []);

  const handleLeftSidebarReset = useCallback(() => {
    setLeftSidebarWidth(320);
    try {
      localStorage.removeItem('edumind_sidebar_width');
    } catch {}
  }, []);

  const handleRightSidebarResize = useCallback((clientX) => {
    const minWidth = 260;
    const maxWidth = 560;
    const newWidth = window.innerWidth - clientX;
    const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setRightSidebarWidth(clamped);
  }, []);

  const handleRightSidebarDragEnd = useCallback((clientX) => {
    setIsResizing(false);
    const minWidth = 260;
    const maxWidth = 560;
    const newWidth = window.innerWidth - clientX;
    const clamped = Math.max(minWidth, Math.min(maxWidth, newWidth));
    try {
      localStorage.setItem('edumind_right_sidebar_width', clamped.toString());
    } catch {}
  }, []);

  const handleRightSidebarReset = useCallback(() => {
    setRightSidebarWidth(352);
    try {
      localStorage.removeItem('edumind_right_sidebar_width');
    } catch {}
  }, []);

  // Active Workspace Data
  const [sources, setSources] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [studioExamHistory, setStudioExamHistory] = useState([]);
  const [examPrepHistory, setExamPrepHistory] = useState([]);
  const [examOrigin, setExamOrigin] = useState(() => {
    try {
      return localStorage.getItem('edumind_exam_origin') || 'studio';
    } catch {
      return 'studio';
    }
  });

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState(null);

  // Recent Quizzes in Studio (Persisted per workspace and user in localStorage)
  const [recentQuizzes, setRecentQuizzes] = useState(() => {
    try {
      const userKey = currentUser?.id || 'guest';
      const saved = localStorage.getItem(`edumind_recent_quizzes_${userKey}_${activeWorkspaceId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Exam State (Bridged via localStorage)
  const [activeQuiz, setActiveQuiz] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_active_exam');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Submitted Exam Results
  const [examResultData, setExamResultData] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_exam_results');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen for Cross-Tab localStorage handoff events
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === 'edumind_active_exam' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setActiveQuiz(parsed);
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('mode') === 'cbt') {
            setViewMode('exam');
          }
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync browser URL with viewMode (supporting /admin route)
  useEffect(() => {
    const currentPath = window.location.pathname.toLowerCase();
    if (viewMode === 'admin') {
      if (currentPath !== '/admin') {
        window.history.pushState({ mode: 'admin' }, '', '/admin');
      }
    } else if (viewMode === 'studio') {
      if (currentPath === '/admin') {
        window.history.pushState({ mode: 'studio' }, '', '/');
      }
    }
  }, [viewMode]);

  // Handle browser back/forward buttons
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname.toLowerCase();
      const urlParams = new URLSearchParams(window.location.search);
      if (path === '/admin' || urlParams.get('mode') === 'admin') {
        setViewMode('admin');
      } else if (path === '/examprep' || urlParams.get('mode') === 'examprep' || urlParams.get('mode') === 'prep') {
        setViewMode('examprep');
      } else if (urlParams.get('mode') === 'cbt' || urlParams.get('mode') === 'exam') {
        setViewMode('exam');
      } else {
        setViewMode('studio');
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load Workspaces on mount and when user login state changes
  useEffect(() => {
    loadWorkspaces(currentUser?.id);
  }, [currentUser?.id]);

  // When activeWorkspaceId or currentUser changes, load sources and history
  useEffect(() => {
    localStorage.setItem('edumind_active_workspace_id', activeWorkspaceId);
    loadWorkspaceData(activeWorkspaceId, currentUser?.id);

    // Restore recent quizzes for this workspace & user
    try {
      const userKey = currentUser?.id || 'guest';
      const saved = localStorage.getItem(`edumind_recent_quizzes_${userKey}_${activeWorkspaceId}`);
      setRecentQuizzes(saved ? JSON.parse(saved) : []);
    } catch {
      setRecentQuizzes([]);
    }
  }, [activeWorkspaceId, currentUser?.id]);

  // Sync recentQuizzes to workspace & user key
  useEffect(() => {
    try {
      const userKey = currentUser?.id || 'guest';
      localStorage.setItem(`edumind_recent_quizzes_${userKey}_${activeWorkspaceId}`, JSON.stringify(recentQuizzes));
    } catch {}
  }, [recentQuizzes, activeWorkspaceId, currentUser?.id]);

  async function loadWorkspaces(userId = currentUser?.id) {
    try {
      const res = await fetchWorkspaces(userId);
      if (res.workspaces && res.workspaces.length > 0) {
        setWorkspaces(res.workspaces);
        if (!res.workspaces.some(w => w.id === activeWorkspaceId)) {
          setActiveWorkspaceId(res.workspaces[0].id);
        }
      } else {
        setWorkspaces([]);
      }
    } catch (err) {
      console.warn('Could not load workspaces:', err.message);
    }
  }

  async function loadWorkspaceData(wsId, userId = currentUser?.id) {
    try {
      setLoadingSources(true);
      const [srcRes, studioHistRes, prepHistRes] = await Promise.all([
        fetchSources(wsId, userId),
        fetchExamHistory({
          workspaceId: wsId,
          userId: userId,
          candidateId: currentUser?.candidateId,
          category: 'studio'
        }).catch(() => ({ history: [] })),
        fetchExamHistory({
          workspaceId: 'ws_gate_prep',
          userId: userId,
          candidateId: currentUser?.candidateId,
          category: 'examprep'
        }).catch(() => ({ history: [] }))
      ]);

      if (srcRes.sources) {
        setSources(srcRes.sources);
        setSelectedIds(srcRes.sources.map(s => s.id));
      } else {
        setSources([]);
        setSelectedIds([]);
      }

      if (studioHistRes.history) {
        setStudioExamHistory(studioHistRes.history);
      } else {
        setStudioExamHistory([]);
      }

      if (prepHistRes.history) {
        setExamPrepHistory(prepHistRes.history);
      } else {
        setExamPrepHistory([]);
      }
    } catch (err) {
      console.warn('Error loading workspace data:', err.message);
    } finally {
      setLoadingSources(false);
    }
  }

  function handleTogglePin(wsId, e) {
    if (e) e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(wsId) ? prev.filter((id) => id !== wsId) : [...prev, wsId];
      try {
        localStorage.setItem('edumind_pinned_workspaces', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  async function handleUpdateWorkspaceName(id, newName) {
    try {
      await updateWorkspace(id, { name: newName });
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
    } catch (err) {
      alert('Failed to update workspace name: ' + err.message);
    }
  }

  async function handleCreateWorkspace(data) {
    const res = await createWorkspace({ ...data, userId: currentUser?.id });
    if (res.workspace) {
      setWorkspaces(prev => [...prev, res.workspace]);
      setActiveWorkspaceId(res.workspace.id);
    }
  }

  async function handleDeleteWorkspace(id, e) {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace and all its data?')) return;
    try {
      await deleteWorkspace(id);
      const remaining = workspaces.filter(w => w.id !== id);
      setWorkspaces(remaining);
      if (activeWorkspaceId === id) {
        if (remaining.length > 0) {
          setActiveWorkspaceId(remaining[0].id);
        } else {
          try {
            const res = await createWorkspace({ name: 'General Study Workspace', color: 'indigo', userId: currentUser?.id });
            if (res.workspace) {
              setWorkspaces([res.workspace]);
              setActiveWorkspaceId(res.workspace.id);
            } else {
              setActiveWorkspaceId('ws_default');
            }
          } catch {
            setActiveWorkspaceId('ws_default');
          }
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete workspace');
    }
  }

  async function handleUploadFiles(fileList) {
    try {
      setUploading(true);
      const res = await uploadFiles(fileList, activeWorkspaceId, currentUser?.id);
      if (res.files) {
        setSources((prev) => [...res.files, ...prev]);
        setSelectedIds((prev) => [...res.files.map((f) => f.id), ...prev]);
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateNote({ title, content }) {
    const res = await createNote({ title, content, workspaceId: activeWorkspaceId, userId: currentUser?.id });
    if (res.note) {
      setSources((prev) => [res.note, ...prev]);
      setSelectedIds((prev) => [res.note.id, ...prev]);
    }
  }

  async function handleDeleteSource(source) {
    if (!window.confirm(`Are you sure you want to delete "${source.original_name}"?`)) return;
    try {
      await deleteSource(source.id);
      setSources((prev) => prev.filter((s) => s.id !== source.id));
      setSelectedIds((prev) => prev.filter((id) => id !== source.id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  function handleToggleSelect(sourceId) {
    setSelectedIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  }

  function handleSelectAll() {
    setSelectedIds(sources.map((s) => s.id));
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  async function handleGenerateQuiz({ difficulty, questionCount }) {
    if (!currentUser) {
      setLoginPromptMessage('Please sign in or register to generate CBT assessments.');
      setIsLoginModalOpen(true);
      return;
    }

    try {
      setGeneratingQuiz(true);
      const res = await generateQuiz({
        sourceIds: selectedIds,
        difficulty,
        questionCount,
        workspaceId: activeWorkspaceId,
        userId: currentUser?.id
      });

      if (res.quiz) {
        setRecentQuizzes((prev) => [res.quiz, ...prev]);
      }
    } catch (err) {
      alert(`Quiz generation failed: ${err.message}`);
    } finally {
      setGeneratingQuiz(false);
    }
  }

  // Launch CBT Exam
  function handleLaunchExam(quiz, origin) {
    const detectedOrigin = origin || (
      quiz?.track === 'gate_cs' || quiz?.subjectId || (quiz?.quizTitle && quiz.quizTitle.toLowerCase().includes('gate'))
        ? 'examprep'
        : 'studio'
    );
    setExamOrigin(detectedOrigin);
    try {
      localStorage.setItem('edumind_exam_origin', detectedOrigin);
      localStorage.setItem('edumind_active_exam', JSON.stringify(quiz));
      setActiveQuiz(quiz);
      setViewMode('exam');
    } catch (err) {
      console.error('Failed to launch exam:', err);
      setActiveQuiz(quiz);
      setViewMode('exam');
    }
  }

  function handleDeleteRecentQuiz(index) {
    setRecentQuizzes((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleExamSubmit(submissionData) {
    try {
      localStorage.setItem('edumind_exam_results', JSON.stringify(submissionData));
    } catch {}

    // Calculate score metrics
    const stats = calculateScore(
      submissionData.quiz.questions,
      submissionData.userAnswers,
      submissionData.questionTimes
    );

    const isExamPrep =
      examOrigin === 'examprep' ||
      submissionData.quiz?.track === 'gate_cs' ||
      Boolean(submissionData.quiz?.subjectId) ||
      (submissionData.quiz?.quizTitle && submissionData.quiz.quizTitle.toLowerCase().includes('gate'));

    const targetCategory = isExamPrep ? 'examprep' : 'studio';
    const targetWorkspaceId = isExamPrep ? 'ws_gate_prep' : activeWorkspaceId;

    // Optimistically update attempt history immediately so UI & metrics reflect the new score
    const optimisticAttempt = {
      id: `att_${Date.now()}`,
      workspace_id: targetWorkspaceId,
      user_id: currentUser?.id || null,
      candidate_id: currentUser?.candidateId || null,
      user_email: currentUser?.email || null,
      user_name: currentUser?.name || null,
      quiz_id: submissionData.quiz?.id || `quiz_${Date.now()}`,
      quiz_title: submissionData.quiz?.quizTitle || submissionData.quiz?.title || 'Practice Assessment',
      difficulty: submissionData.quiz?.difficulty || 'Hard',
      total_questions: submissionData.quiz?.questions?.length || stats.totalQuestions,
      attempted_count: stats.attemptedCount,
      correct_count: stats.correctCount,
      incorrect_count: stats.incorrectCount,
      accuracy_percentage: stats.accuracyPercentage,
      overall_percentage: stats.overallPercentage,
      time_taken_seconds: submissionData.timeTakenSeconds,
      submitted_at: new Date().toISOString(),
      category: targetCategory,
      quiz: submissionData.quiz,
      userAnswers: submissionData.userAnswers,
      questionTimes: submissionData.questionTimes
    };

    if (isExamPrep) {
      setExamPrepHistory((prev) => [optimisticAttempt, ...(prev || []).filter((a) => a.id !== optimisticAttempt.id)]);
    } else {
      setStudioExamHistory((prev) => [optimisticAttempt, ...(prev || []).filter((a) => a.id !== optimisticAttempt.id)]);
    }

    // Persist attempt in DB history strictly separated by category & workspace
    try {
      await saveExamAttempt({
        workspaceId: targetWorkspaceId,
        userId: currentUser?.id || null,
        candidateId: currentUser?.candidateId || null,
        userEmail: currentUser?.email || null,
        userName: currentUser?.name || null,
        category: targetCategory,
        quiz: submissionData.quiz,
        userAnswers: submissionData.userAnswers,
        questionTimes: submissionData.questionTimes,
        timeTakenSeconds: submissionData.timeTakenSeconds,
        stats
      });

      if (isExamPrep) {
        const histRes = await fetchExamHistory({
          workspaceId: 'ws_gate_prep',
          userId: currentUser?.id,
          candidateId: currentUser?.candidateId,
          category: 'examprep'
        });
        if (histRes.history) setExamPrepHistory(histRes.history);
      } else {
        const histRes = await fetchExamHistory({
          workspaceId: activeWorkspaceId,
          userId: currentUser?.id,
          candidateId: currentUser?.candidateId,
          category: 'studio'
        });
        if (histRes.history) setStudioExamHistory(histRes.history);
      }
    } catch (err) {
      console.warn('Failed to persist exam attempt to DB:', err);
    }

    setExamResultData(submissionData);
    setViewMode('analytics');
  }

  function handleReturnToStudio() {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('mode') === 'cbt' ||
      urlParams.get('mode') === 'exam' ||
      urlParams.get('mode') === 'examprep' ||
      urlParams.get('mode') === 'admin' ||
      window.location.pathname.toLowerCase() === '/admin'
    ) {
      window.history.replaceState({}, document.title, '/');
    }
    if (examOrigin === 'examprep') {
      setViewMode('examprep');
    } else {
      setViewMode('studio');
    }
  }

  function handleRetakeExam() {
    if (examResultData?.quiz) {
      setActiveQuiz(examResultData.quiz);
      setViewMode('exam');
    } else if (activeQuiz) {
      setViewMode('exam');
    }
  }

  function handleReviewPastAttempt(attempt) {
    const origin = attempt.category || (attempt.quiz?.track === 'gate_cs' ? 'examprep' : 'studio');
    setExamOrigin(origin);
    try {
      localStorage.setItem('edumind_exam_origin', origin);
    } catch {}
    const data = {
      quiz: attempt.quiz,
      userAnswers: attempt.userAnswers,
      questionTimes: attempt.questionTimes,
      timeTakenSeconds: attempt.time_taken_seconds
    };
    setExamResultData(data);
    setViewMode('analytics');
  }

  function handleRetakePastAttempt(attempt) {
    const origin = attempt.category || (attempt.quiz?.track === 'gate_cs' ? 'examprep' : 'studio');
    setActiveQuiz(attempt.quiz);
    handleLaunchExam(attempt.quiz, origin);
  }

  async function handleDeletePastAttempt(id) {
    if (!window.confirm('Delete this exam attempt record?')) return;
    try {
      await deleteExamAttempt(id);
      setStudioExamHistory(prev => prev.filter(a => a.id !== id));
      setExamPrepHistory(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete attempt: ' + err.message);
    }
  }

  function handleLoginUser(userData) {
    setCurrentUser(userData);
    localStorage.setItem('edumind_user', JSON.stringify(userData));
    loadWorkspaces(userData.id);
    loadWorkspaceData(activeWorkspaceId, userData.id);
  }

  function handleLogoutUser() {
    setCurrentUser(null);
    localStorage.removeItem('edumind_user');
    // Clear all in-memory user data immediately so that nothing persists in the UI
    setSources([]);
    setSelectedIds([]);
    setStudioExamHistory([]);
    setExamPrepHistory([]);
    setRecentQuizzes([]);
    setActiveWorkspaceId('ws_default');
    loadWorkspaces(null);
    loadWorkspaceData('ws_default', null);
  }

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0] || {
    id: 'ws_default',
    name: 'General Study Workspace',
    color: 'indigo'
  };

  // Route 1: The CBT Exam View (Standalone Tab or mode)
  if (viewMode === 'exam') {
    return (
      <ExamView
        quiz={activeQuiz}
        onSubmitExam={handleExamSubmit}
        onExit={handleReturnToStudio}
      />
    );
  }

  // Route 2: The Analytics & Review Dashboard
  if (viewMode === 'analytics' && examResultData) {
    return (
      <AnalyticsView
        quiz={examResultData.quiz}
        userAnswers={examResultData.userAnswers}
        questionTimes={examResultData.questionTimes}
        timeTakenSeconds={examResultData.timeTakenSeconds}
        onReturnToStudio={handleReturnToStudio}
        onRetakeExam={handleRetakeExam}
      />
    );
  }

  // Route 3: The Dedicated Exam Prep Dashboard & AI Concept Tutor
  if (viewMode === 'examprep') {
    return (
      <>
        <ExamPrepDashboard
          currentUser={currentUser}
          examHistory={examPrepHistory}
          onLaunchExam={(quiz) => handleLaunchExam(quiz, 'examprep')}
          onReviewAttempt={handleReviewPastAttempt}
          onReturnToStudio={handleReturnToStudio}
          onRequireLogin={() => {
            setLoginPromptMessage('Please sign in or register to attempt CBT exams and track scores.');
            setIsLoginModalOpen(true);
          }}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false);
            setLoginPromptMessage('');
          }}
          currentUser={currentUser}
          onLogin={(userData) => {
            handleLoginUser(userData);
            setLoginPromptMessage('');
          }}
          onLogout={handleLogoutUser}
          loginPromptMessage={loginPromptMessage}
        />
      </>
    );
  }

  // Route 4: Institutional Admin Portal (Protected: Only Admin Allowed)
  if (viewMode === 'admin') {
    const isAdmin = currentUser?.role === 'admin';
    if (!isAdmin) {
      return (
        <AdminAccessGate
          currentUser={currentUser}
          onAdminVerified={(elevatedUser) => {
            setCurrentUser(elevatedUser);
          }}
          onReturnToPrep={() => setViewMode('examprep')}
          onReturnToStudio={handleReturnToStudio}
        />
      );
    }
    return (
      <AdminPortal
        currentUser={currentUser}
        onReturnToPrep={() => setViewMode('examprep')}
        onLaunchExam={(quiz) => handleLaunchExam(quiz, 'examprep')}
      />
    );
  }

  const selectedSourcesList = (sources || []).filter((s) => s && (selectedIds || []).includes(s.id));

  // Route 5: Central Studio (3-Panel Layout)
  return (
    <div className="h-screen flex flex-col bg-[#F4EFE6] text-[#1C1917] overflow-hidden font-sans">
      {/* Top Application Bar matching the theme screenshot */}
      <header className="h-14 bg-[#F4EFE6] px-5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#173F3D] flex items-center justify-center text-white shadow-sm">
            <Brain className="w-5 h-5 text-[#FAF7F2]" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base tracking-tight text-[#1C1917]">
              EduMind AI
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0]">
              LMS & CBT Engine
            </span>
          </div>
        </div>

        {/* Global Controls: Exam Prep & Login Button */}
        <div className="flex items-center gap-2.5">
          {/* Exam Prep Option */}
          <button
            type="button"
            onClick={() => setViewMode('examprep')}
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#DCD2C0] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer group"
            title="Open Exam Preparation Hub & Curated CBT Library"
          >
            <Target className="w-3.5 h-3.5 text-[#173F3D] group-hover:rotate-45 transition-transform" />
            <span>Exam Prep</span>
          </button>

          {/* Login / Profile Button */}
          <button
            type="button"
            onClick={() => {
              setLoginPromptMessage('');
              setIsLoginModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#DCD2C0] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in as candidate'}
          >
            <div className="w-5 h-5 rounded-full bg-[#173F3D] text-[#FAF7F2] flex items-center justify-center font-bold text-[10px]">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3 text-[#FAF7F2]" />}
            </div>
            <span className="max-w-[120px] truncate">{currentUser ? currentUser.name : 'Login'}</span>
          </button>
        </div>
      </header>

      {/* 3-Panel Floating Workspace Cards on Warm Cream Canvas */}
      <div className="flex-1 flex overflow-hidden px-3 pb-3 gap-2 bg-[#F4EFE6]">
        {/* Left Panel: Workspace List & History Just Above Sources & Notes */}
        <aside
          style={{ width: `${leftSidebarWidth}px` }}
          className="shrink-0 h-full rounded-2xl overflow-hidden bg-white border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] flex flex-col"
        >
          <SourcePanel
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            activeWorkspaceId={activeWorkspaceId}
            pinnedIds={pinnedIds}
            examHistoryCount={studioExamHistory.length}
            onSelectWorkspace={(id) => setActiveWorkspaceId(id)}
            onTogglePin={handleTogglePin}
            onUpdateWorkspaceName={handleUpdateWorkspaceName}
            onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
            onDeleteWorkspace={handleDeleteWorkspace}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
            sources={sources}
            selectedIds={selectedIds}
            loading={loadingSources}
            uploading={uploading}
            onUploadFiles={handleUploadFiles}
            onOpenNoteModal={() => setIsNoteModalOpen(true)}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onDeleteSource={handleDeleteSource}
            onPreviewSource={(src) => setPreviewSource(src)}
          />
        </aside>

        {/* Draggable Resize Handle between Left Sidebar and Main Content */}
        <ResizeHandle
          onResize={handleLeftSidebarResize}
          onReset={handleLeftSidebarReset}
          onDragStart={() => setIsResizing(true)}
          onDragEnd={handleLeftSidebarDragEnd}
        />

        {/* Center Panel: Central Chat Hub / Study Workspace */}
        <main
          className={`flex-1 h-full min-w-0 rounded-2xl overflow-hidden bg-white border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] flex flex-col ${
            isResizing ? 'transition-none pointer-events-none' : ''
          }`}
        >
          <ChatHub
            selectedSources={selectedSourcesList}
            allSources={sources}
            workspaceId={activeWorkspaceId}
            workspaceName={activeWorkspace.name}
            userId={currentUser?.id}
            onUpdateWorkspaceName={handleUpdateWorkspaceName}
            contentWidth={mainContentWidth}
            isResizing={isResizing}
          />
        </main>

        {/* Draggable Resize Handle between Main Content and Right AI Studio */}
        <ResizeHandle
          onResize={handleRightSidebarResize}
          onReset={handleRightSidebarReset}
          onDragStart={() => setIsResizing(true)}
          onDragEnd={handleRightSidebarDragEnd}
        />

        {/* Right Panel: The AI Studio & Recent Outputs */}
        <aside
          style={{ width: `${rightSidebarWidth}px` }}
          className="shrink-0 h-full rounded-2xl overflow-hidden bg-white border border-[#E6DFD3] shadow-[0_2px_12px_rgba(40,30,20,0.04)] flex flex-col"
        >
          <AIStudio
            currentUser={currentUser}
            selectedSources={selectedSourcesList}
            recentQuizzes={recentQuizzes}
            generating={generatingQuiz}
            onGenerateQuiz={handleGenerateQuiz}
            onLaunchExam={(quiz) => handleLaunchExam(quiz, 'studio')}
            onDeleteRecentQuiz={handleDeleteRecentQuiz}
            onRequireLogin={() => {
              setLoginPromptMessage('Please sign in or register to generate CBT assessments.');
              setIsLoginModalOpen(true);
            }}
          />
        </aside>
      </div>

      {/* Note Creation Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteCreated={handleCreateNote}
      />

      {/* Source Preview Modal */}
      <SourcePreviewModal
        source={previewSource}
        onClose={() => setPreviewSource(null)}
      />

      {/* Workspace Creation Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onCreated={handleCreateWorkspace}
      />

      {/* Exam History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={studioExamHistory}
        activeWorkspace={activeWorkspace}
        currentUser={currentUser}
        onReviewAttempt={handleReviewPastAttempt}
        onRetakeAttempt={handleRetakePastAttempt}
        onDeleteAttempt={handleDeletePastAttempt}
      />

      {/* Candidate Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginPromptMessage('');
        }}
        currentUser={currentUser}
        onLogin={(userData) => {
          handleLoginUser(userData);
          setLoginPromptMessage('');
        }}
        onLogout={handleLogoutUser}
        loginPromptMessage={loginPromptMessage}
      />
    </div>
  );
}
