import React, { useState, useEffect } from 'react';
import { TeamMemberItem, TeamInvitation, Company, CompanyTeamRole } from '../../types';
import { apiClient } from '../../services/api';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Lock,
  RefreshCw,
  Trash2,
  Clock,
  Send,
  UserX,
  UserCheck2,
  Key,
} from 'lucide-react';

interface TeamManagementViewProps {
  company: Company | null;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({ company }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'matrix'>('members');
  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CompanyTeamRole>('recruiter');
  const [inviteTitle, setInviteTitle] = useState('Senior Technical Recruiter');
  const [inviteDepartment, setInviteDepartment] = useState('Talent Acquisition');
  const [submitting, setSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Change Role Modal State
  const [roleModalMember, setRoleModalMember] = useState<TeamMemberItem | null>(null);
  const [newRole, setNewRole] = useState<CompanyTeamRole>('recruiter');
  const [roleUpdating, setRoleUpdating] = useState(false);

  useEffect(() => {
    loadTeamAndInvitations();
  }, []);

  const loadTeamAndInvitations = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await apiClient.getCompanyTeamDetailed();
      setTeam(data.team || []);
      setInvitations(data.invitations || []);
      setStats(data.stats || null);
    } catch (err: any) {
      console.warn('Failed to load team data:', err);
      setErrorNotice(err?.message || 'Failed to retrieve company team records.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setErrorNotice('Colleague email address is required.');
      return;
    }

    setSubmitting(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const res = await apiClient.inviteTeamMemberDetailed({
        email: inviteEmail.trim(),
        role: inviteRole,
        title: inviteTitle.trim(),
        department: inviteDepartment.trim(),
      });
      setSuccessNotice(`Invitation token generated and sent to ${inviteEmail}. Valid for 48 hours.`);
      setInviteModalOpen(false);
      setInviteEmail('');
      await loadTeamAndInvitations();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to dispatch invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      const updated = await apiClient.resendTeamInvitation(invitationId);
      setSuccessNotice(`Invitation refreshed for ${updated.email}. Token expiration extended by 48 hours.`);
      await loadTeamAndInvitations();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to resend invitation.');
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return;
    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      await apiClient.revokeTeamInvitation(invitationId);
      setSuccessNotice('Invitation successfully revoked.');
      await loadTeamAndInvitations();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to revoke invitation.');
    }
  };

  const handleToggleStatus = async (member: TeamMemberItem) => {
    const nextStatus = member.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = nextStatus === 'suspended' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${actionLabel} ${member.name}'s access?`)) return;

    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      await apiClient.updateTeamMemberStatus(member.id, nextStatus);
      setSuccessNotice(`Member status updated to ${nextStatus}.`);
      await loadTeamAndInvitations();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to update member status.');
    }
  };

  const handleOpenRoleModal = (member: TeamMemberItem) => {
    setRoleModalMember(member);
    setNewRole(member.role);
    setErrorNotice(null);
  };

  const handleSaveRole = async () => {
    if (!roleModalMember) return;
    setRoleUpdating(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      await apiClient.updateTeamMemberRole(roleModalMember.id, newRole);
      setSuccessNotice(`Updated role for ${roleModalMember.name} to ${newRole.toUpperCase()}.`);
      setRoleModalMember(null);
      await loadTeamAndInvitations();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to update member role.');
    } finally {
      setRoleUpdating(false);
    }
  };

