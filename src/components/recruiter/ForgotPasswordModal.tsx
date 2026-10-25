import React, { useState } from 'react';
import { apiClient } from '../../services/api';
import { Mail, KeyRound, Lock, CheckCircle2, AlertTriangle, Loader2, X, ArrowRight } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoHint, setDemoHint] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.forgotPassword(email.trim());
      setDemoHint(res.demoOtpHint);
      setStep('reset');
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch password reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setStep('done');
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Password reset failed. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'request' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Enter your registered email to receive an OTP code</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="recruiter@synthetix.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-cyan-600/30"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Verification Code'}
              </button>
            </form>
          </div>
        )}

        {step === 'reset' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enter Verification Code</h3>
                <p className="text-xs text-slate-400">Code dispatched to <span className="text-cyan-300">{email}</span></p>
              </div>
            </div>

            {demoHint && (
              <div className="mb-4 p-3 rounded-xl border border-amber-900/50 bg-amber-950/30 text-xs text-amber-200">
                <div className="font-semibold text-amber-400 mb-0.5">Development OTP Notice:</div>
                <span>Your code is <strong className="font-mono text-white text-sm bg-amber-900/40 px-1.5 py-0.5 rounded">{demoHint}</strong> (configure Resend for inbox delivery).</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest font-mono text-base py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-cyan-600/30"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Password Updated</h3>
              <p className="text-xs text-slate-300 mt-1">Your password has been successfully reset. You can now log in with your new credentials.</p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
