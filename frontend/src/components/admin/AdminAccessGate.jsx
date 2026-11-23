import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { verifyAdminPasscode, authLogin } from '../../utils/api';

export default function AdminAccessGate({
  currentUser,
  onAdminVerified,
  onReturnToPrep,
  onReturnToStudio
}) {
  const [authMethod, setAuthMethod] = useState('passcode'); // 'passcode' | 'account'
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReturn = onReturnToPrep || onReturnToStudio;
  const returnLabel = onReturnToPrep ? 'Return to Exam Prep' : 'Return to Study Studio';

  async function handleVerifyPasscode(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passcode.trim()) {
      setError('Please enter the administrator access passcode.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyAdminPasscode({ passcode: passcode.trim() });
      if (res.success) {
        setSuccess('Administrator access confirmed! Launching portal...');
        const elevatedUser = currentUser
          ? { ...currentUser, role: 'admin' }
          : {
              id: 'usr_admin',
              name: 'Institutional Administrator',
              email: 'admin@edumind.ai',
              candidateId: 'ADMIN-01',
              role: 'admin'
            };
        localStorage.setItem('edumind_user', JSON.stringify(elevatedUser));
        setTimeout(() => {
          onAdminVerified(elevatedUser);
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator passcode.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAccount(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await authLogin({ email: email.trim(), password });
      if (res.user) {
        if (res.user.role === 'admin' || res.user.email === 'ketanniranjan996@gmail.com') {
          const elevated = { ...res.user, role: 'admin' };
          localStorage.setItem('edumind_user', JSON.stringify(elevated));
          setSuccess('Administrator account verified! Launching portal...');
          setTimeout(() => {
            onAdminVerified(elevated);
          }, 600);
        } else {
          setError('This account does not have administrative privileges.');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen bg-[#F4EFE6] flex flex-col items-center justify-center p-6 text-[#1C1917] select-none font-sans relative overflow-hidden">
      {/* Subtle organic ambient glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#173F3D]/5 blur-[120px] pointer-events-none -top-40 -right-40" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#DCD2C0]/30 blur-[120px] pointer-events-none -bottom-40 -left-40" />

      {/* Main Lock Card */}
      <div className="w-full max-w-md bg-white border border-[#E6DFD3] rounded-3xl p-8 shadow-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Shield Icon & Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] border border-[#DCD2C0] flex items-center justify-center mb-4 text-[#173F3D] shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#E8DFCF] text-[#173F3D] border border-[#DCD2C0] mb-2">
            Restricted Staff Area
          </span>

          <h1 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
            Admin Access Required
          </h1>
          <p className="text-xs text-[#78716C] mt-1 max-w-xs leading-relaxed">
            Authorized access only. Manage questions and generate CBT mock tests for the Exam Preparation Dashboard.
          </p>
        </div>

        {/* Auth method tab switch */}
        <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#E6DFD3] mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('passcode');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMethod === 'passcode'
                ? 'bg-[#173F3D] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Passcode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('account');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMethod === 'account'
                ? 'bg-[#173F3D] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Method 1: Passcode Form */}
        {authMethod === 'passcode' ? (
          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] uppercase tracking-wider mb-1.5">
                Admin Security Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. admin123)..."
                  autoFocus
                  className="w-full bg-[#FAF7F2] border border-[#DCD2C0] focus:border-[#173F3D] rounded-xl px-4 py-2.5 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate as Admin</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Method 2: Account Login Form */
          <form onSubmit={handleVerifyAccount} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edumind.ai"
                className="w-full bg-[#FAF7F2] border border-[#DCD2C0] focus:border-[#173F3D] rounded-xl px-3.5 py-2 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF7F2] border border-[#DCD2C0] focus:border-[#173F3D] rounded-xl px-3.5 py-2 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Back / Return Link */}
        {handleReturn && (
          <div className="mt-6 pt-4 border-t border-[#E6DFD3] text-center">
            <button
              type="button"
              onClick={handleReturn}
              className="text-xs text-[#78716C] hover:text-[#173F3D] flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{returnLabel}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
