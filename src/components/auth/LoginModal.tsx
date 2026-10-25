/**
 * CareerSphere AI — Dedicated Role Authentication Portal
 * Separate, secure entry points for Candidates, Recruiters, and Administrators.
 * Enforces email OTP verification via Resend API.
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { User, UserRole } from '../../types';
import { Lock, Mail, AlertTriangle, Loader2, UserCheck, Briefcase, Shield, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { ForgotPasswordModal } from '../recruiter/ForgotPasswordModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToRegister: (role?: 'candidate' | 'recruiter') => void;
  onPromptOtp: (email: string, hint?: string, error?: string) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
  onPromptOtp,
  initialRole = 'candidate',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ isConfigured: boolean; fromEmail: string } | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
      // Pre-fill corresponding demo email based on chosen portal
      if (initialRole === 'candidate') {
        setEmail('candidate@careersphere.ai');
        setPassword('Password123!');
      } else if (initialRole === 'recruiter') {
        setEmail('recruiter@synthetix.com');
        setPassword('Password123!');
      } else {
        setEmail('admin@careersphere.ai');
        setPassword('Password123!');
      }

      apiClient.getResendStatus().then(setResendStatus).catch(() => null);
    }
  }, [isOpen, initialRole]);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'candidate') {
      setEmail('candidate@careersphere.ai');
      setPassword('Password123!');
    } else if (role === 'recruiter') {
      setEmail('recruiter@synthetix.com');
      setPassword('Password123!');
    } else {
      setEmail('admin@careersphere.ai');
      setPassword('Password123!');
    }
  };

  const handleLogin = async (e?: React.FormEvent, isQuickDemo = false) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.login(email.trim(), password, isQuickDemo);

      if (data.requiresOtp) {
        onClose();
        onPromptOtp(email.trim(), data.demoOtpHint, data.resendError);
      } else if (data.token && data.user) {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed.';
      if (msg.includes('not been verified')) {
        onClose();
        onPromptOtp(email.trim(), undefined);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = {
    candidate: {
      title: 'Candidate Sign In',
      subtitle: 'Analyze resumes with Gemini, match job descriptions, and trigger autonomous n8n multi-apply.',
      badgeColor: 'bg-indigo-950/80 border-indigo-700/60 text-indigo-300',
      themeBtn: 'bg-indigo-600 hover:bg-indigo-500',
      icon: <UserCheck className="h-4 w-4 text-indigo-400" />,
    },
    recruiter: {
      title: 'HR Recruiter Sign In',
      subtitle: 'Post job openings, review candidate match scores, and coordinate technical interviews.',
      badgeColor: 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300',
      themeBtn: 'bg-cyan-600 hover:bg-cyan-500',
      icon: <Briefcase className="h-4 w-4 text-cyan-400" />,
    },
    admin: {
      title: 'System Administrator Enclave',
      subtitle: 'Enterprise governance, user suspensions, recruiter verification, and security audit logs.',
      badgeColor: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
      themeBtn: 'bg-emerald-600 hover:bg-emerald-500',
      icon: <Shield className="h-4 w-4 text-emerald-400" />,
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Workspace Authentication"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-left">
        {/* Dedicated Role Selection Tabs */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Workspace Portal
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleTabChange('candidate')}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedRole === 'candidate'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className={`h-4 w-4 ${selectedRole === 'candidate' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span className="text-[11px]">Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('recruiter')}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedRole === 'recruiter'
                  ? 'bg-cyan-950/60 border-cyan-500 text-white font-semibold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className={`h-4 w-4 ${selectedRole === 'recruiter' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[11px]">HR Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className={`h-4 w-4 ${selectedRole === 'admin' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px]">Admin Hub</span>
            </button>
          </div>
        </div>

        {/* Role Portal Details Banner */}
        <div className={`p-3 rounded-xl border ${roleMeta[selectedRole].badgeColor} flex items-start gap-2.5 text-xs`}>
          <div className="shrink-0 mt-0.5">{roleMeta[selectedRole].icon}</div>
          <div className="space-y-0.5">
            <div className="font-semibold text-white">{roleMeta[selectedRole].title}</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {roleMeta[selectedRole].subtitle}
            </p>
          </div>
        </div>

        {/* Resend Email Delivery Status Banner */}
        <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/70 text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>Email OTP Delivery:</span>
            {resendStatus?.isConfigured ? (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Resend API Active
              </span>
            ) : (
              <span className="text-amber-400 font-medium">Ready for RESEND_API_KEY</span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400">6-digit Code Required</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e, false)} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              {selectedRole === 'recruiter' ? 'Company Work Email' : selectedRole === 'admin' ? 'Security Admin Email' : 'Candidate Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-medium">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold text-white ${roleMeta[selectedRole].themeBtn} disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer`}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{loading ? 'Verifying...' : `Sign In & Dispatch OTP`}</span>
            </button>

            <button
              type="button"
              onClick={() => handleLogin(undefined, true)}
              title="Quick demo access with instant token"
              className="py-2.5 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              1-Click Demo
            </button>
          </div>
        </form>

        <div className="pt-3 text-center text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between">
          <span>Need a new account?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister(selectedRole === 'recruiter' ? 'recruiter' : 'candidate');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Create {selectedRole === 'recruiter' ? 'Recruiter' : 'Candidate'} Account
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        defaultEmail={email}
      />
    </Modal>
  );
};
