/**
 * CareerSphere AI — Hero Section
 * Distinct role workspaces: Candidate, HR Recruiter, and System Admin Enclave.
 * Features dedicated entrance buttons, Resend OTP security, and n8n autonomous multi-apply.
 */
import React from 'react';
import { UserRole } from '../../types';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Search,
  FileCheck,
  Layers,
  UserCheck,
  Briefcase,
  Zap,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigateCandidate: () => void;
  onNavigateRecruiter: () => void;
  onNavigateAdmin: () => void;
  onNavigateArchitecture: () => void;
  onOpenLogin: (role?: UserRole) => void;
  onOpenRegister: (role?: 'candidate' | 'recruiter') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateCandidate,
  onNavigateRecruiter,
  onNavigateAdmin,
  onNavigateArchitecture,
  onOpenLogin,
  onOpenRegister,
}) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-cyan-500/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Phase 1-6 Architecture Badge */}
            <div className="text-xs font-semibold text-indigo-400 tracking-wide uppercase flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Full-Stack Autonomous Talent Engine</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400 normal-case font-normal">Resend OTP · n8n Multi-Apply · Gemini Flash</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] [text-wrap:balance]">
              Role-Separated Talent Architecture with Autonomous Applications.
            </h1>

            {/* Subtitle / Value Proposition */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              CareerSphere AI enforces strict role isolation: Candidates upload resumes, get Gemini ATS match scoring, and trigger autonomous n8n multi-job applications. HR Recruiters post verified listings and manage hiring pipelines. System Administrators govern platform metrics and security.
            </p>

            {/* Primary Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenLogin('candidate')}
                className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Candidate Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenLogin('recruiter')}
                className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500 bg-slate-900/80 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>HR Recruiter Portal</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLogin('admin')}
                className="flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500 bg-slate-950 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Admin Hub</span>
              </button>
            </div>

            {/* Architectural Trust Markers */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Resend Real Email OTP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>1-Toggle n8n Multi-Apply</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Zero-Trust Role Isolation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Diagnostic Showcase Vector Box */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4 text-left">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">careersphere.ai/workspace</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live System
                </span>
              </div>

              {/* Vector Diagnostic Preview */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">AI ATS Semantic Analyzer</span>
                    <span className="font-mono text-indigo-400 font-bold">Gemini Flash</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>ATS Compatibility Rating</span>
                      <span className="font-mono text-slate-200 tabular-nums font-bold">88 / 100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full w-[88%]" />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Autonomous n8n Multi-Apply</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      1-Toggle Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dispatches candidate resume and digital consent package to multiple target positions in parallel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated 3-Portal Entrance Cards ("separate the admin, candidate, and requiter with sepaarete login and create account") */}
        <div className="border-t border-slate-800/80 pt-10">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Select Your Dedicated Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each workspace provides strictly matched capabilities with separate login, registration, and security controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* 1. Candidate Portal Card */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-indigo-900/40 bg-gradient-to-b from-indigo-950/20 to-slate-900/60 hover:border-indigo-500/60 transition-all space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    Candidate Only
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">Candidate Career Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload resumes, run ATS keyword matching, edit drafts with Resume Copilot, and trigger autonomous n8n multi-job applications.
                </p>
                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Gemini ATS Resume Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Resume Copilot Diff Editor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Autonomous n8n Multi-Apply Engine</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLogin('candidate')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Candidate Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRegister('candidate')}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {/* 2. HR Recruiter Portal Card */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-cyan-950/20 to-slate-900/60 hover:border-cyan-500/60 transition-all space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    Recruiter Only
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">HR & Recruiter Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Post new job openings, manage active and draft listings, evaluate applicant match scores, and coordinate hiring pipelines.
                </p>
                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Job Posting & Salary Spec Studio</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Applicant Review Kanban Pipeline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Company Profile & Verification</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLogin('recruiter')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>HR Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRegister('recruiter')}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register HR</span>
                </button>
              </div>
            </div>

            {/* 3. Admin Governance Card */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/20 to-slate-900/60 hover:border-emerald-500/60 transition-all space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    Admin Only
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">System Admin Enclave</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real database metrics, recruiter verification moderation, job review, account suspensions, and immutable security audit logs.
                </p>
                <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Real Database Platform Metrics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Recruiter Verification & Job Moderation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Security Audit Logs & Superuser Guard</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLogin('admin')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin Hub Login</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
