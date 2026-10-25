/**
 * CareerSphere AI — Role Comparison Matrix
 * Concrete comparison of features and capabilities for Candidates and Recruiters.
 */
import React from 'react';
import { User, Briefcase, Check, ArrowRight } from 'lucide-react';

interface RoleComparisonProps {
  onNavigateCandidate: () => void;
  onNavigateRecruiter: () => void;
}

export const RoleComparison: React.FC<RoleComparisonProps> = ({
  onNavigateCandidate,
  onNavigateRecruiter,
}) => {
  const comparisonItems = [
    {
      feature: 'Resume Optimization & Parsing',
      candidate: 'AI ATS scoring, missing keyword detection, bullet rewrite suggestions',
      recruiter: 'Standardized candidate CV parsing, skills matrix, format normalization',
    },
    {
      feature: 'Job Discovery & Requisition',
      candidate: 'Semantic vector recommendations, salary filters, remote tagging',
      recruiter: 'Structured requisition builder, skill requirement tagging, status controls',
    },
    {
      feature: 'Application Workflow',
      candidate: '1-click submission to partner ATS with explicit consent and status tracking',
      recruiter: 'Ranked candidate queue, interview stage progress, feedback notes',
    },
    {
      feature: 'Security & Verification',
      candidate: 'Private 10MB document enclave, zero credentials stored',
      recruiter: 'Verified company profile, role-based hiring team seat permissions',
    },
  ];

  return (
    <section className="py-16 border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Dedicated Workspaces
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Tailored Experiences for Candidates and Hiring Teams
          </h2>
          <p className="text-slate-300 text-sm">
            Whether applying to dream roles or building an engineering team, CareerSphere AI provides purpose-built tooling.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Candidate Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For Candidates & Students</h3>
                    <div className="text-xs text-slate-400">Accelerate your career search</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-indigo-400">Phase 1 Demo Active</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Resume Copilot preview with ATS and keyword diagnostics</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verified job listings with compensation transparency</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time application status tracking across multiple companies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Safe manual handoffs when direct API integration is unavailable</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={onNavigateCandidate}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Explore Candidate Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Recruiter Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For HR Recruiters & Hiring Managers</h3>
                    <div className="text-xs text-slate-400">Streamline talent pipelines</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">Phase 1 Demo Active</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Structured requisition publishing with required skill tags</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Candidate scoring matrix and AI match distribution analysis</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Multi-stage candidate pipeline management and interview tracking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Compliance audit log tracking all recruiter screening actions</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={onNavigateRecruiter}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Explore Recruiter Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
