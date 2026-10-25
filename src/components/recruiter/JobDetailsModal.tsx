import React, { useState, useEffect } from 'react';
import { Job, JobAnalyticsSummary, JobActivityRecord } from '../../types';
import { apiClient } from '../../services/api';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  ExternalLink,
  Edit,
  Copy,
  Pause,
  Play,
  RotateCcw,
  Check,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onStatusChangeRequest: (job: Job, action: 'publish' | 'pause' | 'resume' | 'close' | 'reopen') => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onStatusChangeRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activities'>('overview');
  const [analytics, setAnalytics] = useState<JobAnalyticsSummary | null>(null);
  const [activities, setActivities] = useState<JobActivityRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isOpen || !job?.id) return;
    async function fetchDetails() {
      setLoadingDetails(true);
      try {
        const [analyticsData, activitiesData] = await Promise.all([
          apiClient.getJobAnalytics(job.id).catch(() => null),
          apiClient.getJobActivities(job.id).catch(() => []),
        ]);
        if (analyticsData) setAnalytics(analyticsData);
        if (activitiesData) setActivities(activitiesData);
      } catch (err) {
        console.warn('Error fetching job details / analytics:', err);
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchDetails();
  }, [isOpen, job?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-semibold">
                {job.jobRef || `REQ-${job.id.slice(-6)}`}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                <span>{job.company_name || 'Synthetix Dynamics'}</span>
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${
                job.status === 'active'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  : job.status === 'closed'
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : job.status === 'expired'
                  ? 'bg-rose-950 text-rose-300 border-rose-800/50'
                  : 'bg-amber-950 text-amber-300 border-amber-700/60'
              }`}>
                {job.status === 'active' ? '● Published / Active' : job.status.toUpperCase()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{job.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="shrink-0 px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 border-b-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Role Specifications & Description
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 px-3 border-b-2 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'border-cyan-500 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Application Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-2.5 px-3 border-b-2 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'border-cyan-500 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Activity History ({activities.length})</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth google-photos-scrollbar p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Department</div>
                  <div className="text-xs font-bold text-white mt-1 truncate">{job.department}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Workplace & Type</div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {job.workplaceType} · {job.employmentType}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Compensation</div>
                  <div className="text-xs font-bold text-cyan-300 mt-1 truncate">
                    {job.isSalaryDisclosed !== false
                      ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} ${job.salaryCurrency}`
                      : 'Undisclosed'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Total Applicants</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">
                    {job.applicantsCount || 0} Candidates
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Skills Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {(job.skillsRequired || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                  {(job.preferredSkills || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
                      {s} (Preferred)
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Role Description</div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Core Responsibilities</div>
                  <ul className="text-xs text-slate-300 list-disc pl-5 space-y-1">
                    {job.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {job.qualifications && job.qualifications.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Qualifications & Eligibility</div>
                  <ul className="text-xs text-slate-300 list-disc pl-5 space-y-1">
                    {job.qualifications.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Perks & Benefits</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {job.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screening Questions */}
              {job.screeningQuestions && job.screeningQuestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Applicant Screening Questions ({job.screeningQuestions.length})
                  </div>
                  <div className="space-y-2">
                    {job.screeningQuestions.map((q, i) => (
                      <div key={q.id || i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="font-semibold text-white">Q{i + 1}: {q.question}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>Format: <span className="uppercase font-mono">{q.questionType || 'text'}</span></span>
                          <span>·</span>
                          <span>Required: <span className="font-semibold">{q.required ? 'Yes' : 'No'}</span></span>
                          {q.idealAnswer && <span>· Ideal Benchmark: <span className="text-cyan-300">{q.idealAnswer}</span></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICATION ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Total Candidates</div>
                  <div className="text-2xl font-extrabold text-white">{analytics?.totalApplications ?? job.applicantsCount ?? 0}</div>
                  <div className="text-[10px] text-cyan-400">Database verified count</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Active Candidates</div>
                  <div className="text-2xl font-extrabold text-emerald-400">{analytics?.activeCandidates ?? 0}</div>
                  <div className="text-[10px] text-slate-400">In review / pipeline</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Interviews Scheduled</div>
                  <div className="text-2xl font-extrabold text-indigo-400">{analytics?.interviewsScheduled ?? 0}</div>
                  <div className="text-[10px] text-slate-400">Technical rounds</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Days Requisition Open</div>
                  <div className="text-2xl font-extrabold text-amber-400">{analytics?.daysOpen ?? 1}</div>
                  <div className="text-[10px] text-slate-400">Since posting date</div>
                </div>
              </div>

              {/* Stage Breakdown Bar */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Candidate Pipeline Stage Distribution</div>
                {analytics?.stageBreakdown ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.stageBreakdown).map(([stage, count]) => {
                      const total = analytics.totalApplications || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={stage} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-medium">{stage}</span>
                            <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Loading pipeline statistics...</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === 'activities' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Audit & Requisition Lifecycle Events</div>
              {activities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-xl bg-slate-950">
                  No activity history logged yet. Actions like status changes and edits will appear here.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="h-7 w-7 rounded-lg bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                        <History className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{act.action.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(act.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{act.details || 'Lifecycle action performed.'}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Actor: {act.actorName} ({act.actorEmail})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER WITH ACTIONS */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onClose();
                onEdit(job);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit in Wizard</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDuplicate(job);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate as Draft</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {job.status === 'active' && (
              <button
                onClick={() => onStatusChangeRequest(job, 'pause')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Requisition</span>
              </button>
            )}

            {job.status === 'paused' && (
              <button
                onClick={() => onStatusChangeRequest(job, 'resume')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Resume Publishing</span>
              </button>
            )}

            {(job.status === 'active' || job.status === 'paused') && (
              <button
                onClick={() => onStatusChangeRequest(job, 'close')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Close Requisition</span>
              </button>
            )}

            {(job.status === 'closed' || job.status === 'expired') && (
              <button
                onClick={() => onStatusChangeRequest(job, 'reopen')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reopen Requisition</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
