/**
 * CareerSphere AI — Strict Role Access Gate & Gateway Component
 * Enforces strict least-privilege boundary separation ("evaru ememi cheyyalo adi matrame cheyyali").
 * Provides customized entry points and clear restriction advisories.
 */
import React from 'react';
import { User, UserRole } from '../../types';
import {
  ShieldAlert,
  UserCheck,
  Briefcase,
  Shield,
  ArrowRight,
  LogIn,
  UserPlus,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface RoleAccessGateProps {
  requiredRole: UserRole;
  currentUser: User | null;
  onOpenLogin: (role: UserRole) => void;
  onOpenRegister: (role: 'candidate' | 'recruiter') => void;
  onQuickDemoLogin: (role: UserRole) => void;
  onSwitchToUserWorkspace: (role: UserRole) => void;
  onBypassSandbox: () => void;
}

export const RoleAccessGate: React.FC<RoleAccessGateProps> = ({
  requiredRole,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onQuickDemoLogin,
  onSwitchToUserWorkspace,
  onBypassSandbox,
}) => {
  const roleConfig = {
    candidate: {
      name: 'Candidate Workspace',
      badge: 'Job Seeker & Student Enclave',
      themeColor: 'indigo',
      borderColor: 'border-indigo-800/80',
      bgColor: 'bg-indigo-950/30',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500',
      icon: <UserCheck className="h-6 w-6 text-indigo-400" />,
      tagline: 'AI Resume Diagnostics, ATS Scoring, Gemini Copilot & Autonomous n8n Multi-Apply',
      responsibilities: [
        'Upload & parse PDF/DOCX resumes with OCR scanned document detection',
        'Analyze resume completeness and rewrite bullets with Google Gemini',
        'Personalized job recommendations with explainable match scores',
        'Autonomous n8n Multi-Job Apply: 1-click batch dispatch with live pipeline logs',
      ],
      demoEmail: 'candidate@careersphere.ai',
    },
    recruiter: {
      name: 'HR Recruiter Workspace',
      badge: 'Employer & Hiring Manager Enclave',
      themeColor: 'cyan',
      borderColor: 'border-cyan-800/80',
      bgColor: 'bg-cyan-950/30',
      btnColor: 'bg-cyan-600 hover:bg-cyan-500',
      icon: <Briefcase className="h-6 w-6 text-cyan-400" />,
      tagline: 'Job Posting Studio, Applicant Pipeline Kanban, & Technical Interview Scheduling',
      responsibilities: [
        'Post and manage enterprise job listings with salary & workplace filters',
        'Review applicant submissions, match scores, and parsed resume profiles',
        'Update application stages (Reviewing, Shortlisted, Interview Scheduled)',
        'Coordinate technical screens with Google Meet video links and interviewer notes',
      ],
      demoEmail: 'recruiter@synthetix.com',
    },
    admin: {
      name: 'System Administrator Enclave',
      badge: 'Governance & Security Console',
      themeColor: 'emerald',
      borderColor: 'border-emerald-800/80',
      bgColor: 'bg-emerald-950/30',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500',
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      tagline: 'Platform Telemetry, User Suspensions, Recruiter Verification, & Tamper-Evident Audit Logs',
      responsibilities: [
        'Comprehensive user directory with account suspension & reactivation',
        'Review and approve employer recruiter company verification requests',
        'Job posting moderation and policy compliance audits',
        'Live tamper-evident security audit logs and background automation health monitoring',
      ],
      demoEmail: 'admin@careersphere.ai',
    },
  };

  const target = roleConfig[requiredRole];

  // Case 1: User is logged in, but with a DIFFERENT role
  if (currentUser && currentUser.role !== requiredRole) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-left">
        <div className="rounded-2xl border border-rose-900/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-rose-950/80 text-rose-400 flex items-center justify-center border border-rose-800/60 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-rose-400">
                Access Boundary Guard · Role Separation Enforced
              </div>
              <h2 className="text-xl font-bold text-white">
                {target.name} is Restricted to {requiredRole.toUpperCase()} Accounts
              </h2>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span>Active Signed-In Account:</span>
              <span className="font-mono text-white font-semibold">
                {currentUser.name} ({currentUser.email})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Session Role:</span>
              <span className="font-mono uppercase font-bold text-indigo-400 px-2 py-0.5 rounded bg-slate-800">
                {currentUser.role}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Strict Boundary Policy (Evaru ememi cheyyalo adi matrame cheyyali):</strong>{' '}
            To prevent cross-role data leaks and maintain hiring integrity, candidates cannot access employer applicant pipelines or moderation tools, and recruiters cannot edit candidate resumes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onSwitchToUserWorkspace(currentUser.role)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Return to My {currentUser.role.toUpperCase()} Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onOpenLogin(requiredRole)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In as {requiredRole.toUpperCase()}</span>
            </button>

            <button
              onClick={onBypassSandbox}
              title="Temporary evaluator preview"
              className="w-full sm:w-auto text-xs text-slate-400 hover:text-slate-200 underline sm:ml-auto cursor-pointer"
            >
              Demo Preview View
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User is unauthenticated (Not logged in)
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-left">
      <div className={`rounded-3xl border ${target.borderColor} ${target.bgColor} p-8 md:p-10 shadow-2xl backdrop-blur-xl space-y-8`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center border border-slate-800 shadow-md shrink-0">
              {target.icon}
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-900 border border-slate-800 text-slate-300">
                {target.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {target.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {target.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onOpenLogin(requiredRole)}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white ${target.btnColor} shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2`}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to {requiredRole.toUpperCase()} Portal</span>
            </button>

            {requiredRole !== 'admin' && (
              <button
                onClick={() => onOpenRegister(requiredRole as 'candidate' | 'recruiter')}
                className="px-6 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create {requiredRole.toUpperCase()} Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Capabilities Checklist */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dedicated Capabilities in this Workspace:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {target.responsibilities.map((resp, i) => (
              <div key={i} className="flex items-start gap-2.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{resp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Fast Evaluation Sandbox */}
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Instant Evaluator Sandbox</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Quick evaluation access using pre-verified demo credentials ({target.demoEmail}).
            </p>
          </div>

          <button
            onClick={() => onQuickDemoLogin(requiredRole)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Launch 1-Click Demo {requiredRole.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
