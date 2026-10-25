import React, { useState, useEffect } from 'react';
import { RecruiterDashboardStats, RecruiterActivity, Job } from '../../types';
import { apiClient } from '../../services/api';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface RecruiterDashboardViewProps {
  onNavigateSubView: (view: string, part?: string) => void;
  onOpenCreateJobModal: () => void;
}

export const RecruiterDashboardView: React.FC<RecruiterDashboardViewProps> = ({
  onNavigateSubView,
  onOpenCreateJobModal,
}) => {
  const [stats, setStats] = useState<RecruiterDashboardStats | null>(null);
  const [activities, setActivities] = useState<RecruiterActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, actData] = await Promise.all([
          apiClient.getRecruiterDashboardStats(),
          apiClient.getRecruiterActivities(),
        ]);
        setStats(statsData);
        setActivities(actData);
      } catch (err) {
        console.warn('Failed to load recruiter dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isVerified = stats?.company?.isVerified;
  const verificationStatus = stats?.company?.verificationStatus || (isVerified ? 'verified' : 'draft');

  return (
    <div className="space-y-6 text-slate-100 text-left">
      
      {/* Recruiter Workspace Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>Recruiter Operations Command · Phase 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3 flex-wrap">
            <span>{stats?.company?.name || 'Synthetix Dynamics'}</span>
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
              isVerified
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : verificationStatus === 'pending_review'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {verificationStatus}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Telemetry and requisitions scoped strictly to your authorized employer organization. Monitoring active requisitions, applicant progression, and compliance status.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigateSubView('company', 'verification')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Verification Status</span>
          </button>

          <button
            onClick={onOpenCreateJobModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post Requisition</span>
          </button>
        </div>
      </div>

      {/* Verification Notice Banner if not verified */}
      {!isVerified && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          verificationStatus === 'pending_review'
            ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            : 'bg-slate-900/90 border-cyan-800/50 text-cyan-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-900/40 border border-amber-700/50 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {verificationStatus === 'pending_review'
                  ? 'Verification Evidence Under Administrative Review'
                  : 'Company Registration Unverified · Draft Publishing Mode Active'}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {verificationStatus === 'pending_review'
                  ? 'Your evidence submission is queued for compliance verification. Public job publishing unlocks upon approval.'
                  : 'You can draft requisitions and prepare interview questions. Complete verification to publish public jobs.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateSubView('company', 'verification')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all shrink-0 cursor-pointer shadow-sm shadow-cyan-600/30"
          >
            {verificationStatus === 'pending_review' ? 'View Review Details' : 'Submit Evidence'}
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Jobs */}
        <div
          onClick={() => onNavigateSubView('jobs', 'all')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Requisitions</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {stats ? stats.totalJobs : '—'}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{stats?.activeJobs || 0} active</span>
            <span>·</span>
            <span>{stats?.draftJobs || 0} drafts</span>
            <span>·</span>
            <span>{stats?.closedJobs || 0} closed</span>
          </div>
        </div>

        {/* Total Applications */}
        <div
          onClick={() => onNavigateSubView('applicants', 'pipeline')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {stats ? stats.totalApplications : '—'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-300">
            <span>{stats?.newApplications || 0} new candidates</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div
          onClick={() => onNavigateSubView('applicants', 'shortlisted')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Shortlisted</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            {stats ? stats.shortlistedCandidates : '—'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Passed initial ATS screen
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div
          onClick={() => onNavigateSubView('interviews', 'calendar')}
          className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Interviews</span>
            <div className="h-8 w-8 rounded-lg bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {stats ? stats.upcomingInterviews : '—'}
          </div>
          <div className="mt-2 text-[11px] text-violet-300">
            Upcoming scheduled rounds
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Action Items + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Actionable Next Steps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Pending Actions & Operational Alerts</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {stats?.pendingActions?.length || 0} Actions
              </span>
            </div>

            {(!stats?.pendingActions || stats.pendingActions.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-slate-800/60 rounded-xl bg-slate-950/40">
                All hiring pipeline queues are clear and in sync. No immediate action required.
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.pendingActions.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onNavigateSubView(act.targetTab, act.targetSubPart)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-600/50 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{act.title}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          act.priority === 'high'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        }`}>
                          {act.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed truncate">
                        {act.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Resolve</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Module Shortcuts */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Operations Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateSubView('jobs', 'all')}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <Briefcase className="h-4 w-4 text-cyan-400 mb-1" />
                <div className="text-xs font-bold text-white">Requisitions</div>
                <div className="text-[10px] text-slate-400">Manage openings</div>
              </button>

              <button
                onClick={() => onNavigateSubView('applicants', 'pipeline')}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <Users className="h-4 w-4 text-indigo-400 mb-1" />
                <div className="text-xs font-bold text-white">Candidates</div>
                <div className="text-[10px] text-slate-400">Review applicants</div>
              </button>

              <button
                onClick={() => onNavigateSubView('company', 'profile')}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">Company Profile</div>
                <div className="text-[10px] text-slate-400">Branding & details</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Recruiter Activity */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Recent Activity</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Live DB Stream</span>
            </div>

            {activities.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-slate-800/60 rounded-xl bg-slate-950/40">
                No recent activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{act.recruiterName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {act.description}
                    </p>
                    <div className="text-[10px] font-mono text-cyan-400/80 uppercase">
                      {act.action}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
