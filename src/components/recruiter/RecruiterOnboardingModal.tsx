import React, { useState, useEffect } from 'react';
import { User, Company, RecruiterProfile } from '../../types';
import { apiClient } from '../../services/api';
import {
  Building,
  UserCheck,
  Briefcase,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Globe,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface RecruiterOnboardingModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onSuccess: (profile: RecruiterProfile, company: Company) => void;
  onDismiss?: () => void;
}

export const RecruiterOnboardingModal: React.FC<RecruiterOnboardingModalProps> = ({
  isOpen,
  currentUser,
  onSuccess,
  onDismiss,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal & Professional Identity
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [title, setTitle] = useState('Head of Technical Talent');
  const [phone, setPhone] = useState('+1 (415) 890-4321');
  const [department, setDepartment] = useState('Talent Acquisition');

  // Step 2: Company Affiliation
  const [companyAction, setCompanyAction] = useState<'join' | 'create'>('join');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedCompanies, setVerifiedCompanies] = useState<Array<{ id: string; name: string; slug: string; industry: string; isVerified: boolean; logoUrl?: string; sizeRange?: string }>>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('comp_synthetix');
  const [searching, setSearching] = useState(false);

  // New Company Fields
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('Artificial Intelligence & Autonomous Systems');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('https://');
  const [newCompanySize, setNewCompanySize] = useState('50-200 employees');
  const [newCompanyHq, setNewCompanyHq] = useState('San Francisco, CA');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyAction === 'join') {
      loadCompanies('');
    }
  }, [companyAction]);

  const loadCompanies = async (q: string) => {
    setSearching(true);
    try {
      const list = await apiClient.searchVerifiedCompanies(q);
      setVerifiedCompanies(list);
      if (list.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(list[0].id);
      }
    } catch (err) {
      console.warn('Failed to search companies:', err);
    } finally {
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !title.trim()) {
      setError('Please provide your full name and job title.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCompleteOnboarding = async () => {
    setError(null);
    if (companyAction === 'join' && !selectedCompanyId) {
      setError('Please choose an existing verified employer to join.');
      return;
    }
    if (companyAction === 'create' && (!newCompanyName.trim() || !newCompanyIndustry.trim())) {
      setError('Please provide the company name and industry.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        title: title.trim(),
        phone: phone.trim(),
        department: department.trim(),
        companyAction,
      };

      if (companyAction === 'join') {
        payload.companyId = selectedCompanyId;
      } else {
        payload.newCompany = {
          name: newCompanyName.trim(),
          industry: newCompanyIndustry.trim(),
          website: newCompanyWebsite.trim(),
          sizeRange: newCompanySize,
          headquarters: newCompanyHq.trim(),
          description: newCompanyDesc.trim(),
        };
      }

      const res = await apiClient.completeRecruiterOnboarding(payload);
      setStep(3);
      setTimeout(() => {
        onSuccess(res.profile, res.company);
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Onboarding failed. Please review your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto google-photos-scrollbar">
        
        {/* Onboarding Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Recruiter Workspace Onboarding</h2>
              <p className="text-xs text-slate-400">Establish your organization profile and hiring authority</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded-full ${step === 1 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>1. Identity</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className={`px-2 py-0.5 rounded-full ${step === 2 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'}`}>2. Company</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className={`px-2 py-0.5 rounded-full ${step === 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>3. Done</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="mt-6 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Step 1: Your Personal & Professional Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email (Verified)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || 'recruiter@synthetix.com'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Recruiting Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Head of Talent Acquisition"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Department / Squad</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Technical Talent & Engineering Operations"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30"
              >
                <span>Continue to Company Setup</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: COMPANY SELECTION */}
        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Step 2: Company Affiliation & Organization Setup
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* Toggle: Join vs Create */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => setCompanyAction('join')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  companyAction === 'join'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Join Verified Company</span>
              </button>
              <button
                type="button"
                onClick={() => setCompanyAction('create')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  companyAction === 'create'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>Register New Company</span>
              </button>
            </div>

            {/* SUB-FLOW A: JOIN EXISTING VERIFIED COMPANY */}
            {companyAction === 'join' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      loadCompanies(e.target.value);
                    }}
                    placeholder="Search verified enterprise organizations..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto google-photos-scrollbar">
                  {searching ? (
                    <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                      <span>Searching verified employers...</span>
                    </div>
                  ) : verifiedCompanies.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 border border-slate-800 rounded-xl bg-slate-950/60">
                      No verified companies found matching "{searchQuery}". You can switch to "Register New Company".
                    </div>
                  ) : (
                    verifiedCompanies.map((comp) => {
                      const isSelected = selectedCompanyId === comp.id;
                      return (
                        <div
                          key={comp.id}
                          onClick={() => setSelectedCompanyId(comp.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm'
                              : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0">
                              {comp.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white flex items-center gap-2 truncate">
                                <span>{comp.name}</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>Verified</span>
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {comp.industry} · {comp.sizeRange || 'Enterprise'}
                              </div>
                            </div>
                          </div>

                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-400 bg-cyan-500 text-white' : 'border-slate-700'}`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* SUB-FLOW B: REGISTER NEW COMPANY */
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    New companies register in <strong>Draft status</strong>. You can configure your profile and prepare job drafts, while public publishing will unlock once compliance verification evidence is submitted.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="e.g. Apex Frontier Labs"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Industry Sector *</label>
                    <input
                      type="text"
                      required
                      value={newCompanyIndustry}
                      onChange={(e) => setNewCompanyIndustry(e.target.value)}
                      placeholder="e.g. Generative AI & Autonomous Cloud"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Official Website</label>
                    <input
                      type="url"
                      value={newCompanyWebsite}
                      onChange={(e) => setNewCompanyWebsite(e.target.value)}
                      placeholder="https://company.ai"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Company Size</label>
                    <select
                      value={newCompanySize}
                      onChange={(e) => setNewCompanySize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="1-10 employees">1-10 employees (Startup)</option>
                      <option value="11-50 employees">11-50 employees (Growth)</option>
                      <option value="51-200 employees">51-200 employees (Scale-up)</option>
                      <option value="201-500 employees">201-500 employees (Mid-Market)</option>
                      <option value="500+ employees">500+ employees (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Headquarters Location</label>
                  <input
                    type="text"
                    value={newCompanyHq}
                    onChange={(e) => setNewCompanyHq(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brief Description</label>
                  <textarea
                    rows={2}
                    value={newCompanyDesc}
                    onChange={(e) => setNewCompanyDesc(e.target.value)}
                    placeholder="Describe mission, engineering stack, or products..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Configuring Workspace...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Onboarding</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-950/80 border border-emerald-600 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recruiter Workspace Activated</h3>
              <p className="text-xs text-slate-300 mt-1">
                Welcome aboard, {fullName}! Initializing your company hiring console and live pipeline.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