  const handleRemoveMember = async (member: TeamMemberItem) => {
    if (!confirm(`Are you sure you want to completely remove ${member.name} from the company? This action will immediately revoke all access.`)) {
      return;
    }
    setErrorNotice(null);
    setSuccessNotice(null);
    try {
      await apiClient.removeTeamMember(member.id);
      setSuccessNotice(`${member.name} has been removed from the organization.`);
      await loadTeamAndInvitations();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to remove team member.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
              RBAC & Team Governance
            </span>
            <span className="text-xs text-slate-400">Phase 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-cyan-400" />
            Company Team & Permissions Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage company members, assign hiring roles, configure expiring invites, and enforce last-owner protection for {company?.name || 'your company'}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadTeamAndInvitations}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Team List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => {
              setErrorNotice(null);
              setInviteModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
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
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Members</div>
            <div className="text-xl font-bold text-white mt-1">{stats.activeMembers}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Suspended Members</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{stats.suspendedMembers}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Invitations</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">{stats.pendingInvitations}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Owners & Admins</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">
              {(stats.roleBreakdown?.owner || 0) + (stats.roleBreakdown?.admin || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'members'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Members ({team.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'invitations'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Invitations ({invitations.length})
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Role Permissions Matrix
        </button>
      </div>

      {/* TAB 1: TEAM MEMBERS LIST */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {team.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/60">
              No team members registered for this company.
            </div>
          ) : (
            team.map((member) => (
              <div
                key={member.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-slate-900/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  member.status === 'suspended'
                    ? 'border-amber-900/40 opacity-75'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md">
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{member.name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                          member.role === 'owner'
                            ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                            : member.role === 'admin'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                            : member.role === 'hiring_manager'
                            ? 'bg-purple-950 text-purple-300 border-purple-700/60'
                            : member.role === 'interviewer'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                      {member.status === 'suspended' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {member.title} {member.department ? `· ${member.department}` : ''} ·{' '}
                      <span className="text-slate-300 font-mono text-[11px]">{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Permissions */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => handleOpenRoleModal(member)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                  >
                    Change Role
                  </button>

                  <button
                    onClick={() => handleToggleStatus(member)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      member.status === 'suspended'
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/80'
                        : 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900/80'
                    }`}
                  >
                    {member.status === 'suspended' ? 'Activate' : 'Suspend'}
                  </button>

                  <button
                    onClick={() => handleRemoveMember(member)}
                    className="p-1.5 rounded-xl border border-rose-900/40 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Remove Member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PENDING INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-3">
          {invitations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/60">
              No pending invitations. Click "Invite Team Member" above to invite new colleagues.
            </div>
          ) : (
            invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{inv.email}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                      {inv.role}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      PENDING
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Invited by <span className="text-slate-300">{inv.inviterName}</span> · Expires:{' '}
                    <span className="text-cyan-400 font-mono">
                      {new Date(inv.expiresAt).toLocaleDateString()} {new Date(inv.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Token: <span className="text-slate-400 select-all">{inv.token}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResendInvitation(inv.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Resend (48h)</span>
                  </button>
                  <button
                    onClick={() => handleRevokeInvitation(inv.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-900/40 text-xs text-rose-300 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Revoke</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Governance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-amber-400 uppercase">Company Owner</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Full authority over company profile, verification, team invitations, role changes, member removal, and all requisitions. Cannot be removed if last owner.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-cyan-400 uppercase">Admin</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Company administration, team invitations, job publishing and closing, recruiter assignments, and audit trail inspection.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-white uppercase">Recruiter</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Requisition management, application review, candidate pipeline staging, scheduling interviews, and issuing job offers.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-purple-400 uppercase">Hiring Manager</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Reviews assigned department candidates, provides stage recommendations, reviews interview feedback, and participates in offer approvals.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-emerald-400 uppercase">Interviewer</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Conducts assigned interview rounds, reviews candidate resume snapshot, and submits confidential structured evaluation scorecards.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase">Read-Only Member</div>
              <p className="text-[11px] text-slate-400 mt-1">
                View-only access to approved company requisitions and non-confidential department candidate rosters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Invite Colleague</h3>
                <p className="text-xs text-slate-400">Generate secure 48h invitation for {company?.name}</p>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="colleague@synthetix.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">RBAC Role & Authority</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as CompanyTeamRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="recruiter">Recruiter (Jobs, candidates, interviews, offers)</option>
                  <option value="hiring_manager">Hiring Manager (Department reviews, approvals)</option>
                  <option value="interviewer">Interviewer (Scheduled rounds & scorecards)</option>
                  <option value="admin">Administrator (Company profile, verification, team)</option>
                  <option value="owner">Company Owner (Full administrative governance)</option>
                  <option value="member">General Member (Read-only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title / Designation</label>
                <input
                  type="text"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g. Senior Technical Recruiter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="e.g. Engineering Recruiting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Dispatch Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {roleModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100">
            <button
              onClick={() => setRoleModalMember(null)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Change Team Role</h3>
            <p className="text-xs text-slate-400 mb-4">
              Update RBAC permissions for <span className="text-white font-semibold">{roleModalMember.name}</span>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as CompanyTeamRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="owner">Owner (Full administrative rights)</option>
                  <option value="admin">Admin (Company and requisition management)</option>
                  <option value="recruiter">Recruiter (Jobs, applicants, offers)</option>
                  <option value="hiring_manager">Hiring Manager (Reviews & approvals)</option>
                  <option value="interviewer">Interviewer (Feedback scorecards)</option>
                  <option value="member">Member (Read-only)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRoleModalMember(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={roleUpdating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/30"
                >
                  {roleUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
