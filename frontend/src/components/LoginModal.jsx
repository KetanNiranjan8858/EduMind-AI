import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Hash,
  Award,
  CheckCircle2,
  LogOut,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react';
import {
  authSignup,
  authLogin,
  authGoogleLogin,
  authForgotPassword,
  authVerifyOtp,
  authResetPassword
} from '../utils/api';

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  // Tab state: 'signin' | 'signup'
  const [authTab, setAuthTab] = useState('signin');
  // Sub-view: whether forgot password flow is active
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Common form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [targetExam, setTargetExam] = useState('GATE CS / IT');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation & alerts
  const [emailError, setEmailError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password wizard state
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP & new pass, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [previewOtp, setPreviewOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset errors when switching tabs or views
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setEmailError('');
  }, [authTab, isForgotPassword]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  function validateGmail(val) {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      setEmailError('Gmail address is required.');
      return false;
    }
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
    if (val.trim()) validateGmail(val);
    else setEmailError('');
  }

  // Handle Local Sign In
  async function handleSignInSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateGmail(email)) return;
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await authLogin({ email: email.trim(), password });
      if (res.user) {
        onLogin(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Sign Up
  async function handleSignUpSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!validateGmail(email)) return;
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authSignup({
        name: name.trim(),
        email: email.trim(),
        password,
        candidateId: candidateId.trim(),
        targetExam
      });
      if (res.user) {
        onLogin(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Google Login / Sign Up
  async function handleGoogleAuth() {
    setErrorMessage('');
    setSuccessMessage('');

    let googleEmail = email.trim();
    if (!googleEmail || !validateGmail(googleEmail)) {
      const prompted = window.prompt(
        'Enter your Gmail address to sign in with Google:',
        email.trim() || 'candidate@gmail.com'
      );
      if (!prompted) return;
      if (!validateGmail(prompted)) {
        alert('Please enter a valid @gmail.com address.');
        return;
      }
      googleEmail = prompted.trim();
      setEmail(googleEmail);
    }

    try {
      setLoading(true);
      const res = await authGoogleLogin({
        email: googleEmail,
        name: name.trim() || googleEmail.split('@')[0],
        candidateId: candidateId.trim(),
        targetExam
      });
      if (res.user) {
        onLogin(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  // Forgot Password Step 1: Request OTP
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetEmail = (forgotEmail || email).trim();
    if (!targetEmail || !validateGmail(targetEmail)) {
      setErrorMessage('Please enter a valid registered Gmail address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authForgotPassword({ email: targetEmail });
      setSuccessMessage(res.message);
      if (res.previewOtp) {
        setPreviewOtp(res.previewOtp);
      }
      setForgotEmail(targetEmail);
      setForgotStep(2);
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err.message || 'Could not send verification OTP.');
    } finally {
      setLoading(false);
    }
  }

  // Forgot Password Step 2: Verify OTP & Reset Password
  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp.trim()) {
      setErrorMessage('6-digit OTP code is required.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authResetPassword({
        email: forgotEmail,
        otp: otp.trim(),
        newPassword
      });
      setSuccessMessage(res.message);
      setForgotStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  }

  // Reset back to signin view
  function handleBackToSignIn() {
    setIsForgotPassword(false);
    setForgotStep(1);
    setAuthTab('signin');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPreviewOtp('');
    setErrorMessage('');
    setSuccessMessage('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-dark-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
              {currentUser ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : isForgotPassword ? (
                <KeyRound className="w-5 h-5 text-amber-400" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {currentUser
                  ? 'Candidate Profile'
                  : isForgotPassword
                  ? 'Forgot & Reset Password'
                  : authTab === 'signin'
                  ? 'Candidate Sign In'
                  : 'Create Candidate Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? 'Manage your credentials and preparation track'
                  : isForgotPassword
                  ? 'Verify with 6-digit OTP sent to your registered Gmail'
                  : 'Grounded Computer-Based Testing & Study Workspace'}
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

        {/* ============================================================ */}
        {/* VIEW 1: CURRENT USER PROFILE (When Logged In) */}
        {/* ============================================================ */}
        {currentUser ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Candidate Name:</span>
                <strong className="text-white font-medium">{currentUser.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verified Gmail:</span>
                <span className="text-slate-200 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {currentUser.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Roll / Candidate ID:</span>
                <span className="text-brand-300 font-mono font-bold">{currentUser.candidateId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Track:</span>
                <span className="text-cyan-400 font-semibold">{currentUser.targetExam || 'GATE CS / IT'}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Sign-In Method:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {currentUser.authProvider === 'google' ? 'Google Account' : 'Gmail & Password'}
                </span>
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
        ) : isForgotPassword ? (
          /* ============================================================ */
          /* VIEW 2: FORGOT PASSWORD 3-STEP WIZARD */
          /* ============================================================ */
          <div className="p-6 space-y-4">
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Global Success Banner */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* STEP 1: Enter Registered Gmail */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered Gmail address below. We will send a secure <strong>6-digit OTP verification code</strong> to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Registered Gmail Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={forgotEmail || email}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setEmail(e.target.value);
                      }}
                      placeholder="e.g. yourname@gmail.com"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !(forgotEmail || email).trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    <span>Send 6-Digit OTP</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-digit OTP & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Code sent to:</span>
                    <strong className="text-white font-mono">{forgotEmail}</strong>
                  </div>
                  {previewOtp && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-amber-400 flex items-center gap-1">
                        <span>🔑 Quick OTP:</span>
                        <code className="font-mono font-bold text-white bg-dark-850 px-1.5 py-0.5 rounded border border-amber-400/40">
                          {previewOtp}
                        </code>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(previewOtp)}
                        className="text-[11px] text-brand-300 hover:underline"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>6-Digit Verification OTP <span className="text-rose-400">*</span></span>
                    {resendCooldown > 0 ? (
                      <span className="text-[11px] text-slate-500 font-mono">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] text-brand-400 hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 749201"
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-sm font-mono tracking-widest transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    New Password (min 6 chars) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6 || !newPassword}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Reset Password</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Password Reset Success */}
            {forgotStep === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Password Reset Complete!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20"
                >
                  Sign In with New Password
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW 3: SIGN IN / SIGN UP TABS */
          /* ============================================================ */
          <div className="flex flex-col">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-dark-950/70 border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthTab('signin')}
                className={`py-2 text-center rounded-xl transition-all ${
                  authTab === 'signin'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                className={`py-2 text-center rounded-xl transition-all ${
                  authTab === 'signup'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up (Create Account)
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* TAB A: SIGN IN FORM */}
              {authTab === 'signin' && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {/* Gmail Field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Gmail Address <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-brand-300 font-mono">@gmail.com</span>
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${emailError ? 'text-rose-400' : 'text-slate-500'}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="e.g. ketan@gmail.com"
                        required
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-dark-950 border text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs transition-colors ${
                          emailError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-brand-500'
                        }`}
                        autoFocus
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Password <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotEmail(email);
                        }}
                        className="text-[11px] text-brand-400 hover:text-brand-300 hover:underline transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password || Boolean(emailError)}
                    className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Sign In as Candidate</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-dark-900 px-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      OR
                    </span>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full py-2.5 bg-dark-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    {/* Official Google G Logo SVG */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              )}

              {/* TAB B: SIGN UP (CREATE ACCOUNT) FORM */}
              {authTab === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
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
                        className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Gmail Address */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                      <span>Gmail Address <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-brand-300 font-mono">@gmail.com</span>
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3.5 top-3 transition-colors ${emailError ? 'text-rose-400' : 'text-slate-500'}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="e.g. ketan@gmail.com"
                        required
                        className={`w-full pl-10 pr-3.5 py-2 rounded-xl bg-dark-950 border text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs transition-colors ${
                          emailError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-brand-500'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  {/* Password & Confirm Password side by side */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="min 6 chars"
                          required
                          minLength={6}
                          className="w-full pl-8 pr-7 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Confirm <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="repeat"
                          required
                          minLength={6}
                          className={`w-full pl-8 pr-7 py-2 rounded-xl bg-dark-950 border text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs transition-colors ${
                            confirmPassword && confirmPassword !== password
                              ? 'border-rose-500'
                              : 'border-slate-800 focus:border-brand-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Roll ID & Target Exam */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Candidate Roll ID
                      </label>
                      <div className="relative">
                        <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={candidateId}
                          onChange={(e) => setCandidateId(e.target.value)}
                          placeholder="Auto-assigned"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs font-mono transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Target Exam
                      </label>
                      <div className="relative">
                        <Award className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                        <select
                          value={targetExam}
                          onChange={(e) => setTargetExam(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-brand-500 text-xs transition-colors"
                        >
                          <option value="GATE CS / IT">GATE CS / IT</option>
                          <option value="TCS NQT Prep">TCS NQT</option>
                          <option value="University Semester">Semester Finals</option>
                          <option value="Campus Placement">Placements</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sign Up Submit */}
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !name.trim() ||
                      !email.trim() ||
                      password.length < 6 ||
                      password !== confirmPassword ||
                      Boolean(emailError)
                    }
                    className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Create Account & Sign In</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-2 flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-dark-900 px-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      OR
                    </span>
                  </div>

                  {/* Sign Up with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full py-2 bg-dark-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
