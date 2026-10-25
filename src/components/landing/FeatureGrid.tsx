/**
 * CareerSphere AI — Feature Grid
 * Highlights core platform capabilities without false claims.
 */
import React from 'react';
import { FileText, Sparkles, Send, Users, ShieldAlert, Cpu } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5 text-indigo-400" />,
      title: 'AI Resume Diagnostics & Copilot',
      subtitle: 'ATS Compliance & Keyword Alignment',
      description:
        'Analyzes uploaded resumes against target job specifications, highlighting missing technical keywords, quantifying impact metrics, and offering context-aware rewrite recommendations.',
      phaseTag: 'Planned Phase 4 Engine',
    },
    {
      icon: <FileText className="h-5 w-5 text-cyan-400" />,
      title: 'Semantic Job Match Engine',
      subtitle: 'Multi-Factor Requisition Scoring',
      description:
        'Replaces crude keyword filtering with dense vector embeddings that map candidate capabilities directly to senior roles, salary preferences, and preferred workplace cultures.',
      phaseTag: 'Planned Phase 3 Matching',
    },
    {
      icon: <Send className="h-5 w-5 text-emerald-400" />,
      title: 'Compliant Multi-Job Automation',
      subtitle: 'Official API Gateways & Safe Manual Fallback',
      description:
        'Automates multi-job applications exclusively through verified partner APIs (Greenhouse, Lever) with mandatory consent checks, idempotency keys, and verified confirmation receipts.',
      phaseTag: 'Planned Phase 5 Workflow',
    },
    {
      icon: <Users className="h-5 w-5 text-violet-400" />,
      title: 'HR Talent Radar & Pipeline',
      subtitle: 'Recruiter Screening Command Center',
      description:
        'Empowers talent acquisition teams to publish structured requisitions, inspect AI-ranked candidate shortlists, and manage applicants across structured hiring stages.',
      phaseTag: 'Planned Phase 3 Recruiter Portal',
    },
    {
      icon: <ShieldAlert className="h-5 w-5 text-amber-400" />,
      title: 'Zero-Bypass Security Architecture',
      subtitle: 'Strict Authentication & Privacy Enclave',
      description:
        'Strictly prohibits bypassing CAPTCHA, MFA, OTP, or third-party access controls. Resumes are stored in secure 10MB private enclaves with comprehensive immutable audit logging.',
      phaseTag: 'Active in Phase 1 & 2',
    },
    {
      icon: <Cpu className="h-5 w-5 text-pink-400" />,
      title: 'Celery Distributed Task Pipeline',
      subtitle: 'Asynchronous Document Processing',
      description:
        'Engineered with Redis message brokers and background worker queues to process large resume documents, extract structural text, and execute LLM inferences with high throughput.',
      phaseTag: 'Configured in Phase 1',
    },
  ];

  return (
    <section className="py-16 border-t border-slate-800/80 bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Core Platform Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
            Engineered for Precision, Scale, and Ethical Compliance
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Every layer of CareerSphere AI is architected to balance candidate empowerment with rigorous application security and recruiter workflow transparency.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 transition-all hover:border-slate-700 hover:bg-slate-900 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/60">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{feature.phaseTag}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <div className="text-xs text-indigo-300 font-medium">{feature.subtitle}</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                Django Subsystem: apps.{feature.title.toLowerCase().includes('resume') ? 'resumes' : feature.title.toLowerCase().includes('automation') ? 'automation' : feature.title.toLowerCase().includes('security') ? 'audit' : 'jobs'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
