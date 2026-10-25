/**
 * CareerSphere AI — Recruiter Job Offer Lifecycle Management
 * Phase 4: Offer drafting, issuance, versioning revisions, withdrawal, and candidate response synchronization.
 */
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { JobOffer, Application, Job, OfferVersion } from '../../types';
import { Modal } from '../common/Modal';
import {
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Plus,
  Send,
  FileText,
  History,
  Shield,
  Clock,
  ArrowRight,
  TrendingUp,
  Percent,
  MapPin,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react';

interface OffersManagementViewProps {
  jobs: Job[];
}

export const OffersManagementView: React.FC<OffersManagementViewProps> = ({ jobs }) => {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');

  // Applications for offer builder
  const [applications, setApplications] = useState<Application[]>([]);

  // Create Offer Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [baseSalary, setBaseSalary] = useState<number>(185000);
  const [currency, setCurrency] = useState('USD');
  const [payFrequency, setPayFrequency] = useState<'annual' | 'monthly' | 'hourly'>('annual');
  const [bonusOrEquity, setBonusOrEquity] = useState('0.15% equity + $15,000 sign-on bonus');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [workplaceType, setWorkplaceType] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [benefits, setBenefits] = useState(
    'Comprehensive medical/dental/vision (100% employer paid), 401(k) 4% match, $3k home office stipend, unlimited flexible PTO.'
  );
  const [specialTerms, setSpecialTerms] = useState(
    'We were universally impressed by your technical depth during the systems architecture screen and look forward to welcoming you to the Synthetix core platform engineering team!'
  );
  const [createActionLoading, setCreateActionLoading] = useState(false);

  // Revise Offer Modal
  const [reviseTarget, setReviseTarget] = useState<JobOffer | null>(null);
  const [revisedSalary, setRevisedSalary] = useState<number>(195000);
  const [revisedBonusOrEquity, setRevisedBonusOrEquity] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('Adjusted base compensation per candidate counter-offer discussion.');
  const [reviseLoading, setReviseLoading] = useState(false);

  // Withdraw Modal
  const [withdrawTarget, setWithdrawTarget] = useState<JobOffer | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('Headcount prioritization update');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Version History Modal
  const [historyTarget, setHistoryTarget] = useState<JobOffer | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRecruiterOffers({
        status: statusFilter === 'all' ? undefined : statusFilter,
        jobId: jobFilter === 'all' ? undefined : jobFilter,
      });
      setOffers(data.offers || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err: any) {
      setError(err?.message || 'Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [statusFilter, jobFilter]);

  useEffect(() => {
    apiClient
      .getRecruiterApplicants({ limit: 50 })
      .then((res) => {
        const apps = res.applicants || [];
        setApplications(apps);
        if (apps.length > 0 && !selectedAppId) {
          setSelectedAppId(apps[0].id);
        }
      })
      .catch((e) => console.warn('Failed to load apps for offer builder:', e));
  }, []);

  const handleCreateOffer = async (e: React.FormEvent, isImmediateIssue: boolean) => {
    e.preventDefault();
    if (!selectedAppId) {
      showToast('Please select a target application.');
      return;
    }

    setCreateActionLoading(true);
    try {
      const created = await apiClient.createRecruiterOffer({
        applicationId: selectedAppId,
        baseSalary: Number(baseSalary),
        currency,
        payFrequency,
        bonusOrEquity: bonusOrEquity.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        expiryDate: new Date(`${expiryDate}T23:59:59Z`).toISOString(),
        workplaceType,
        benefits: benefits.split('\n').filter(Boolean),
        specialTerms: specialTerms.trim(),
        isImmediateIssue,
      });

      showToast(
        isImmediateIssue
          ? `Offer package issued immediately to candidate. Application stage synchronized to "Offer Extended".`
          : `Draft offer created (v${created.version}). You can review and issue when ready.`
      );
      setIsCreateModalOpen(false);
      fetchOffers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create offer package.');
    } finally {
      setCreateActionLoading(false);
    }
  };

  const handleIssueDraftOffer = async (offerId: string) => {
    try {
      await apiClient.issueRecruiterOffer(offerId);
      showToast('Offer package formally issued to candidate. Candidate portal notified.');
      fetchOffers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to issue offer.');
    }
  };

  const handleExecuteRevise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviseTarget) return;

    setReviseLoading(true);
    try {
      const updated = await apiClient.reviseRecruiterOffer(reviseTarget.id, {
        baseSalary: Number(revisedSalary),
        bonusOrEquity: revisedBonusOrEquity.trim() || undefined,
        revisionNotes: revisionNotes.trim(),
      });

      showToast(`Offer revised to version v${updated.version} and re-sent to candidate.`);
      setReviseTarget(null);
      fetchOffers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revise offer.');
    } finally {
      setReviseLoading(false);
    }
  };

  const handleExecuteWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawTarget) return;

    setWithdrawLoading(true);
    try {
      await apiClient.withdrawRecruiterOffer(withdrawTarget.id, withdrawReason.trim());
      showToast('Offer successfully withdrawn.');
      setWithdrawTarget(null);
      fetchOffers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to withdraw offer.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Accepted • Hired
          </span>
        );
      case 'declined':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Declined
          </span>
        );
      case 'issued':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
            <Send className="h-3 w-3" />
            Offer Issued
          </span>
        );
      case 'expired':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Expired
          </span>
        );
      case 'withdrawn':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Withdrawn
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Draft
          </span>
        );
    }
  };

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter((o) => o.status === 'accepted').length;
  const acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

  return (
    <div className="space-y-6 text-left text-xs animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-700 bg-emerald-950/80 text-emerald-200 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-teal-900/50 bg-gradient-to-r from-teal-950/50 via-slate-900 to-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900/60 text-teal-300 border border-teal-700/60">
                PHASE 4 ACTIVE
              </span>
              <span className="text-xs text-slate-400">Offer Lifecycle & Compensation Packages</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Offer Management & Compensation Workflow
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Create, version, and issue digital job offers with transparent equity, benefits, and expiration tracking.
              Candidate acceptance automatically advances candidate stage to "Hired".
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Draft New Offer</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Total Offers</div>
            <div className="text-lg font-bold font-mono text-white">{totalOffers}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-cyan-400">Issued & Pending</div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {statusCounts.issued || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-emerald-400">Accepted & Hired</div>
            <div className="text-lg font-bold font-mono text-emerald-300">
              {acceptedOffers}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-teal-400">Acceptance Rate</div>
            <div className="text-lg font-bold font-mono text-teal-300">{acceptanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto google-photos-scrollbar py-1">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'draft', label: 'Drafts' },
            { id: 'issued', label: 'Issued' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'declined', label: 'Declined' },
            { id: 'withdrawn', label: 'Withdrawn' },
          ].map((tab) => {
            const count = tab.id === 'all' ? offers.length : statusCounts[tab.id] || 0;
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isSelected ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchOffers}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer self-end sm:self-auto"
          title="Refresh offers"
        >
          <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-800 bg-slate-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
          <span>Loading compensation package records...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-300 border border-rose-900/50 bg-rose-950/20 rounded-2xl space-y-3">
          <AlertTriangle className="h-6 w-6 mx-auto text-rose-400" />
          <div>{error}</div>
          <button
            onClick={fetchOffers}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-900 hover:bg-rose-800 text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-16 text-center text-slate-400 border border-slate-800 bg-slate-900/30 rounded-2xl space-y-3">
          <Briefcase className="h-10 w-10 mx-auto text-slate-600" />
          <h3 className="text-sm font-bold text-white">No Job Offers Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {statusFilter !== 'all'
              ? `There are no offers matching status "${statusFilter}".`
              : 'You have not drafted any offers yet. Click "Draft New Offer" to assemble an offer package.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 cursor-pointer"
          >
            Draft First Offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((off) => {
            const formattedSalary = `${off.currency || 'USD'} ${Number(off.baseSalary).toLocaleString()} / ${off.payFrequency || 'annual'}`;
            const isExpired = off.expiryDate && new Date(off.expiryDate) < new Date() && off.status === 'issued';

            return (
              <div
                key={off.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {off.candidateName || 'Candidate'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-300 font-medium">
                        {off.jobTitle || 'Requisition'}
                      </span>
                      {getStatusBadge(isExpired ? 'expired' : off.status)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        v{off.version || 1}
                      </span>
                    </div>

                    {/* Compensation details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-white font-mono font-bold">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{formattedSalary}</span>
                      </div>

                      {off.bonusOrEquity && (
                        <div className="flex items-center gap-1 text-teal-300">
                          <Percent className="h-3 w-3" />
                          <span>{off.bonusOrEquity}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span className="capitalize">{off.workplaceType || 'Remote'}</span>
                      </div>

                      {off.expiryDate && (
                        <div className="flex items-center gap-1 text-slate-400 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>
                            Expires: {new Date(off.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Candidate Response Note */}
                    {off.candidateResponse && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs ${
                          off.status === 'accepted'
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-800 text-rose-200'
                        }`}
                      >
                        <strong>Candidate response:</strong> {off.candidateResponse.note || 'No comments'}
                        <span className="font-mono text-[10px] text-slate-400 ml-2">
                          ({new Date(off.candidateResponse.respondedAt).toLocaleDateString()})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Version History Button */}
                    {off.versionHistory && off.versionHistory.length > 0 && (
                      <button
                        onClick={() => setHistoryTarget(off)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <History className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Revisions ({off.versionHistory.length})</span>
                      </button>
                    )}

                    {/* Draft Action: Issue */}
                    {off.status === 'draft' && (
                      <button
                        onClick={() => handleIssueDraftOffer(off.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shadow-sm"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Issue to Candidate</span>
                      </button>
                    )}

                    {/* Revise Offer */}
                    {off.status !== 'accepted' && off.status !== 'withdrawn' && (
                      <button
                        onClick={() => {
                          setReviseTarget(off);
                          setRevisedSalary(off.baseSalary);
                          setRevisedBonusOrEquity(off.bonusOrEquity || '');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Revise</span>
                      </button>
                    )}

                    {/* Withdraw Offer */}
                    {off.status !== 'accepted' && off.status !== 'withdrawn' && (
                      <button
                        onClick={() => setWithdrawTarget(off)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-colors cursor-pointer"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREATE OFFER PACKAGE WIZARD */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Candidate Compensation & Job Offer Package"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-left text-xs">
            <div className="p-3 rounded-xl border border-teal-900/40 bg-teal-950/30 flex items-start gap-2.5">
              <DollarSign className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-relaxed text-[11px]">
                Draft or issue a compensation package. Once issued, the candidate will be notified in the Candidate
                Portal and can accept or decline with notes. Acceptance advances stage to <strong>"Hired"</strong>.
              </div>
            </div>

            <form
              onSubmit={(e) => handleCreateOffer(e, false)}
              className="space-y-4 text-xs"
            >
              {/* Application Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Candidate Application <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500 text-xs"
                  required
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidateName || 'Candidate'} — {app.jobTitle} (Stage: {app.stage})
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Base Salary <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                  <select
                    value={payFrequency}
                    onChange={(e) => setPayFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="annual">Per Year (Annual)</option>
                    <option value="monthly">Per Month</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>

              {/* Bonus or Equity */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Equity & Bonus Terms</label>
                <input
                  type="text"
                  value={bonusOrEquity}
                  onChange={(e) => setBonusOrEquity(e.target.value)}
                  placeholder="e.g. 0.15% equity + $15k sign-on bonus"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Start Date, Expiry, Workplace */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Offer Expiration Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Workplace Arrangement</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="Remote">100% Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-Site Office</option>
                  </select>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Benefits Package Summary</label>
                <textarea
                  rows={2}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Special Terms / Cover Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Candidate Cover Letter / Special Terms</label>
                <textarea
                  rows={2}
                  value={specialTerms}
                  onChange={(e) => setSpecialTerms(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={createActionLoading}
                  onClick={(e) => handleCreateOffer(e, false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={createActionLoading}
                  onClick={(e) => handleCreateOffer(e, true)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 transition-colors cursor-pointer"
                >
                  {createActionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Issue Offer Immediately</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* MODAL 2: REVISE OFFER */}
      {reviseTarget && (
        <Modal
          isOpen={Boolean(reviseTarget)}
          onClose={() => setReviseTarget(null)}
          title={`Revise Offer Package (v${(reviseTarget.version || 1) + 1})`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleExecuteRevise} className="space-y-4 text-left text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Revising offer for <strong className="text-white">{reviseTarget.candidateName}</strong>. Previous version (v{reviseTarget.version}) will be archived in version history.
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Revised Base Salary ({reviseTarget.currency || 'USD'})</label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={revisedSalary}
                onChange={(e) => setRevisedSalary(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Revised Equity & Bonus Terms</label>
              <input
                type="text"
                value={revisedBonusOrEquity}
                onChange={(e) => setRevisedBonusOrEquity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Revision Summary Reason</label>
              <textarea
                rows={2}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReviseTarget(null)}
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviseLoading}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {reviseLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Issue Revision</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: WITHDRAW OFFER */}
      {withdrawTarget && (
        <Modal
          isOpen={Boolean(withdrawTarget)}
          onClose={() => setWithdrawTarget(null)}
          title="Withdraw Job Offer"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleExecuteWithdraw} className="space-y-4 text-left text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Are you sure you want to withdraw the offer for <strong className="text-white">{withdrawTarget.candidateName}</strong>?
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Withdrawal Reason</label>
              <textarea
                rows={2}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWithdrawTarget(null)}
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
              >
                Keep Offer
              </button>
              <button
                type="submit"
                disabled={withdrawLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {withdrawLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Withdraw Offer</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: VERSION HISTORY DRAWER */}
      {historyTarget && (
        <Modal
          isOpen={Boolean(historyTarget)}
          onClose={() => setHistoryTarget(null)}
          title={`Offer Revision History — ${historyTarget.candidateName}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-left text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
              Current Active Offer Version: <strong className="text-white font-mono">v{historyTarget.version}</strong>
            </div>

            <div className="space-y-3">
              {(historyTarget.versionHistory || []).map((ver) => (
                <div
                  key={ver.version}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-400">Version {ver.version}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ver.revisedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-white font-mono font-bold">
                    {historyTarget.currency || 'USD'} {ver.baseSalary.toLocaleString()}
                  </div>
                  {ver.revisionNotes && (
                    <div className="text-slate-400 italic text-[11px] pt-1">
                      Reason: "{ver.revisionNotes}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setHistoryTarget(null)}
                className="px-4 py-1.5 rounded-xl text-xs bg-slate-800 text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
