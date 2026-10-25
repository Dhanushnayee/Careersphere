import React, { useState, useEffect } from 'react';
import { Company, CompanyVerificationSubmission, CompanyVerificationStatus } from '../../types';
import { apiClient } from '../../services/api';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Building,
  Upload,
  Calendar,
  User,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface CompanyVerificationViewProps {
  company: Company | null;
  onStatusChanged: (updatedCompany: Company) => void;
}

export const CompanyVerificationView: React.FC<CompanyVerificationViewProps> = ({
  company,
  onStatusChanged,
}) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(company);
  const [submission, setSubmission] = useState<CompanyVerificationSubmission | null>(null);
  const [history, setHistory] = useState<CompanyVerificationSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [officialDomain, setOfficialDomain] = useState('');
  const [documentName, setDocumentName] = useState('Certificate_of_Incorporation.pdf');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [simulatingAdmin, setSimulatingAdmin] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCompanyVerificationStatus();
      setCurrentCompany(data.company);
      if (data.submission) {
        setSubmission(data.submission);
        setRegistrationNumber(data.submission.registrationNumber || '');
        setTaxId(data.submission.taxId || '');
        setOfficialDomain(data.submission.officialDomain || '');
        setNotes(data.submission.notes || '');
      } else {
        setRegistrationNumber(data.company.registrationNumber || '');
        setTaxId(data.company.taxId || '');
        setOfficialDomain(data.company.website || '');
      }
      if (data.history) setHistory(data.history);
    } catch (err) {
      console.warn('Failed to load verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim() || !officialDomain.trim()) {
      setErrorNotice('Legal registration number and official company domain are required.');
      return;
    }

    setSubmitting(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const res = await apiClient.submitCompanyVerification({
        registrationNumber: registrationNumber.trim(),
        taxId: taxId.trim(),
        officialDomain: officialDomain.trim(),
        documentName,
        notes: notes.trim(),
      });

      setSubmission(res.submission);
      setCurrentCompany(res.company);
      onStatusChanged(res.company);
      setSuccessNotice('Verification evidence submitted successfully. Your request is now pending compliance review.');
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to submit verification evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  // Interactive development fast-track simulator for administrative review
  const handleSimulateAdminReview = async (action: 'verify' | 'reject' | 'request_resubmission') => {
    if (!currentCompany) return;
    setSimulatingAdmin(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const reason =
        action === 'reject'
          ? 'Corporate filing could not be matched in public state records.'
          : action === 'request_resubmission'
          ? 'Please provide an unredacted copy of state franchise tax receipt.'
          : undefined;

      const res = await apiClient.adminReviewCompany(currentCompany.id, action, reason);
      setCurrentCompany(res.company);
      if (res.submission) setSubmission(res.submission);
      onStatusChanged(res.company);
      setSuccessNotice(`Simulated admin action: status changed to "${res.company.verificationStatus}".`);
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to simulate admin review.');
    } finally {
      setSimulatingAdmin(false);
    }
  };

  const status: CompanyVerificationStatus = currentCompany?.verificationStatus || (currentCompany?.isVerified ? 'verified' : 'draft');

  const statusMeta: Record<CompanyVerificationStatus, { title: string; color: string; badge: string; desc: string; icon: any }> = {
    draft: {
      title: 'Verification In Draft (Unsubmitted)',
      color: 'text-slate-300',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      desc: 'Your company profile is in draft mode. You can create and edit job requisitions, but they cannot be broadcast to the public until verification is completed.',
      icon: Clock,
    },
    pending_review: {
      title: 'Evidence Submitted · Compliance Review in Progress',
      color: 'text-amber-300',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      desc: 'Your registration documents have been queued for administrative inspection. Turnaround is typically 1-2 business days.',
      icon: Clock,
    },
    verified: {
      title: 'Enterprise Verified Employer',
      color: 'text-emerald-300',
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      desc: 'Your corporate identity has been confirmed. Full public job publishing, direct candidate matching, and automated pipeline actions are fully active.',
      icon: ShieldCheck,
    },
    rejected: {
      title: 'Verification Request Rejected',
      color: 'text-rose-300',
      badge: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
      desc: 'Your verification request was reviewed and rejected. Please review the reviewer reason below and correct your filing.',
      icon: ShieldAlert,
    },
    resubmission_required: {
      title: 'Action Needed: Resubmission Required',
      color: 'text-amber-300',
      badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      desc: 'The reviewing administrator has requested supplementary evidence before verification can be granted.',
      icon: RotateCcw,
    },
  };

  const meta = statusMeta[status] || statusMeta.draft;
  const StatusIcon = meta.icon;

  return (
    <div className="space-y-6 text-slate-100 text-left">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Compliance & Regulatory Governance
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
          Company Verification Lifecycle
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Authenticate your organization to unlock public candidate discovery, trust badges, and active job broadcasts.
        </p>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-3.5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Hero Status Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              status === 'verified'
                ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-400'
                : status === 'pending_review'
                ? 'bg-amber-950/80 border-amber-600/50 text-amber-400'
                : status === 'rejected'
                ? 'bg-rose-950/80 border-rose-600/50 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-bold text-white">{currentCompany?.name}</span>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${meta.badge}`}>
                  {meta.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {meta.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps & Reviewer Notes */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Submission Timestamp</span>
            <span className="text-slate-200">
              {currentCompany?.verificationSubmittedAt
                ? new Date(currentCompany.verificationSubmittedAt).toLocaleString()
                : 'Not yet submitted'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Reviewing Authority</span>
            <span className="text-slate-200">
              {currentCompany?.reviewedByAdminId ? `Admin (${currentCompany.reviewedByAdminId})` : 'Awaiting Reviewer Assignment'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Decision / Verified At</span>
            <span className="text-slate-200">
              {currentCompany?.verifiedAt
                ? new Date(currentCompany.verifiedAt).toLocaleDateString()
                : status === 'pending_review'
                ? 'In Queue (Pending)'
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Rejection / Resubmission Reason Callout */}
        {(currentCompany?.rejectionReason || submission?.rejectionReason) && (
          <div className="p-3.5 rounded-xl border border-rose-900/40 bg-rose-950/20 text-xs text-rose-300 space-y-1">
            <div className="font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>Reviewer Feedback & Reason:</span>
            </div>
            <p className="leading-relaxed">
              {currentCompany?.rejectionReason || submission?.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Permissions of Unverified vs Verified Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Platform Permissions by Verification Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Unverified / Draft / Pending Companies</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Configure company profile, work culture & perks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Prepare job drafts and candidate interview structures</span>
              </li>
              <li className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Public job broadcasting blocked (saved as Draft only)</span>
              </li>
              <li className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Candidate applications restricted until compliance passes</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Enterprise Verified Companies</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Instant public requisition broadcasting to all job boards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Verified Employer Trust Badge displayed across portal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>AI Candidate Matcher priority rank and semantic scores</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Multi-interviewer scheduling and autonomous outreach</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Evidence Submission Form */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Verification Evidence Submission Form</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit your state or federal business entity registration details.
            </p>
          </div>
          {status === 'verified' && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              Verified & Active
            </span>
          )}
        </div>

        <form onSubmit={handleSubmitEvidence} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Entity Registration / Incorporation Number *
              </label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. DE-LLC-8829104 or C3982012"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Federal Tax ID / EIN (Encrypted in transit)
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="XX-XXXX8921"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Official Corporate Domain URL *
              </label>
              <input
                type="url"
                required
                value={officialDomain}
                onChange={(e) => setOfficialDomain(e.target.value)}
                placeholder="https://company.ai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Evidence Document Type
              </label>
              <select
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Certificate_of_Incorporation.pdf">Certificate of Incorporation / Formation (PDF)</option>
                <option value="State_Tax_Registration_Filing.pdf">State / National Tax Registration Certificate</option>
                <option value="Certificate_of_Good_Standing.pdf">Certificate of Good Standing</option>
                <option value="Business_Utility_License.pdf">Official Commercial Business License</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Supporting Notes for Reviewing Administrator
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context regarding state of formation, corporate parent, or specific authorization..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              * Verification documents are stored in secure backend storage and never shared publicly.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Evidence...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{status === 'resubmission_required' ? 'Resubmit Verification Evidence' : 'Submit for Compliance Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Review Simulation Controls (For test & evaluation) */}
      <div className="p-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-indigo-300 flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>Administrator Compliance Review Sandbox</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded">
            Integrated Admin Endpoint
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          In production, only superusers on the Admin Enclave can review and decide company verifications. Use these simulation triggers to test all 5 verification lifecycle states:
        </p>
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <button
            type="button"
            disabled={simulatingAdmin}
            onClick={() => handleSimulateAdminReview('verify')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white transition-colors font-semibold text-xs cursor-pointer"
          >
            Approve as Verified
          </button>
          <button
            type="button"
            disabled={simulatingAdmin}
            onClick={() => handleSimulateAdminReview('request_resubmission')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600 hover:text-white transition-colors font-semibold text-xs cursor-pointer"
          >
            Request Resubmission
          </button>
          <button
            type="button"
            disabled={simulatingAdmin}
            onClick={() => handleSimulateAdminReview('reject')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600 hover:text-white transition-colors font-semibold text-xs cursor-pointer"
          >
            Reject Verification
          </button>
        </div>
      </div>
    </div>
  );
};
