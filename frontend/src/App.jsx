import React, { useState, useEffect } from 'react';
import {
  Brain,
  Layers,
  History,
  Target,
  User,
  Sparkles
} from 'lucide-react';

import SourcePanel from './components/SourcePanel';
import ChatHub from './components/ChatHub';
import AIStudio from './components/AIStudio';
import NoteModal from './components/NoteModal';
import SourcePreviewModal from './components/SourcePreviewModal';
import WorkspaceModal from './components/WorkspaceModal';
import HistoryModal from './components/HistoryModal';
import LoginModal from './components/LoginModal';
import ExamPrepModal from './components/ExamPrepModal';
import ExamView from './components/ExamView';
import AnalyticsView from './components/AnalyticsView';

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
  // Mode: 'studio' | 'exam' | 'analytics'
  const [viewMode, setViewMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
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
  const [isExamPrepModalOpen, setIsExamPrepModalOpen] = useState(false);

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

  // Active Workspace Data
  const [sources, setSources] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [examHistory, setExamHistory] = useState([]);

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState(null);

  // Recent Quizzes in Studio (Persisted per workspace in localStorage)
  const [recentQuizzes, setRecentQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem(`edumind_recent_quizzes_${activeWorkspaceId}`);
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

  // Load Workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // When activeWorkspaceId changes, load sources and history
  useEffect(() => {
    localStorage.setItem('edumind_active_workspace_id', activeWorkspaceId);
    loadWorkspaceData(activeWorkspaceId);

    // Restore recent quizzes for this workspace
    try {
      const saved = localStorage.getItem(`edumind_recent_quizzes_${activeWorkspaceId}`);
      setRecentQuizzes(saved ? JSON.parse(saved) : []);
    } catch {
      setRecentQuizzes([]);
    }
  }, [activeWorkspaceId]);

  // Sync recentQuizzes to workspace key
  useEffect(() => {
    try {
      localStorage.setItem(`edumind_recent_quizzes_${activeWorkspaceId}`, JSON.stringify(recentQuizzes));
    } catch {}
  }, [recentQuizzes, activeWorkspaceId]);

  async function loadWorkspaces() {
    try {
      const res = await fetchWorkspaces();
      if (res.workspaces && res.workspaces.length > 0) {
        setWorkspaces(res.workspaces);
        if (!res.workspaces.some(w => w.id === activeWorkspaceId)) {
          setActiveWorkspaceId(res.workspaces[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load workspaces:', err.message);
    }
  }

  async function loadWorkspaceData(wsId) {
    try {
      setLoadingSources(true);
      const [srcRes, histRes] = await Promise.all([
        fetchSources(wsId),
        fetchExamHistory(wsId).catch(() => ({ history: [] }))
      ]);

      if (srcRes.sources) {
        setSources(srcRes.sources);
        setSelectedIds(srcRes.sources.map(s => s.id));
      } else {
        setSources([]);
        setSelectedIds([]);
      }

      if (histRes.history) {
        setExamHistory(histRes.history);
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
    const res = await createWorkspace(data);
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
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      if (activeWorkspaceId === id) {
        setActiveWorkspaceId('ws_default');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete workspace');
    }
  }

  async function handleUploadFiles(fileList) {
    try {
      setUploading(true);
      const res = await uploadFiles(fileList, activeWorkspaceId);
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
    const res = await createNote({ title, content, workspaceId: activeWorkspaceId });
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
    try {
      setGeneratingQuiz(true);
      const res = await generateQuiz({
        sourceIds: selectedIds,
        difficulty,
        questionCount,
        workspaceId: activeWorkspaceId
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

  // Cross-Tab Handoff: Save quiz to localStorage and spawn CBT exam in new tab
  function handleLaunchExam(quiz) {
    try {
      localStorage.setItem('edumind_active_exam', JSON.stringify(quiz));
      setActiveQuiz(quiz);

      // Attempt to open in dedicated tab
      const examUrl = `${window.location.origin}${window.location.pathname}?mode=cbt`;
      const newTab = window.open(examUrl, '_blank');

      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        setViewMode('exam');
      }
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

    // Persist attempt in DB history
    try {
      await saveExamAttempt({
        workspaceId: activeWorkspaceId,
        quiz: submissionData.quiz,
        userAnswers: submissionData.userAnswers,
        questionTimes: submissionData.questionTimes,
        timeTakenSeconds: submissionData.timeTakenSeconds,
        stats
      });
      const histRes = await fetchExamHistory(activeWorkspaceId);
      if (histRes.history) setExamHistory(histRes.history);
    } catch (err) {
      console.warn('Failed to persist exam attempt to DB:', err);
    }

    setExamResultData(submissionData);
    setViewMode('analytics');
  }

  function handleReturnToStudio() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'cbt') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setViewMode('studio');
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
    setActiveQuiz(attempt.quiz);
    handleLaunchExam(attempt.quiz);
  }

  async function handleDeletePastAttempt(id) {
    if (!window.confirm('Delete this exam attempt record?')) return;
    try {
      await deleteExamAttempt(id);
      setExamHistory(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete attempt: ' + err.message);
    }
  }

  function handleLoginUser(userData) {
    setCurrentUser(userData);
    localStorage.setItem('edumind_user', JSON.stringify(userData));
  }

  function handleLogoutUser() {
    setCurrentUser(null);
    localStorage.removeItem('edumind_user');
  }

  async function handleSelectPrepTrack(track) {
    // Check if track workspace exists or create one
    const existing = workspaces.find(w => w.name.toLowerCase().includes(track.id));
    if (existing) {
      setActiveWorkspaceId(existing.id);
    } else {
      await handleCreateWorkspace({
        name: track.title,
        description: track.description,
        color: track.id === 'gate' ? 'rose' : track.id === 'tcs' ? 'cyan' : 'emerald',
        icon: 'book'
      });
    }
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

  const selectedSourcesList = sources.filter((s) => selectedIds.includes(s.id));

  // Route 3: Central Studio (3-Panel Layout)
  return (
    <div className="h-screen flex flex-col bg-dark-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar: Clean branding + Exam Prep & Login Button */}
      <header className="h-14 bg-dark-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">
              EduMind <span className="text-brand-400">AI</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
              LMS & CBT Engine
            </span>
          </div>
        </div>

        {/* Global Controls: Exam Prep & Login Button */}
        <div className="flex items-center gap-3">
          {/* Exam Prep Option */}
          <button
            type="button"
            onClick={() => setIsExamPrepModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-500/15 to-purple-500/15 hover:from-rose-500/25 hover:to-purple-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Open Exam Preparation Tracks & Benchmarks"
          >
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span>Exam Prep</span>
          </button>

          {/* Login / Profile Button */}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3 py-1.5 bg-dark-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
            title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in as candidate'}
          >
            <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px]">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <span className="max-w-[120px] truncate">{currentUser ? currentUser.name : 'Login'}</span>
          </button>
        </div>
      </header>

      {/* 3-Panel Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Workspace List & History Just Above Sources & Notes */}
        <aside className="w-80 shrink-0 h-full">
          <SourcePanel
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            activeWorkspaceId={activeWorkspaceId}
            pinnedIds={pinnedIds}
            examHistoryCount={examHistory.length}
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

        {/* Center Panel: Central Chat Hub / Study Workspace */}
        <main className="flex-1 h-full min-w-0">
          <ChatHub
            selectedSources={selectedSourcesList}
            allSources={sources}
            workspaceId={activeWorkspaceId}
            workspaceName={activeWorkspace.name}
          />
        </main>

        {/* Right Panel: The AI Studio & Recent Outputs (340px) */}
        <aside className="w-88 shrink-0 h-full">
          <AIStudio
            selectedSources={selectedSourcesList}
            recentQuizzes={recentQuizzes}
            generating={generatingQuiz}
            onGenerateQuiz={handleGenerateQuiz}
            onLaunchExam={handleLaunchExam}
            onDeleteRecentQuiz={handleDeleteRecentQuiz}
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
        history={examHistory}
        activeWorkspace={activeWorkspace}
        onReviewAttempt={handleReviewPastAttempt}
        onRetakeAttempt={handleRetakePastAttempt}
        onDeleteAttempt={handleDeletePastAttempt}
      />

      {/* Candidate Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginUser}
        onLogout={handleLogoutUser}
      />

      {/* Exam Prep Modal */}
      <ExamPrepModal
        isOpen={isExamPrepModalOpen}
        onClose={() => setIsExamPrepModalOpen(false)}
        onSelectTrack={handleSelectPrepTrack}
      />
    </div>
  );
}
