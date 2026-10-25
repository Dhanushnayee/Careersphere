import React from 'react';
import { Job, Company } from '../../types';
import {
  X,
  Building,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Send,
  Eye,
} from 'lucide-react';

interface JobPreviewModalProps {
  job: Job | null;
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (job: Job) => void;
}

export const JobPreviewModal: React.FC<JobPreviewModalProps> = ({
  job,
  company,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !job) return null;

  const isVerified = (company?.isVerified && company?.verificationStatus === 'verified') || job.company_details?.isVerified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="shrink-0 px-6 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Eye className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Perspective Preview</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CANDIDATE DETAIL CARD */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth google-photos-scrollbar p-6 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800/80">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-semibold">
                    {job.jobRef || `REQ-${job.id.slice(-6)}`}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{company?.name || job.company_name || 'Synthetix Dynamics'}</span>
                  </span>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Employer</span>
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{job.title}</h1>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{job.location}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                    <span>{job.workplaceType} ({job.employmentType})</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{job.minExperienceYears}+ yrs experience</span>
                  </span>
                  <span>·</span>
                  <span className="text-cyan-300 font-semibold">
                    {job.isSalaryDisclosed !== false
                      ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} ${job.salaryCurrency}`
                      : 'Competitive Compensation'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-center">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Application Deadline</div>
                <div className="text-xs font-bold text-white mt-0.5">{new Date(job.deadline).toLocaleDateString()}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Accepting Resumes</div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {(job.skillsRequired || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-200 text-xs font-medium">
                    {s}
                  </span>
                ))}
                {(job.preferredSkills || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
                    {s} (Preferred)
                  </span>
                ))}
              </div>
            </div>

            {/* Narrative */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">About the Role</div>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-slate-900/60 border border-slate-800/70">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Responsibilities</div>
                <ul className="text-xs text-slate-200 list-disc pl-5 space-y-1">
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Qualifications</div>
                <ul className="text-xs text-slate-200 list-disc pl-5 space-y-1">
                  {job.qualifications.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Perks & Benefits</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mock Apply Button for candidate perception */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Candidates click "Apply with Resume" in the Candidate Portal to submit documents and answer screening questions.
              </div>
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl bg-cyan-600/60 text-white text-xs font-semibold flex items-center gap-2 cursor-not-allowed shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Apply with CareerSphere Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Preview is read-only.
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(job);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer"
              >
                Edit in Wizard
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
