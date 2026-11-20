import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Award,
  Target,
  Clock,
  Eye,
  Trash2,
  Edit,
  Loader2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import { fetchAdminStudents, deleteAdminStudent } from '../../utils/api';
import StudentDetailModal from './StudentDetailModal';

export default function AdminStudentManager() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalExamsConducted: 0,
    systemAvgAccuracy: 0,
    totalQuestionsInBank: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const res = await fetchAdminStudents();
      setStudents(res.students || []);
      setMetrics(res.metrics || {});
    } catch (err) {
      console.warn('Failed to load students:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.candidateId?.toLowerCase().includes(q) ||
        s.targetExam?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  async function handleDeleteStudent(id, name, e) {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete candidate "${name}" and all their test history permanently?`)) return;
    try {
      await deleteAdminStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete student: ' + err.message);
    }
  }

  function handleOpenStudent(id) {
    setSelectedStudentId(id);
    setIsDetailOpen(true);
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-dark-950 overflow-y-auto p-6 space-y-6">
      {/* Overview Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Candidates</span>
            <div className="text-2xl font-black text-white mt-1">
              {metrics.totalStudents}
            </div>
            <span className="text-[10px] text-slate-500">Registered Student Accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">CBT Tests Attempted</span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {metrics.totalExamsConducted}
            </div>
            <span className="text-[10px] text-slate-500">Simulations Executed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">System Accuracy</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {metrics.systemAvgAccuracy}%
            </div>
            <span className="text-[10px] text-slate-500">Overall Success Rate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Exam Prep Questions</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {metrics.totalQuestionsInBank}
            </div>
            <span className="text-[10px] text-slate-500">Managed in Database</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search students by name, Gmail, candidate ID, target exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>{filteredStudents.length} Students Listed</span>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="border border-slate-800 rounded-2xl bg-dark-900 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
            <span className="text-xs font-semibold">Loading student directory...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No students found matching "{searchQuery}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-850/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Student / Candidate</th>
                  <th className="p-3.5">Candidate ID</th>
                  <th className="p-3.5">Target Exam</th>
                  <th className="p-3.5">Tests Taken</th>
                  <th className="p-3.5">Accuracy</th>
                  <th className="p-3.5">Overall %</th>
                  <th className="p-3.5">Last Active</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleOpenStudent(student.id)}
                    className="hover:bg-dark-850/70 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-brand-300 transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-brand-400 font-semibold">
                      {student.candidateId}
                    </td>

                    <td className="p-3.5 text-slate-300">
                      {student.targetExam}
                    </td>

                    <td className="p-3.5 font-mono font-bold">
                      {student.stats?.totalTests || 0}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span
                        className={`font-bold ${
                          (student.stats?.accuracy || 0) >= 70
                            ? 'text-emerald-400'
                            : (student.stats?.accuracy || 0) >= 40
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {student.stats?.accuracy || 0}%
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-400">
                      {student.stats?.overallPercentage || 0}%
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                      {student.stats?.lastActive
                        ? new Date(student.stats.lastActive).toLocaleDateString()
                        : 'Never'}
                    </td>

                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenStudent(student.id)}
                          className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Drilldown</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteStudent(student.id, student.name, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drill-down Detail Modal */}
      <StudentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        studentId={selectedStudentId}
        onStudentUpdated={loadStudents}
        onStudentDeleted={loadStudents}
      />
    </div>
  );
}
