import React, { useState, useEffect } from 'react';
import { RecruiterAnalyticsData, Job } from '../../types';
import { apiClient } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Award,
  ChevronRight,
  PieChart,
  UserCheck,
} from 'lucide-react';

interface RecruiterAnalyticsViewProps {
  jobs?: Job[];
  onNavigateSubView?: (module: string, subPart?: string) => void;
}

export const RecruiterAnalyticsView: React.FC<RecruiterAnalyticsViewProps> = ({
  jobs = [],
  onNavigateSubView,
}) => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [data, setData] = useState<RecruiterAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [range, selectedJobId]);

  const loadAnalytics = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const res = await apiClient.getRecruiterAnalytics({
        range,
        jobId: selectedJobId || undefined,
      });
      setData(res);
    } catch (err: any) {
      console.warn('Failed to load recruiter analytics:', err);
      setErrorNotice(err?.message || 'Failed to retrieve hiring analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      const csvText = await apiClient.exportAnalyticsReportCsv({
        range,
        jobId: selectedJobId || undefined,
      });

      // Trigger browser download
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CareerSphere_Hiring_Report_${range}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessNotice('CSV report generated and downloaded securely.');
    } catch (err: any) {
      console.warn('Failed to export CSV report:', err);
      setErrorNotice(err?.message || 'Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 text-left">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
              Executive BI & ATS Telemetry
            </span>
            <span className="text-xs text-slate-400">Phase 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-cyan-400" />
            Recruiter Analytics & Hiring Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorized company-scoped funnel metrics, stage conversions, recruiter workloads, and formula-safe CSV reporting.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range picker */}
          <div className="inline-flex rounded-xl bg-slate-950 border border-slate-800 p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  range === r
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Time' : `Last ${r.toUpperCase()}`}
              </button>
            ))}
          </div>

          {/* Job filter dropdown */}
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Requisitions</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* CSV Export button */}
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-3.5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Requisitions */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-800/60 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Open Requisitions</span>
              <Briefcase className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.activeJobs}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                / {data.summary.totalJobs} total
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
              <span className="text-amber-400">{data.summary.draftJobs} drafts</span>
              <span>·</span>
              <span className="text-slate-400">{data.summary.closedJobs} closed</span>
            </div>
          </div>

          {/* Card 2: Applications */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-800/60 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Candidate Pipeline</span>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.totalApplications}
            </div>
            <div className="text-[11px] text-indigo-300 mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              <span>+{data.summary.newApplications7d} new this week</span>
            </div>
          </div>

          {/* Card 3: Interviews & Offers */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-800/60 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Interviews & Offers</span>
              <Calendar className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.interviewsScheduled}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                interviews
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-2">
              <span>{data.summary.offersIssued} offers extended</span>
              <span>·</span>
              <span className="text-white font-semibold">{data.summary.hiresRecorded} hires</span>
            </div>
          </div>

          {/* Card 4: Velocity & Conversion */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-800/60 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Time-to-Hire & Conversion</span>
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {data.summary.avgTimeToHireDays !== null
                ? `${data.summary.avgTimeToHireDays}d`
                : 'Pending'}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                avg velocity
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Overall conversion rate:{' '}
              <span className="text-cyan-400 font-semibold">{data.summary.overallConversionRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Hiring Funnel */}
      {data && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Hiring Pipeline Funnel & Stage Drop-Off
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pass-through conversion tracking from initial application submission to recorded hires.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
              Funnel Velocity: {data.funnel.conversionRates.overall}% Overall
            </div>
          </div>

          {/* Funnel Visual Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: '1. Applied', count: data.funnel.applied, color: 'border-slate-700 bg-slate-950/70 text-slate-300', rate: null },
              { label: '2. Under Review', count: data.funnel.underReview, color: 'border-blue-900/60 bg-blue-950/30 text-blue-300', rate: data.funnel.conversionRates.appliedToReview },
              { label: '3. Shortlisted', count: data.funnel.shortlisted, color: 'border-indigo-900/60 bg-indigo-950/30 text-indigo-300', rate: data.funnel.conversionRates.reviewToShortlist },
              { label: '4. Interview', count: data.funnel.interviewScheduled, color: 'border-cyan-900/60 bg-cyan-950/30 text-cyan-300', rate: data.funnel.conversionRates.shortlistToInterview },
              { label: '5. Offer', count: data.funnel.offerExtended, color: 'border-amber-900/60 bg-amber-950/30 text-amber-300', rate: data.funnel.conversionRates.interviewToOffer },
              { label: '6. Hired', count: data.funnel.hired, color: 'border-emerald-900/60 bg-emerald-950/30 text-emerald-300', rate: data.funnel.conversionRates.offerToHired },
            ].map((step, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${step.color} flex flex-col justify-between`}>
                <div>
                  <div className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">{step.label}</div>
                  <div className="text-2xl font-bold text-white mt-1">{step.count}</div>
                </div>
                {step.rate !== null && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Pass Rate:</span>
                    <span className="font-mono font-bold text-cyan-400">{step.rate}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Requisitions & Team Workload Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Requisitions by Volume */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-cyan-400" />
                Requisition Volume Ranking
              </h2>
              <span className="text-[11px] text-slate-400">Applications Received</span>
            </div>

            {data.topJobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No requisitions recorded in this period.
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {data.topJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">{job.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{job.department}</span>
                        <span>·</span>
                        <span className={`capitalize ${job.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <div className="text-xs font-bold text-white">{job.applicationsCount}</div>
                        <div className="text-[9px] text-slate-400">Apps</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-cyan-400">{job.interviewsCount}</div>
                        <div className="text-[9px] text-slate-400">Interviews</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-400">{job.hiresCount}</div>
                        <div className="text-[9px] text-slate-400">Hires</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recruiter & Team Workload */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-400" />
                Recruiter Workload & Action Matrix
              </h2>
              <span className="text-[11px] text-slate-400">Active Load</span>
            </div>

            {data.teamWorkload.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active team members found.
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {data.teamWorkload.map((member) => (
                  <div
                    key={member.userId}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{member.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                          {member.role}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {member.assignedJobsCount} assigned requisitions
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right shrink-0">
                      <div className="px-2 py-1 rounded bg-amber-950/40 border border-amber-900/40">
                        <div className="text-xs font-bold text-amber-300">{member.pendingReviewsCount}</div>
                        <div className="text-[8px] text-amber-400/80 uppercase">Pending</div>
                      </div>
                      <div className="px-2 py-1 rounded bg-cyan-950/40 border border-cyan-900/40">
                        <div className="text-xs font-bold text-cyan-300">{member.scheduledInterviewsCount}</div>
                        <div className="text-[8px] text-cyan-400/80 uppercase">Interviews</div>
                      </div>
                      <div className="px-2 py-1 rounded bg-emerald-950/40 border border-emerald-900/40">
                        <div className="text-xs font-bold text-emerald-300">{member.offersHandledCount}</div>
                        <div className="text-[8px] text-emerald-400/80 uppercase">Offers</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Trend Line (Bars) */}
      {data && data.applicationTrends.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Application Volume Trajectory ({range.toUpperCase()})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily candidate inbound application trajectory across active requisitions.
              </p>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-32 pt-4 border-b border-slate-800">
            {(() => {
              const maxCount = Math.max(...data.applicationTrends.map((t) => t.count), 1);
              return data.applicationTrends.map((trend, i) => {
                const heightPct = Math.max((trend.count / maxCount) * 100, 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                    <div className="text-[9px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {trend.count}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-cyan-600 to-indigo-500 rounded-t-sm group-hover:from-cyan-400 group-hover:to-indigo-400 transition-colors"
                      title={`${trend.date}: ${trend.count} applications`}
                    />
                  </div>
                );
              });
            })()}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>{data.applicationTrends[0]?.date}</span>
            <span>{data.applicationTrends[data.applicationTrends.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};
