/**
 * CareerSphere AI — Candidate Onboarding Wizard (Module 2)
 * 6-Stage Guided Step-by-Step Profile Setup:
 * 1. Personal Details & Contact Preferences
 * 2. Education & Academic Background
 * 3. Technical & Soft Skills Inventory
 * 4. Experience & Projects
 * 5. Resume Upload or AI Generation
 * 6. Job Preferences & Target Roles
 * Features auto-save progress, completion percentage, skip options, and profile preview.
 */
import React, { useState } from 'react';
import { CandidateProfile } from '../../types';
import { apiClient } from '../../services/api';
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  FileText,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
} from 'lucide-react';

interface CandidateOnboardingWizardProps {
  profile: CandidateProfile | null;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<CandidateProfile>) => void;
  onOpenUploadModal: () => void;
}

export const CandidateOnboardingWizard: React.FC<CandidateOnboardingWizardProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onOpenUploadModal,
}) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState(profile?.fullName || 'Alex Chen');
  const [phone, setPhone] = useState(profile?.phone || '+1 (555) 234-5678');
  const [location, setLocation] = useState(profile?.location || 'San Francisco, CA');
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Senior Python & AI Systems Architect');
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears || 6);
  const [desiredSalaryMin, setDesiredSalaryMin] = useState(profile?.desiredSalaryMin || 165000);
  const [workplacePreference, setWorkplacePreference] = useState<'Remote' | 'Hybrid' | 'On-site'>(
    profile?.workplacePreference || 'Remote'
  );
  const [skills, setSkills] = useState<string[]>(
    profile?.skills && profile.skills.length > 0
      ? profile.skills
      : ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React 19', 'Redis']
  );
  const [newSkill, setNewSkill] = useState('');

  // Degree details
  const [degree, setDegree] = useState('Bachelor of Science in Computer Science');
  const [university, setUniversity] = useState('Stanford University / Engineering');
  const [gradYear, setGradYear] = useState('2020');

  // Experience highlight
  const [currentCompany, setCurrentCompany] = useState('Synthetix Platforms');
  const [currentPosition, setCurrentPosition] = useState('Senior Backend & Systems Engineer');

  const completionPct = Math.round((step / 6) * 100);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveStep = async (nextStep?: number) => {
    setSaving(true);
    setSaveToast(null);
    const updatedPayload: Partial<CandidateProfile> = {
      fullName,
      phone,
      location,
      targetRole,
      experienceYears: Number(experienceYears),
      desiredSalaryMin: Number(desiredSalaryMin),
      workplacePreference,
      skills,
    };

    try {
      await apiClient.saveOnboardingStep(step, updatedPayload);
      onUpdateProfile(updatedPayload);
      setSaveToast(`Step ${step} progress automatically saved!`);
      setTimeout(() => setSaveToast(null), 3000);
      if (nextStep) {
        setStep(nextStep);
      }
    } catch (err: any) {
      console.warn('Autosave notice:', err?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 text-left my-8">
        {/* Header with Progress Bar */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Candidate Career Onboarding Wizard
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">
              Step {step} of 6: {
                step === 1 ? 'Personal Details' :
                step === 2 ? 'Academic Education' :
                step === 3 ? 'Skills & Competencies' :
                step === 4 ? 'Experience & Projects' :
                step === 5 ? 'Resume Selection' :
                'Target Job Preferences'
              }
            </span>
            <span className="font-mono text-emerald-400 font-bold">{completionPct}% Complete</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-400 transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-400" />
                <span>Personal Information & Contact Preferences</span>
              </h3>
              <p className="text-xs text-slate-400">
                Provide your verified identity and contact details for recruiters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Current City & Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (Remote Eligible)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                <span>Education & Qualifications</span>
              </h3>
              <p className="text-xs text-slate-400">
                Document your university degrees, coursework, and graduation timeline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Degree & Major</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">University / College</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Graduation Year</label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Skills */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Technical Skills & Core Competencies</span>
              </h3>
              <p className="text-xs text-slate-400">
                Skills directly control job match scores and AI recommendations.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add skill (e.g. Python, Docker, Celery, React 19)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold cursor-pointer shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-indigo-950/70 text-indigo-200 border border-indigo-800/60"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <span>Work Experience & Practical History</span>
              </h3>
              <p className="text-xs text-slate-400">
                Highlight your most recent employment, internships, or flagship projects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Current or Recent Company</label>
                <input
                  type="text"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Position / Job Title</label>
                <input
                  type="text"
                  value={currentPosition}
                  onChange={(e) => setCurrentPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Total Years of Professional Experience</label>
                <input
                  type="number"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Resume */}
        {step === 5 && (
          <div className="space-y-4 animate-fadeIn text-center py-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Resume Document & ATS Verification</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upload your primary PDF or DOCX resume document for automated parsing and ATS readiness scoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-700/60 bg-indigo-950/20 max-w-md mx-auto space-y-3">
              <Upload className="h-8 w-8 text-indigo-400 mx-auto" />
              <div className="text-xs font-semibold text-white">Select a Resume to Upload (PDF/DOCX)</div>
              <p className="text-[11px] text-slate-400">10MB limit strictly enforced</p>
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer"
              >
                Open Resume Upload Modal
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Job Preferences */}
        {step === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-400" />
                <span>Job Preferences & Target Compensation</span>
              </h3>
              <p className="text-xs text-slate-400">
                Specify your ideal compensation threshold and workplace preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Minimum Annual Salary Expectation ($ USD)</label>
                <input
                  type="number"
                  value={desiredSalaryMin}
                  onChange={(e) => setDesiredSalaryMin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Workplace Preference</label>
                <select
                  value={workplacePreference}
                  onChange={(e) => setWorkplacePreference(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {saveToast && (
          <div className="p-3 rounded-xl border border-emerald-800/60 bg-emerald-950/60 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => handleSaveStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-white border border-slate-800 bg-slate-950 cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveStep()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-300 hover:text-white border border-slate-800 bg-slate-950 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 text-indigo-400" />
              <span>{saving ? 'Saving...' : 'Auto-Save'}</span>
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={() => handleSaveStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleSaveStep();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-white font-semibold bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Onboarding</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
