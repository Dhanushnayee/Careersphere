/**
 * CareerSphere AI — Unified Multi-Job Application Automation Modal
 * Phase 5 Compliant Automation Engine
 * Features:
 * - Multi-job batch review
 * - Official ATS API adapter dispatch
 * - Mandatory positive candidate consent gate
 * - Safe manual handoff links for unsupported external portals
 * - Zero bypass of security controls or CAPTCHA/MFA
 */
import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { Job, MultiApplyResult, ResumeDocument } from '../../types';
import { Send, CheckCircle2, AlertCircle, ExternalLink, ShieldAlert, Loader2, FileText, Check } from 'lucide-react';

interface MultiApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJobs: Job[];
  primaryResumeTitle?: string;
  resumes?: ResumeDocument[];
  onSuccess?: () => void;
  onApplicationsSubmitted?: () => void;
}

export const MultiApplyModal: React.FC<MultiApplyModalProps> = ({
  isOpen,
  onClose,
  selectedJobs,
  primaryResumeTitle,
  resumes,
  onSuccess,
  onApplicationsSubmitted,
}) => {
  const [consentGranted, setConsentGranted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<MultiApplyResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveResumeTitle =
    primaryResumeTitle ||
    resumes?.find((r) => r.isPrimary)?.fileName ||
    resumes?.[0]?.fileName ||
    'Primary Candidate Resume';

  const handleExecuteMultiApply = async () => {
    if (!consentGranted) {
      setError('Explicit candidate authorization is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const jobIds = selectedJobs.map((j) => j.id);
      const res = await apiClient.multiApply({
        jobIds,
        consentGranted: true,
      });

      setResults(res.results);
      if (onSuccess) onSuccess();
      if (onApplicationsSubmitted) onApplicationsSubmitted();
    } catch (err: any) {
      setError(err?.message || 'Failed to orchestrate multi-job submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unified Multi-Job Application Engine"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-left text-xs">
        
        {/* Compliance Guarantee Strip */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            <span>Ethical Automation & Zero-Bypass Compliance</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            CareerSphere AI communicates exclusively with verified, authorized ATS APIs. For external portals without direct API support, a safe manual handoff link is prepared. The platform never circumvents OTP, MFA, CAPTCHA, or platform terms of service.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Jobs Review */}
        {!results ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  Target Positions Selected ({selectedJobs.length})
                </span>
                <span className="text-slate-400 font-mono">
                  Attached: {effectiveResumeTitle}
                </span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
                {selectedJobs.map((job) => (
                  <div key={job.id} className="p-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-200">{job.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {job.company_name} · {job.location} · {job.salary_range}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-indigo-300 border border-slate-800">
                        {job.partnerAts || 'Greenhouse Partner API'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Candidate Consent Gate */}
            <div className="p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 space-y-2">
              <div className="font-semibold text-indigo-300 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Candidate Positive Digital Consent Gate</span>
              </div>
              <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="leading-relaxed">
                  I explicitly authorize CareerSphere AI to submit my verified profile information, candidate credentials, and attached resume ({primaryResumeTitle}) to the {selectedJobs.length} selected employer systems.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMultiApply}
                disabled={!consentGranted || submitting}
                className="px-5 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {submitting
                    ? 'Dispatching Applications...'
                    : `Authorize & Dispatch to ${selectedJobs.length} Roles`}
                </span>
              </button>
            </div>
          </>
        ) : (
          /* Submission Results Stream */
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Orchestration Execution Completed</span>
            </div>

            <div className="space-y-2">
              {results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white">{res.jobTitle}</div>
                    <div className="text-slate-400">{res.message}</div>
                    {res.transactionId && (
                      <div className="text-[11px] font-mono text-emerald-400">
                        Transaction Receipt: {res.transactionId}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {res.status === 'submitted' && (
                      <span className="px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        Confirmed API
                      </span>
                    )}
                    {res.status === 'manual_handoff' && (
                      <a
                        href={res.manualUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-indigo-950/60 text-indigo-300 hover:text-white border border-indigo-800/60"
                      >
                        <span>Open Career Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {res.status === 'skipped_duplicate' && (
                      <span className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
                        Duplicate Skipped
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
              >
                Close & View Application History
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
