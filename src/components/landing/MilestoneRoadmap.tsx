/**
 * CareerSphere AI — Seven-Milestone Roadmap Explorer
 * Interactive visualization of the 7 project phases.
 */
import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

export const MilestoneRoadmap: React.FC = () => {
  const milestones = [
    {
      phase: 'Phase 1',
      title: 'Project Foundation & Initial Implementation',
      status: 'completed',
      deliverables: 'Monorepo, 10 Django modular apps, PostgreSQL/Redis config, Celery queues, Docker Compose, React UI, OpenAPI docs, Unit tests.',
    },
    {
      phase: 'Phase 2',
      title: 'Authentication & Role-Based Access Control',
      status: 'next',
      deliverables: 'Custom User model activation, Email OTP verification, JWT HTTP-only tokens, Candidate/Recruiter/Admin permission guards.',
    },
    {
      phase: 'Phase 3',
      title: 'Jobs & Applications Lifecycle Management',
      status: 'planned',
      deliverables: 'Full CRUD job requisitions, faceted search, candidate application tracking, recruiter pipeline funnel.',
    },
    {
      phase: 'Phase 4',
      title: 'AI Resume Analysis & Resume Copilot',
      status: 'planned',
      deliverables: 'Document parsing (PDF/DOCX), Google Gemini model integration, ATS scoring, skill-gap extraction, context-aware bullet rewrites.',
    },
    {
      phase: 'Phase 5',
      title: 'Application Automation & Safe Orchestration',
      status: 'planned',
      deliverables: 'Partner ATS API submissions (Greenhouse, Lever), candidate consent gating, idempotency, safe manual handoffs for unsupported portals.',
    },
    {
      phase: 'Phase 6',
      title: 'Administration, Quality Assurance & Audit',
      status: 'planned',
      deliverables: 'Moderation consoles, security log auditing, end-to-end load testing, rate limiting, and compliance verification.',
    },
    {
      phase: 'Phase 7',
      title: 'Production Deployment & Release Delivery',
      status: 'planned',
      deliverables: 'Cloud Run / Kubernetes deployment manifests, production SSL, CDN edge caching, final ZIP archive delivery.',
    },
  ];

  return (
    <section className="py-16 border-t border-slate-800/80 bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Disciplined Engineering Progression
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            The Seven-Milestone Roadmap
          </h2>
          <p className="text-slate-300 text-sm">
            Phase 1 establishes a pristine architecture capable of supporting all planned capabilities without structural refactoring.
          </p>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="space-y-4">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : item.status === 'next'
                  ? 'border-indigo-500/40 bg-indigo-950/20'
                  : 'border-slate-800 bg-slate-900/50 opacity-80'
              }`}
            >
              <div className="space-y-1.5 md:max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{item.phase}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.deliverables}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.status === 'completed' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Phase 1 Verified</span>
                  </span>
                )}
                {item.status === 'next' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/60">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Next Milestone</span>
                  </span>
                )}
                {item.status === 'planned' && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-md border border-slate-700/40">
                    <Circle className="h-3.5 w-3.5 text-slate-500" />
                    <span>Planned</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
