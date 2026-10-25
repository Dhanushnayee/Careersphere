/**
 * CareerSphere AI — Recruiter Interview Management Dashboard
 * Phase 4: Full interview management, calendar/list view, rescheduling, cancellation, feedback, and conflict handling.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../services/api';
import { Interview, Job, Application, InterviewFeedback } from '../../types';
import { ScheduleInterviewWizardModal } from './ScheduleInterviewWizardModal';
import { InterviewFeedbackModal } from './InterviewFeedbackModal';
import {
  Calendar,
  Clock,
  Video,
  User,
  Search,
  Filter,
  Plus,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Bell,
  ChevronRight,
  List,
  CalendarDays,
  Lock,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface InterviewsManagementViewProps {
  jobs: Job[];
  onNavigateToCandidate?: (applicationId: string) => void;
}

export const InterviewsManagementView: React.FC<InterviewsManagementViewProps> = ({
  jobs,
  onNavigateToCandidate,
}) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modals & Active Targets
  const [isScheduleWizardOpen, setIsScheduleWizardOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<Interview | null>(null);

  // Reschedule Action State
  const [rescheduleTarget, setRescheduleTarget] = useState<Interview | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('14:00');
  const [rescheduleReason, setRescheduleReason] = useState('Interviewer schedule conflict');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Reschedule Request Review (Candidate Proposed)
  const [reviewRequestTarget, setReviewRequestTarget] = useState<Interview | null>(null);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<Interview | null>(null);
  const [cancelReason, setCancelReason] = useState('Position filled or requirements changed');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Applications for schedule dropdown
  const [applications, setApplications] = useState<Application[]>([]);

  // Action feedback message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRecruiterInterviews({
        status: statusFilter === 'all' ? undefined : statusFilter,
        jobId: jobFilter === 'all' ? undefined : jobFilter,
        search: searchQuery.trim() || undefined,
      });
      setInterviews(data.interviews || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err: any) {
      setError(err?.message || 'Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, jobFilter]);

  // Load applicants for wizard dropdown
  useEffect(() => {
    apiClient
      .getRecruiterApplicants({ limit: 50 })
      .then((res: any) => {
        setApplications(res.applicants || []);
      })
      .catch((e: any) => console.warn('Failed to prefetch applications for interview wizard:', e));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInterviews();
  };

  const handleCheckReminders = async () => {
    try {
      const result = await apiClient.checkInterviewReminders();
      const count = (result.reminders24hSent || 0) + (result.reminders1hSent || 0);
      showToast(
        `Automated check complete: ${count} reminders processed. ${result.offersExpired || 0} expired offers reconciled.`,
        'info'
      );
      fetchInterviews();
    } catch (err: any) {
      showToast('Failed to execute reminder runner.', 'error');
    }
  };

  const handleExecuteReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    setRescheduleLoading(true);
    try {
      const newScheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}:00Z`).toISOString();
      const updated = await apiClient.rescheduleRecruiterInterview(rescheduleTarget.id, {
        scheduledAt: newScheduledAt,
        reason: rescheduleReason.trim(),
      });
      showToast(`Interview successfully rescheduled to ${new Date(updated.scheduledAt).toLocaleString()}.`);
      setRescheduleTarget(null);
      fetchInterviews();
    } catch (err: any) {
      showToast(err?.message || 'Failed to reschedule interview.', 'error');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleRespondToCandidateReschedule = async (action: 'accept' | 'decline') => {
    if (!reviewRequestTarget) return;

    setReviewActionLoading(true);
    try {
      const updated = await apiClient.respondToInterviewReschedule(
        reviewRequestTarget.id,
        action,
        reviewRequestTarget.rescheduleRequestedDate,
        action === 'decline' ? 'Proposed time unavailable with interviewing panel' : undefined
      );
      showToast(
        action === 'accept'
          ? `Accepted candidate's proposed time. Interview updated to ${new Date(updated.scheduledAt).toLocaleString()}.`
          : `Candidate reschedule request declined. Schedule remains at ${new Date(updated.scheduledAt).toLocaleString()}.`
      );
      setReviewRequestTarget(null);
      fetchInterviews();
    } catch (err: any) {
      showToast(err?.message || 'Failed to respond to request.', 'error');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleExecuteCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;

    setCancelLoading(true);
    try {
      await apiClient.cancelRecruiterInterview(cancelTarget.id, cancelReason.trim());
      showToast('Interview cancelled and candidate notification dispatched.');
      setCancelTarget(null);
      fetchInterviews();
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel interview.', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadIcs = (interviewId: string) => {
    window.location.href = `/api/v1/recruiter/interviews/${interviewId}/ics`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        );
      case 'reschedule_requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="h-3 w-3" />
            Reschedule Requested
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left text-xs animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-lg animate-fadeIn ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-700 text-rose-200'
              : toastMessage.type === 'info'
              ? 'bg-indigo-950/80 border-indigo-700 text-indigo-200'
              : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-cyan-900/50 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                PHASE 4 ACTIVE
              </span>
              <span className="text-xs text-slate-400">Enterprise Hiring Orchestration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recruiter Interview Management System
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Schedule multi-round interviews with conflict detection, assign panel evaluators, record structured
              feedback, and synchronize stages with Candidate Portal in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCheckReminders}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Run 24h/1h notification check"
            >
              <Bell className="h-3.5 w-3.5 text-amber-400" />
              <span>Check Reminders</span>
            </button>

            <button
              onClick={() => setIsScheduleWizardOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Interview</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-slate-400">Total Interviews</div>
            <div className="text-lg font-bold font-mono text-white">
              {statusCounts.all || interviews.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-cyan-400">Scheduled</div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {statusCounts.scheduled || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-emerald-400">Confirmed</div>
            <div className="text-lg font-bold font-mono text-emerald-300">
              {statusCounts.confirmed || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-amber-400">Pending Reschedule</div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {statusCounts.reschedule_requested || 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[11px] text-indigo-400">Completed</div>
            <div className="text-lg font-bold font-mono text-indigo-300">
              {statusCounts.completed || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto google-photos-scrollbar py-1">
            {[
              { id: 'all', label: 'All Interviews' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'reschedule_requested', label: 'Reschedule Requests' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => {
              const count = tab.id === 'all' ? interviews.length : statusCounts[tab.id] || 0;
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isSelected ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Calendar Timeline View"
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={fetchInterviews}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh interviews"
            >
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Job Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-800/80">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by candidate name, interviewer, or round..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Jobs & Openings</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-800 bg-slate-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <span>Loading interview schedule records...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-300 border border-rose-900/50 bg-rose-950/20 rounded-2xl space-y-3">
          <AlertTriangle className="h-6 w-6 mx-auto text-rose-400" />
          <div>{error}</div>
          <button
            onClick={fetchInterviews}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-900 hover:bg-rose-800 text-white cursor-pointer"
          >
            Retry Query
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-16 text-center text-slate-400 border border-slate-800 bg-slate-900/30 rounded-2xl space-y-3">
          <Calendar className="h-10 w-10 mx-auto text-slate-600" />
          <h3 className="text-sm font-bold text-white">No Interviews Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {statusFilter !== 'all'
              ? `There are no interviews with status "${statusFilter}". Try selecting "All Interviews".`
              : 'You have not scheduled any candidate interviews yet. Click "Schedule Interview" to initiate a round.'}
          </p>
          <button
            onClick={() => setIsScheduleWizardOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer"
          >
            Schedule First Interview
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {interviews.map((int) => {
            const isPendingReschedule = int.status === 'reschedule_requested';
            const scheduledDate = new Date(int.scheduledAt);
            const endDate = int.endAt ? new Date(int.endAt) : null;

            return (
              <div
                key={int.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPendingReschedule
                    ? 'border-amber-600/70 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 shadow-md'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {int.candidateName || 'Candidate'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-300 font-medium">
                        {int.jobTitle || 'Requisition'}
                      </span>
                      {getStatusBadge(int.status)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {int.roundName || `Round ${int.roundNumber || 1}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-white font-medium">
                          {scheduledDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>
                          {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {endDate ? ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}{' '}
                          ({int.timeZone || 'UTC'})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {int.interviewers && int.interviewers.length > 0
                            ? int.interviewers.map((i) => i.name).join(', ')
                            : int.interviewerName || 'Hiring Lead'}
                        </span>
                      </div>

                      {int.meetingUrl && (
                        <a
                          href={int.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Join Meeting</span>
                        </a>
                      )}
                    </div>

                    {/* Reschedule Request Notice */}
                    {isPendingReschedule && (
                      <div className="p-3 rounded-xl border border-amber-600/50 bg-amber-950/40 text-amber-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span>Candidate Requested Reschedule:</span>
                        </div>
                        <p className="text-amber-300/90 pl-5">
                          Reason: "{int.rescheduleReason || 'Personal conflict'}"
                          {int.rescheduleRequestedDate && (
                            <> • Proposed Time: <strong className="text-white font-mono">{new Date(int.rescheduleRequestedDate).toLocaleString()}</strong></>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Cancellation Notice */}
                    {int.status === 'cancelled' && int.cancellationReason && (
                      <div className="text-xs text-rose-300/90 pl-1 italic">
                        Cancellation reason: {int.cancellationReason}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* If candidate requested reschedule */}
                    {isPendingReschedule && (
                      <button
                        onClick={() => setReviewRequestTarget(int)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-sm"
                      >
                        Review Candidate Request
                      </button>
                    )}

                    {/* ICS Export */}
                    <button
                      onClick={() => handleDownloadIcs(int.id)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Download RFC 5545 .ics calendar invite"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    {/* Feedback / Scorecard */}
                    <button
                      onClick={() => setFeedbackTarget(int)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        int.feedbackStatus === 'submitted'
                          ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                          : 'bg-indigo-950/80 text-indigo-300 border-indigo-800 hover:bg-indigo-900'
                      }`}
                    >
                      {int.feedbackStatus === 'submitted' ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Evaluation Locked</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-3.5 w-3.5" />
                          <span>Submit Scorecard</span>
                        </>
                      )}
                    </button>

                    {/* Reschedule Button */}
                    {int.status !== 'cancelled' && int.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setRescheduleTarget(int);
                          setRescheduleDate(new Date(int.scheduledAt).toISOString().split('T')[0]);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      >
                        Reschedule
                      </button>
                    )}

                    {/* Cancel Button */}
                    {int.status !== 'cancelled' && int.status !== 'completed' && (
                      <button
                        onClick={() => setCancelTarget(int)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar / Timeline View */
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cyan-400" />
              <span>Chronological Interview Agenda</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {interviews.length} Scheduled Sessions
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {interviews
              .slice()
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
              .map((int) => {
                const sDate = new Date(int.scheduledAt);
                return (
                  <div key={int.id} className="relative space-y-1.5">
                    <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400"></div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-cyan-400 font-bold">
                        {sDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {getStatusBadge(int.status)}
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">
                          {int.candidateName || 'Candidate'} — {int.roundName || 'Round'}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {int.jobTitle} • {int.interviewers?.[0]?.name || int.interviewerName || 'Interviewer'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFeedbackTarget(int)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 cursor-pointer"
                        >
                          Feedback
                        </button>
                        <button
                          onClick={() => handleDownloadIcs(int.id)}
                          className="p-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 cursor-pointer"
                          title="Download ICS"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL 1: SCHEDULE WIZARD */}
      {isScheduleWizardOpen && (
        <ScheduleInterviewWizardModal
          isOpen={isScheduleWizardOpen}
          onClose={() => setIsScheduleWizardOpen(false)}
          applications={applications}
          onSuccess={(newInt) => {
            showToast(`Interview successfully scheduled for ${newInt.candidateName || 'candidate'}.`);
            fetchInterviews();
          }}
        />
      )}

      {/* MODAL 2: INTERVIEW FEEDBACK / SCORECARD */}
      {feedbackTarget && (
        <InterviewFeedbackModal
          isOpen={Boolean(feedbackTarget)}
          onClose={() => setFeedbackTarget(null)}
          interview={feedbackTarget}
          onFeedbackSaved={(id, fb) => {
            showToast('Evaluation submitted and locked to hiring record.');
            fetchInterviews();
          }}
        />
      )}

      {/* MODAL 3: RESCHEDULE MODAL */}
      {rescheduleTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Reschedule Interview</h3>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteReschedule} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                Rescheduling interview for <strong className="text-white">{rescheduleTarget.candidateName}</strong> (
                {rescheduleTarget.roundName}).
              </div>

              <div>
                <label className="block text-slate-400 mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reschedule Reason</label>
                <textarea
                  rows={2}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {rescheduleLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW CANDIDATE RESCHEDULE REQUEST */}
      {reviewRequestTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-amber-600/70 bg-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Review Candidate Reschedule Request</h3>
              </div>
              <button
                onClick={() => setReviewRequestTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400">Candidate:</div>
                <div className="font-bold text-white text-sm">{reviewRequestTarget.candidateName}</div>
                <div className="text-slate-400 pt-1">Reason:</div>
                <div className="text-amber-200 bg-amber-950/40 p-2 rounded-lg border border-amber-900/50">
                  "{reviewRequestTarget.rescheduleReason || 'Personal conflict'}"
                </div>
                {reviewRequestTarget.rescheduleRequestedDate && (
                  <div className="pt-1">
                    <span className="text-slate-400">Proposed New Schedule: </span>
                    <strong className="text-white font-mono">
                      {new Date(reviewRequestTarget.rescheduleRequestedDate).toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={reviewActionLoading}
                  onClick={() => handleRespondToCandidateReschedule('decline')}
                  className="px-3.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 cursor-pointer"
                >
                  Decline Request
                </button>
                <button
                  type="button"
                  disabled={reviewActionLoading}
                  onClick={() => handleRespondToCandidateReschedule('accept')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {reviewActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Accept New Time</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CANCEL INTERVIEW MODAL */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl border border-rose-900/70 bg-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>Cancel Interview Session</span>
              </h3>
              <button onClick={() => setCancelTarget(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteCancel} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                Are you sure you want to cancel the interview with{' '}
                <strong className="text-white">{cancelTarget.candidateName}</strong>? This will notify the candidate.
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cancellation Reason</label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
                >
                  Keep Interview
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {cancelLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
