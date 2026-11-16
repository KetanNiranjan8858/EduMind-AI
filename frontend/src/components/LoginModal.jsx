import React, { useState } from 'react';
import { X, User, Mail, Hash, Award, CheckCircle2, LogOut, ArrowRight } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [candidateId, setCandidateId] = useState(currentUser?.candidateId || '');
  const [targetExam, setTargetExam] = useState(currentUser?.targetExam || 'GATE CS 2026');

  // Gmail Validation State
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  if (!isOpen) return null;

  function validateGmail(val) {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      setEmailError('Gmail address is required.');
      return false;
    }
    // Basic email format check
    const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormatRegex.test(trimmed)) {
      setEmailError('Please enter a valid email format (e.g. username@gmail.com).');
      return false;
    }
    // Specific Gmail check (@gmail.com or @googlemail.com)
    const isGmail = /^[a-zA-Z0-9._%+-]+@(gmail|googlemail)\.com$/i.test(trimmed);
    if (!isGmail) {
      setEmailError('Only valid Gmail addresses (@gmail.com) are allowed.');
      return false;
    }
    setEmailError('');
    return true;
  }

  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) {
      validateGmail(val);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setEmailTouched(true);

    if (!name.trim()) return;

    const isEmailValid = validateGmail(email);
    if (!isEmailValid) return;

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      candidateId: candidateId.trim() || `EDU-${Math.floor(100000 + Math.random() * 900000)}`,
      targetExam: targetExam.trim() || 'GATE CS 2026',
      loggedInAt: new Date().toISOString()
    };

    onLogin(userData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {currentUser ? 'Candidate Profile' : 'Student & Candidate Login'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser ? 'Manage your credentials and exam roll ID' : 'Sign in to sync exam history and CBT certificates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentUser ? (
          /* Profile Details when logged in */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Candidate Name:</span>
                <strong className="text-white font-medium">{currentUser.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300 font-mono">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Candidate Roll No:</span>
                <span className="text-brand-300 font-mono font-bold">{currentUser.candidateId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Preparation:</span>
                <span className="text-emerald-400 font-semibold">{currentUser.targetExam}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ketan Verma"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>
                  Gmail Address <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-brand-300 font-mono">@gmail.com</span>
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${
                  emailError ? 'text-rose-400' : 'text-slate-500'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    setEmailTouched(true);
                    validateGmail(email);
                  }}
                  placeholder="e.g. ketan@gmail.com"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs transition-colors ${
                    emailError
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-slate-800 focus:border-brand-500'
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1 animate-in fade-in duration-150">
                  <span>⚠️</span>
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Candidate Roll / Student ID
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="e.g. 2026-GATE-091"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Examination
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                >
                  <option value="GATE CS / IT">GATE Computer Science / IT</option>
                  <option value="TCS NQT & National Qualifier">TCS NQT & National Qualifier</option>
                  <option value="University Semester Finals">University Semester Finals</option>
                  <option value="Campus Placement Drives">Campus Placement Technical Rounds</option>
                  <option value="Custom Competitive Drill">Custom Competitive Drill</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || !email.trim() || Boolean(emailError)}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Sign In as Candidate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
