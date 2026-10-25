/**
 * CareerSphere AI — Global Footer
 * Quiet, informative footer with legal boundaries and milestone progress.
 */
import React from 'react';
import { Sparkles, ArrowUpRight, Github, FileText, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'candidate' | 'recruiter' | 'admin' | 'architecture') => void;
  onOpenHealth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenHealth }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-10">
          
          {/* Brand & mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span>CareerSphere AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Full-stack AI recruitment platform and career copilot. Engineered on Python Django REST Framework, PostgreSQL, and React.
            </p>
            <div className="pt-2 text-slate-500 font-mono text-[11px]">
              Phase 1 Milestone Foundation
            </div>
          </div>

          {/* Role Workspaces */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">Workspaces</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('candidate')}
                  className="hover:text-slate-200 transition-colors cursor-pointer text-left"
                >
                  Candidate & Student Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('recruiter')}
                  className="hover:text-slate-200 transition-colors cursor-pointer text-left"
                >
                  Recruiter & Hiring Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-slate-200 transition-colors cursor-pointer text-left"
                >
                  Administrator Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('architecture')}
                  className="hover:text-slate-200 transition-colors cursor-pointer text-left text-cyan-400"
                >
                  System Architecture Explorer
                </button>
              </li>
            </ul>
          </div>

          {/* Infrastructure & Governance */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">Governance & API</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenHealth}
                  className="hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Backend Health Probe</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('architecture')}
                  className="hover:text-slate-200 transition-colors cursor-pointer"
                >
                  OpenAPI 3.1 Specification
                </button>
              </li>
              <li>
                <span className="text-slate-500">10MB Private Resume Enclave</span>
              </li>
              <li>
                <span className="text-slate-500">Explicit Candidate Consent Policy</span>
              </li>
            </ul>
          </div>

          {/* Milestone Status */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">Roadmap Progress</h4>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Phase 1 Foundation Active</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Django modular architecture, Docker orchestration, and initial React dashboards verified.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 CareerSphere AI Platform. Apache 2.0 Licensed.
          </div>
          <div className="flex items-center gap-4">
            <span>Non-Bypass Safety Protocol</span>
            <span>·</span>
            <span>Zero-Pill Typography Compliant</span>
            <span>·</span>
            <span>Official ATS API Submissions Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
