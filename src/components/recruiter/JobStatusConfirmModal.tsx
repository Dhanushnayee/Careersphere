import React, { useState } from 'react';
import { Job } from '../../types';
import {
  X,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Loader2,
} from 'lucide-react';

interface JobStatusConfirmModalProps {
  job: Job | null;
  action: 'publish' | 'pause' | 'resume' | 'close' | 'reopen' | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'publish' | 'pause' | 'resume' | 'close' | 'reopen', reason?: string, newDeadline?: string) => Promise<void>;
}

export const JobStatusConfirmModal: React.FC<JobStatusConfirmModalProps> = ({
  job,
  action,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen || !job || !action) return null;

  const isExpired = job.status === 'expired' || (job.deadline && new Date(job.deadline).getTime() < Date.now());

  const getActionDetails = () => {
    switch (action) {
      case 'pause':
        return {
          title: 'Pause Requisition',
          description: `Pausing "${job.title}" temporarily stops new candidate applications and hides it from the candidate discovery feed. Existing applications and history are preserved.`,
          btnText: 'Confirm Pause',
          btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
          icon: Pause,
        };
      case 'resume':
        return {
          title: 'Resume Requisition',
          description: `Resuming "${job.title}" reactivates public visibility and resumes accepting new candidate applications immediately.`,
          btnText: 'Resume Publishing',
          btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
          icon: Play,
        };
      case 'close':
        return {
          title: 'Close Requisition',
          description: `Closing "${job.title}" marks this requisition as fulfilled or cancelled. Candidates will no longer be able to submit applications at the server level.`,
          btnText: 'Close Requisition',
          btnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
          icon: AlertTriangle,
        };
      case 'reopen':
        return {
          title: 'Reopen Requisition',
          description: `Reopening "${job.title}" moves it back to active publishing. If the previous deadline has passed, please specify a new future application deadline.`,
          btnText: 'Reopen Requisition',
          btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
          icon: RotateCcw,
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure you want to proceed with this status change?',
          btnText: 'Confirm',
          btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
          icon: CheckCircle2,
        };
    }
  };

  const details = getActionDetails();
  const Icon = details.icon;

  const handleExecute = async () => {
    setErrorNotice(null);
    if (action === 'reopen' && isExpired) {
      const d = new Date(newDeadline.includes('T') ? newDeadline : `${newDeadline}T23:59:59Z`);
      if (isNaN(d.getTime()) || d.getTime() < Date.now()) {
        setErrorNotice('Please select a valid future application deadline date.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onConfirm(action, reason.trim() || undefined, action === 'reopen' ? newDeadline : undefined);
      onClose();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to update job status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100 space-y-5">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{details.title}</h3>
              <p className="text-xs text-slate-400 font-mono">{job.jobRef || job.id} · {job.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          {details.description}
        </p>

        {errorNotice && (
          <div className="p-3 rounded-xl border border-rose-900/50 bg-rose-950/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Reopen requires new deadline if expired */}
        {action === 'reopen' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              New Application Deadline (Required)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="date"
                required
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-[10px] text-slate-500">
              Specifying a future deadline ensures candidates can apply via the portal.
            </span>
          </div>
        )}

        {/* Reason / Internal Audit Note */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Internal Note / Reason (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Role filled by internal transfer, pausing for team restructuring..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={submitting}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-md cursor-pointer ${details.btnClass}`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{details.btnText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
