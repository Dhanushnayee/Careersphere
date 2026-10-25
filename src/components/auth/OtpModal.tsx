/**
 * CareerSphere AI — Email OTP Verification Modal
 * Validates 6-digit one-time password to complete authentication.
 * Integrated with Resend API email delivery service.
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { User } from '../../types';
import { KeyRound, CheckCircle2, AlertTriangle, Loader2, RefreshCw, Mail, ShieldCheck } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  demoHint?: string;
  resendError?: string;
  onSuccess: (user: User) => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  email,
  demoHint,
  resendError,
  onSuccess,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ isConfigured: boolean; fromEmail: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setError(null);
      setResendNotice(null);
      apiClient.getResendStatus().then(setResendStatus).catch(() => null);
    }
  }, [isOpen]);

  const submitVerification = async (code: string) => {
    if (!code || code.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.verifyOtp(email, code.trim());
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired OTP code. Please check the code sent to your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError(null);
    if (digits.length === 6 && !loading) {
      submitVerification(digits);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    await submitVerification(otp);
  };

  const handleResend = async () => {
    try {
      const res = await apiClient.resendOtp(email);
      setResendNotice(`New OTP dispatched! ${res.resendConfigured ? 'Check your inbox.' : `Code: ${res.demoOtpHint}`}`);
      setTimeout(() => setResendNotice(null), 6000);
    } catch (err: any) {
      setError(err?.message || 'Could not resend OTP.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Security Verification — Email OTP" maxWidth="max-w-md">
      <form onSubmit={handleVerify} className="space-y-4 text-left">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-indigo-400" />
              <span>Enter 6-Digit Code</span>
            </span>
            {resendStatus?.isConfigured ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Resend Live
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Resend Ready
              </span>
            )}
          </div>

          {resendStatus?.isConfigured ? (
            <div className="space-y-1.5">
              <p className="text-slate-300 leading-relaxed">
                A 6-digit verification code has been dispatched directly to <span className="text-indigo-400 font-mono font-semibold">{email}</span>.
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-[11px] text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>Real email delivered via Resend API. Please check your inbox (and spam folder) for the 6-digit code.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-400 leading-relaxed">
                Verification code dispatched for <span className="text-indigo-400 font-mono font-semibold">{email}</span>.
              </p>
              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300/90">
                Place your <code className="font-mono text-amber-200">RESEND_API_KEY=re_...</code> in <code className="font-mono text-amber-200">.env</code> to deliver codes to your real email inbox automatically.
              </div>
              {demoHint && (
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Dev Sandbox Code:</span>
                  <button
                    type="button"
                    onClick={() => handleOtpInput(demoHint)}
                    className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    title="Click to auto-fill code"
                  >
                    <span>{demoHint}</span>
                    <span className="text-[10px] text-slate-400 font-sans font-normal">(Click to verify)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {resendError && (
          <div className="p-3 rounded-lg border border-amber-800/60 bg-amber-950/30 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-200">Resend Delivery Notice:</span>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">{resendError}. Please verify the RESEND_API_KEY in your .env file.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {resendNotice && (
          <div className="p-3 rounded-lg border border-indigo-900/40 bg-indigo-950/20 text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{resendNotice}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            6-Digit Code <span className="text-slate-500 font-normal">(Auto-verifies upon 6th digit)</span>
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="e.g. 684291"
              value={otp}
              onChange={(e) => handleOtpInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>{loading ? 'Verifying...' : 'Verify OTP & Activate Session'}</span>
        </button>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Didn't receive email?</span>
          <button
            type="button"
            onClick={handleResend}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Resend Code</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
