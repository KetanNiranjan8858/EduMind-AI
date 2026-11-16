import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Server,
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';

import SourcePanel from './components/SourcePanel';
import ChatHub from './components/ChatHub';
import AIStudio from './components/AIStudio';
import NoteModal from './components/NoteModal';
import SourcePreviewModal from './components/SourcePreviewModal';
import ExamView from './components/ExamView';
import AnalyticsView from './components/AnalyticsView';

import {
  fetchSources,
  uploadFiles,
  createNote,
  deleteSource,
  generateQuiz,
  fetchHealth
} from './utils/api';

export default function App() {
  // Mode: 'studio' | 'exam' | 'analytics'
  const [viewMode, setViewMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'cbt' || urlParams.get('mode') === 'exam') {
      return 'exam';
    }
    return 'studio';
  });

  const [sources, setSources] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState(null);

  // Recent Quizzes in Studio (Persisted in localStorage)
  const [recentQuizzes, setRecentQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem('edumind_recent_quizzes');
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

  // Sync recentQuizzes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edumind_recent_quizzes', JSON.stringify(recentQuizzes));
    } catch {}
  }, [recentQuizzes]);

  // Load Initial Data
  useEffect(() => {
    loadSources();
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    const health = await fetchHealth();
    setServerHealth(health);
  }

  async function loadSources() {
    try {
      setLoadingSources(true);
      const res = await fetchSources();
      if (res.sources) {
        setSources(res.sources);
        // By default select all if none selected yet
        if (selectedIds.length === 0 && res.sources.length > 0) {
          setSelectedIds(res.sources.map((s) => s.id));
        }
      }
    } catch (err) {
      console.warn('Backend sources fetch failed:', err.message);
    } finally {
      setLoadingSources(false);
    }
  }

  async function handleUploadFiles(fileList) {
    try {
      setUploading(true);
      const res = await uploadFiles(fileList);
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
    const res = await createNote({ title, content });
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

  async function handleGenerateQuiz({ difficulty, questionCount, customTopic }) {
    try {
      setGeneratingQuiz(true);
      const res = await generateQuiz({
        sourceIds: selectedIds,
        difficulty,
        questionCount,
        customTopic
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

      // Attempt to open in brand new dedicated CBT tab
      const examUrl = `${window.location.origin}${window.location.pathname}?mode=cbt`;
      const newTab = window.open(examUrl, '_blank');

      // If browser blocked popup, smoothly transition in current tab
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

  function handleExamSubmit(submissionData) {
    try {
      localStorage.setItem('edumind_exam_results', JSON.stringify(submissionData));
    } catch {}
    setExamResultData(submissionData);
    setViewMode('analytics');
  }

  function handleReturnToStudio() {
    // If in standalone CBT tab, close or return to home
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

  // Sample quick test paper for instant evaluation
  function handleLaunchSamplePaper() {
    const sampleQuiz = {
      quizTitle: 'GATE CS: Computer Architecture & OS Paging Drill',
      difficulty: 'GATE Level',
      totalQuestions: 5,
      questions: [
        {
          id: 1,
          question: 'Consider a 4-way set-associative cache with 64 KB capacity and 32-byte block size on a 32-bit physical address machine. How many bits are required for the TAG field?',
          options: [
            'A. 18 bits',
            'B. 19 bits',
            'C. 20 bits',
            'D. 21 bits'
          ],
          correctAnswer: 'A',
          explanation: 'Number of lines = 64KB / 32B = 2048. Number of sets = 2048 / 4 = 512 = 2^9. Offset = log2(32) = 5 bits. Tag = 32 - 9 - 5 = 18 bits.'
        },
        {
          id: 2,
          question: 'In a virtual memory system using FIFO page replacement with 3 page frames, which of the following reference strings demonstrates Belady\'s Anomaly?',
          options: [
            'A. 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5',
            'B. 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2',
            'C. 1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6',
            'D. 2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2'
          ],
          correctAnswer: 'A',
          explanation: 'The reference string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 yields 9 page faults with 3 frames, but 10 page faults with 4 frames under FIFO.'
        },
        {
          id: 3,
          question: 'Which scheduling algorithm is strictly provably optimal for minimizing average waiting time for a given set of stationary processes?',
          options: [
            'A. First-Come, First-Served (FCFS)',
            'B. Round Robin with time quantum = 2ms',
            'C. Shortest Job First (SJF / SRTF)',
            'D. Highest Response Ratio Next (HRRN)'
          ],
          correctAnswer: 'C',
          explanation: 'Shortest Job First (SJF) is mathematically optimal because moving a shorter job ahead of a longer one decreases the waiting time of the shorter job more than it increases that of the longer one.'
        },
        {
          id: 4,
          question: 'In Peterson\'s solution for mutual exclusion between two processes P0 and P1, what prevents deadlock?',
          options: [
            'A. TestAndSet hardware instructions',
            'B. The turn variable guarantees that only one process can enter the critical section when both flag[0] and flag[1] are true',
            'C. Non-preemption of timer interrupts',
            'D. A semaphore initialized to 0'
          ],
          correctAnswer: 'B',
          explanation: 'The turn variable breaks symmetry. If both set their flag to true, turn will hold either 0 or 1, allowing exactly one process to bypass the while loop.'
        },
        {
          id: 5,
          question: 'What is the maximum number of inodes allocated in an ext2 filesystem with 4KB block size and a 16-bit block pointer depth?',
          options: [
            'A. Dynamically bounded by superblock metadata descriptor tables during mkfs',
            'B. Exactly 2^16 inodes per partition',
            'C. Unlimited using extent trees',
            'D. 1024 inodes per group descriptor block'
          ],
          correctAnswer: 'A',
          explanation: 'In ext2/ext3, the number of inodes is fixed at filesystem creation time (mkfs) based on the inode ratio in the superblock and cylinder group descriptors.'
        }
      ],
      generatedAt: new Date().toISOString()
    };

    handleLaunchExam(sampleQuiz);
  }

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
      {/* Top Application Bar */}
      <header className="h-14 bg-dark-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                EduMind <span className="text-brand-400">AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                LMS & CBT Engine
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          {/* Quick Test Demo Button */}
          <button
            onClick={handleLaunchSamplePaper}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-600/20 to-purple-600/20 hover:from-rose-600/40 hover:to-purple-600/40 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Try a 5-question GATE Level CBT paper immediately"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Try GATE CBT Exam</span>
          </button>

          {/* Backend Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                serverHealth?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {serverHealth?.status === 'healthy'
                ? `API Online ${serverHealth.geminiConfigured ? '(Gemini 2.5 Active)' : '(Demo Mode)'}`
                : 'Server Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* 3-Panel Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Central Workspace & Source Management (320px) */}
        <aside className="w-80 shrink-0 h-full">
          <SourcePanel
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
          <ChatHub selectedSources={selectedSourcesList} allSources={sources} />
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
    </div>
  );
}
