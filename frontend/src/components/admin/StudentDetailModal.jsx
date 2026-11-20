import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Award,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';
import { fetchStudentPerformance, updateAdminStudent, deleteAdminStudent } from '../../utils/api';
import { formatTime } from '../../utils/helpers';

export default function StudentDetailModal({
  isOpen,
  onClose,
  studentId,
  onStudentUpdated,
  onStudentDeleted
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCandidateId, setEditCandidateId] = useState('');
  const [editTargetExam, setEditTargetExam] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !studentId) return;
    loadPerformance();
  }, [isOpen, studentId]);

  async function loadPerformance() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchStudentPerformance(studentId);
      setData(res);
      setEditName(res.student?.name || '');
      setEditCandidateId(res.student?.candidateId || '');
      setEditTargetExam(res.student?.targetExam || 'GATE CS / IT');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load student performance.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminStudent(studentId, {
        name: editName,
        candidateId: editCandidateId,
        targetExam: editTargetExam
      });
      setIsEditing(false);
      loadPerformance();
      if (onStudentUpdated) onStudentUpdated();
    } catch (err) {
      alert('Failed to update student profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to permanently delete candidate "${data?.student?.name}" and all associated tests?`)) {
      return;
    }
    try {
      await deleteAdminStudent(studentId);
      if (onStudentDeleted) onStudentDeleted(studentId);
      onClose();
    } catch (err) {
      alert('Failed to delete student: ' + err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-extrabold text-sm">
              {data?.student?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {data?.student?.name || 'Student Details'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {data?.student?.candidateId || 'ID: Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{data?.student?.email}</span>
                <span>•</span>
                <span>Target: {data?.student?.targetExam || 'GATE CS / IT'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Edit Student Info"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              title="Delete Student"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
              <span className="text-xs font-semibold">Loading student performance...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          ) : (
            <>
              {/* Optional Inline Edit Form */}
              {isEditing && (
                <form
                  onSubmit={handleSaveProfile}
                  className="p-4 rounded-2xl bg-dark-950 border border-slate-800 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Edit Student Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                        Candidate ID
                      </label>
                      <input
                        type="text"
                        value={editCandidateId}
                        onChange={(e) => setEditCandidateId(e.target.value)}
                        className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                        Target Exam
                      </label>
                      <input
                        type="text"
                        value={editTargetExam}
                        onChange={(e) => setEditTargetExam(e.target.value)}
                        className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-dark-900 text-slate-400 hover:text-white rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Tests Attempted</span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {data.summary.totalTests}
                  </div>
                  <span className="text-[10px] text-slate-500">CBT Mock Runs</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Questions Attempted</span>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {data.summary.totalAttempted}
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    {data.summary.totalCorrect} Correct
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Average Accuracy</span>
                  <div className="text-xl font-extrabold text-brand-400 mt-1">
                    {data.summary.avgAccuracy}%
                  </div>
                  <span className="text-[10px] text-slate-500">Across All Attempts</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Total Time Spent</span>
                  <div className="text-xl font-extrabold text-rose-400 mt-1">
                    {formatTime(data.summary.totalTimeSpent)}
                  </div>
                  <span className="text-[10px] text-slate-500">Exam Engine Timer</span>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-400" />
                  <span>Subject Performance Breakdown</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {data.subjectBreakdown.map((sub) => (
                    <div
                      key={sub.subjectId}
                      className="p-3 rounded-2xl bg-dark-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-200 truncate">
                            {sub.subjectName}
                          </span>
                          <span className="font-mono font-bold text-slate-300">
                            {sub.accuracy}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sub.accuracy >= 70
                                ? 'bg-emerald-500'
                                : sub.accuracy >= 40
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(5, sub.accuracy)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                        <span>{sub.correctQuestions}/{sub.attemptedQuestions} Qs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Attempt History Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Past CBT Exam Runs ({data.attempts.length})</span>
                </h4>

                {data.attempts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-2xl bg-dark-950 text-xs">
                    No CBT assessments attempted yet by this candidate.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-dark-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-dark-850/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Test Title</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Accuracy</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Time</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {data.attempts.map((att) => (
                          <tr key={att.id} className="hover:bg-dark-900/60">
                            <td className="p-3 font-semibold text-white">
                              {att.quizTitle}
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                  att.category === 'examprep'
                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                    : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                                }`}
                              >
                                {att.category === 'examprep' ? 'Exam Prep' : 'Studio'}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-brand-400">
                              {att.accuracyPercentage}%
                            </td>
                            <td className="p-3 font-mono">
                              {att.correctCount}/{att.totalQuestions}
                            </td>
                            <td className="p-3 font-mono text-slate-400">
                              {formatTime(att.timeTakenSeconds)}
                            </td>
                            <td className="p-3 text-[11px] text-slate-500">
                              {new Date(att.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
