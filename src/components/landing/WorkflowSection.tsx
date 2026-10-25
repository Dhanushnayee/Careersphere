/**
 * CareerSphere AI — Mechanism-to-Outcome Workflow
 * Highlights the end-to-end journey for both candidates and recruiters.
 */
import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle, Send, PlusCircle, Search, UserCheck } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter'>('candidate');

  const candidateSteps = [
    {
      num: '01',
      title: 'Upload & Parse Resume',
      desc: 'Submit your resume in PDF, DOCX, or TXT format (up to 10MB). The backend validates security limits and initiates asynchronous extraction.',
      icon: <Upload className="h-4 w-4 text-indigo-400" />,
      mechanism: 'apps.resumes · Document Validation',
    },
    {
      num: '02',
      title: 'AI Resume Optimization',
      desc: 'Inspect your baseline ATS score, review extracted competencies, identify critical skill gaps, and implement targeted bullet point recommendations.',
      icon: <Sparkles className="h-4 w-4 text-cyan-400" />,
      mechanism: 'apps.ai_copilot · Gemini Analysis',
    },
    {
      num: '03',
      title: 'Targeted Job Matching',
      desc: 'Discover vetted job openings with transparent match percentages, compensation ranges, workplace modalities, and verified recruiter profiles.',
      icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
      mechanism: 'apps.jobs · Semantic Match Score',
    },
    {
      num: '04',
      title: 'Compliant Multi-Job Submission',
      desc: 'Review submission payloads, provide explicit consent, and dispatch applications via verified partner ATS APIs with guaranteed delivery confirmation.',
      icon: <Send className="h-4 w-4 text-violet-400" />,
      mechanism: 'apps.automation · Consent Engine',
    },
  ];

  const recruiterSteps = [
    {
      num: '01',
      title: 'Publish Role Requisitions',
      desc: 'Define key responsibilities, target skills, compensation bands, and remote eligibility with structured JSON validation.',
      icon: <PlusCircle className="h-4 w-4 text-indigo-400" />,
      mechanism: 'apps.jobs · Requisition Engine',
    },
    {
      num: '02',
      title: 'Automated Candidate Shortlisting',
      desc: 'Incoming resumes are pre-scored against requirements, ranking qualified applicants while filtering out unqualified applications.',
      icon: <Search className="h-4 w-4 text-cyan-400" />,
      mechanism: 'apps.applications · Pipeline Funnel',
    },
    {
      num: '03',
      title: 'Talent Evaluation & Decision',
      desc: 'Review applicants through interview scheduling, note collaboration, and stage transitions with full audit logging.',
      icon: <UserCheck className="h-4 w-4 text-emerald-400" />,
      mechanism: 'apps.audit · Stage Orchestration',
    },
  ];

  const steps = activeTab === 'candidate' ? candidateSteps : recruiterSteps;

  return (
    <section className="py-16 border-t border-slate-800/80 bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & Segmented Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left space-y-2 max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              End-to-End Workflow Architecture
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Transparent, Step-by-Step Execution
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Explore how CareerSphere AI structures the complete lifecycle from document upload to final placement.
            </p>
          </div>

          {/* Interactive segmented controls (button elements complying with design guidelines) */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg self-start shrink-0">
            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'candidate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Candidate Journey (4 Steps)
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'recruiter'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recruiter Pipeline (3 Steps)
            </button>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-slate-600">{step.num}</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-indigo-400">
                {step.mechanism}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
