import React, { useState, useEffect } from 'react';
import { RecruiterAuditLogItem } from '../../types';
import { apiClient } from '../../services/api';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const RecruiterAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<RecruiterAuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [page, actionFilter, statusFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const res = await apiClient.getRecruiterAuditLogs({
        page,
        limit,
        search: search.trim() || undefined,
        action: actionFilter || undefined,
        status: statusFilter || undefined,
      });
      setLogs(res.logs);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.warn('Failed to load audit logs:', err);
      setErrorNotice(err?.message || 'Failed to retrieve company audit history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAuditLogs();
  };

  return (
    <div className="space-y-6 text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
              SOC-2 / Compliance Trail
            </span>
            <span className="text-xs text-slate-400">Company Scoped · Immutable</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Security & Recruiter Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable company ledger recording recruiter invitations, RBAC transitions, offer events, candidate exports, and interview lifecycle changes.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, or summary..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Action Category Filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">All Action Types</option>
          <option value="TEAM_INVITE_SENT">Team Invitations</option>
          <option value="TEAM_ROLE_CHANGED">Role / RBAC Updates</option>
          <option value="TEAM_MEMBER_STATUS_CHANGED">Member Status Updates</option>
          <option value="TEAM_MEMBER_REMOVED">Member Revocations</option>
          <option value="OFFER_CREATED">Offer Lifecycle</option>
          <option value="INTERVIEW_SCHEDULED">Interview Lifecycle</option>
          <option value="ANALYTICS_REPORT_EXPORTED">Data Exports</option>
          <option value="JOB_CREATED">Requisitions</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="WARNING">WARNING</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {errorNotice && (
        <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-cyan-400 mb-2" />
                    Fetching authorized audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              SUCCESS
                            </span>
                          ) : log.status === 'WARNING' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
                              <AlertTriangle className="h-3 w-3" />
                              WARNING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
                              <XCircle className="h-3 w-3" />
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-cyan-300">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="font-semibold text-white truncate max-w-[140px]">{log.actor}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.ipAddress}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={log.summary}>
                          {log.summary}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-950/60 border-y border-slate-800/80">
                          <td colSpan={6} className="p-4 text-xs">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1.5">
                              <div><span className="text-cyan-400 font-bold">Event ID:</span> {log.id}</div>
                              <div><span className="text-cyan-400 font-bold">Resource Type:</span> {log.resourceType}</div>
                              <div><span className="text-cyan-400 font-bold">Company Scope:</span> {log.companyId || 'N/A'}</div>
                              {log.metadata && (
                                <div className="mt-2">
                                  <span className="text-cyan-400 font-bold">Safe Metadata:</span>
                                  <pre className="mt-1 p-2 bg-slate-950 rounded border border-slate-850 text-slate-400 overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="py-3 px-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-semibold">{logs.length}</span> of{' '}
            <span className="text-white font-semibold">{total}</span> events
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
