import React, { useState, useEffect } from 'react';
import { Job, Company, ScreeningQuestion, AIAssistJobPayload } from '../../types';
import { apiClient } from '../../services/api';
import {
  Briefcase,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Building,
  DollarSign,
  Calendar,
  FileText,
  HelpCircle,
  Eye,
  Save,
  Send,
  Globe,
  MapPin,
  Clock,
  Layers,
  Wand2,
  Check,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface JobCreationWizardProps {
  company: Company | null;
  jobToEdit?: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: (job: Job) => void;
  onNavigateToVerification?: () => void;
}

export const JobCreationWizard: React.FC<JobCreationWizardProps> = ({
  company,
  jobToEdit,
  isOpen,
  onClose,
  onJobSaved,
  onNavigateToVerification,
}) => {
  const isVerified = company?.isVerified && company?.verificationStatus === 'verified';

  // Step state (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Taxonomy states
  const [taxonomySkills, setTaxonomySkills] = useState<string[]>([]);
  const [taxonomyCategories, setTaxonomyCategories] = useState<string[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Form Fields - Step 1: Role Basics & Workplace
  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [jobRef, setJobRef] = useState(jobToEdit?.jobRef || `REQ-${Math.floor(100000 + Math.random() * 900000)}`);
  const [department, setDepartment] = useState(jobToEdit?.department || 'Engineering');
  const [workplaceType, setWorkplaceType] = useState<'Remote' | 'Hybrid' | 'On-site'>(jobToEdit?.workplaceType || 'Remote');
  const [employmentType, setEmploymentType] = useState<'Full-time' | 'Contract' | 'Part-time' | 'Internship'>(jobToEdit?.employmentType || 'Full-time');
  const [city, setCity] = useState(jobToEdit?.city || 'San Francisco');
  const [state, setState] = useState(jobToEdit?.state || 'CA');
  const [country, setCountry] = useState(jobToEdit?.country || 'United States');
  const [location, setLocation] = useState(jobToEdit?.location || 'San Francisco, CA (Remote)');
  const [openingsCount, setOpeningsCount] = useState<number>(jobToEdit?.openingsCount || 1);

  // Form Fields - Step 2: Experience, Qualifications & Skills
  const [minExperienceYears, setMinExperienceYears] = useState<number>(jobToEdit?.minExperienceYears || 3);
  const [maxExperienceYears, setMaxExperienceYears] = useState<number>(jobToEdit?.maxExperienceYears || 6);
  const [isFresherEligible, setIsFresherEligible] = useState<boolean>(jobToEdit?.isFresherEligible || false);
  const [educationLevel, setEducationLevel] = useState<string>(jobToEdit?.educationLevel || "Bachelor's Degree");
  const [skillsRequired, setSkillsRequired] = useState<string[]>(jobToEdit?.skillsRequired || ['Python', 'Django REST Framework', 'PostgreSQL', 'Docker']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(jobToEdit?.preferredSkills || ['Kubernetes', 'Redis', 'CI/CD Pipelines']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customPreferredSkillInput, setCustomPreferredSkillInput] = useState('');
  const [qualificationsText, setQualificationsText] = useState(
    jobToEdit?.qualifications?.join('\n') ||
      'Proven track record building high-throughput distributed systems in production.\nSolid knowledge of relational database modeling and query performance tuning.\nExperience writing clean, maintainable TypeScript and Python.'
  );
  const [preferredQualificationsText, setPreferredQualificationsText] = useState(
    jobToEdit?.preferredQualifications?.join('\n') ||
      'Familiarity with container orchestration (Kubernetes, Docker).\nExperience in high-growth, remote-first software organizations.'
  );

  // Form Fields - Step 3: Description & Responsibilities
  const [aboutRole, setAboutRole] = useState(
    jobToEdit?.description ||
      'We are looking for a Senior Software Engineer to lead the architectural evolution of our distributed backend infrastructure. You will design, build, and optimize scalable APIs, asynchronous task workers, and real-time data services powering our global platform.'
  );
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    jobToEdit?.responsibilities?.join('\n') ||
      'Architect, develop, and maintain high-throughput backend services and APIs.\nCollaborate closely with product, design, and infrastructure engineers to deliver resilient features.\nDrive observability, automated test coverage, and site reliability standards.\nConduct technical design reviews, mentor teammates, and cultivate engineering excellence.'
  );

  // Form Fields - Step 4: Compensation & Benefits
  const [salaryMin, setSalaryMin] = useState<number>(jobToEdit?.salaryMin || 140000);
  const [salaryMax, setSalaryMax] = useState<number>(jobToEdit?.salaryMax || 185000);
  const [salaryCurrency, setSalaryCurrency] = useState<string>(jobToEdit?.salaryCurrency || 'USD');
  const [payFrequency, setPayFrequency] = useState<'annual' | 'monthly' | 'hourly'>(jobToEdit?.payFrequency || 'annual');
  const [isSalaryDisclosed, setIsSalaryDisclosed] = useState<boolean>(jobToEdit?.isSalaryDisclosed !== false);
  const [benefitsList, setBenefitsList] = useState<string[]>(
    jobToEdit?.benefits || [
      'Comprehensive Medical, Dental & Vision Coverage (100% Employer Paid)',
      '401(k) Retirement Match up to 4%',
      'Flexible Remote Work Policy & $1,500 Home Office Setup Stipend',
      'Annual Learning & Professional Development Budget ($2,000/yr)',
      'Unlimited Paid Time Off (PTO) + 12 Company Holidays',
    ]
  );
  const [customBenefitInput, setCustomBenefitInput] = useState('');

  // Form Fields - Step 5: Application Process & Screening Questions
  const [openingDate, setOpeningDate] = useState(jobToEdit?.openingDate || new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState(
    jobToEdit?.deadline || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>(
    jobToEdit?.screeningQuestions || [
      {
        id: 'sq_1',
        question: 'How many years of professional experience do you have in backend systems engineering?',
        required: true,
        questionType: 'number',
        idealAnswer: '3',
      },
      {
        id: 'sq_2',
        question: 'Are you authorized to work in the United States without employer sponsorship?',
        required: true,
        questionType: 'yes_no',
        idealAnswer: 'Yes',
      },
    ]
  );
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'yes_no' | 'number'>('text');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionIdeal, setNewQuestionIdeal] = useState('');

  // AI Assistant Modal State
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiActiveAction, setAiActiveAction] = useState<AIAssistJobPayload['action']>('generate');
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any | null>(null);

  // Load taxonomy on mount
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [skillsRes, catsRes] = await Promise.all([
          apiClient.getTaxonomySkills().catch(() => ({ skills: [] })),
          apiClient.getTaxonomyCategories().catch(() => []),
        ]);
        if (skillsRes?.skills?.length) setTaxonomySkills(skillsRes.skills);
        if (catsRes?.length) setTaxonomyCategories(catsRes);
      } catch (err) {
        console.warn('Taxonomy load fallback:', err);
      }
    }
    loadTaxonomy();
  }, []);

  // Sync combined location when city, state, or workplace type changes
  useEffect(() => {
    if (workplaceType === 'Remote') {
      setLocation(`${city ? city + ', ' : ''}${state ? state + ' ' : ''}(Remote)`);
    } else {
      setLocation(`${city}, ${state}`);
    }
  }, [city, state, workplaceType]);

  // Skill management
  const handleAddRequiredSkill = (skill: string) => {
    const clean = skill.trim();
    if (clean && !skillsRequired.includes(clean)) {
      setSkillsRequired((prev) => [...prev, clean]);
      setIsDirty(true);
    }
    setCustomSkillInput('');
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setSkillsRequired((prev) => prev.filter((s) => s !== skill));
    setIsDirty(true);
  };

  const handleAddPreferredSkill = (skill: string) => {
    const clean = skill.trim();
    if (clean && !preferredSkills.includes(clean)) {
      setPreferredSkills((prev) => [...prev, clean]);
      setIsDirty(true);
    }
    setCustomPreferredSkillInput('');
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setPreferredSkills((prev) => prev.filter((s) => s !== skill));
    setIsDirty(true);
  };

  // Benefit management
  const handleAddBenefit = () => {
    const clean = customBenefitInput.trim();
    if (clean && !benefitsList.includes(clean)) {
      setBenefitsList((prev) => [...prev, clean]);
      setCustomBenefitInput('');
      setIsDirty(true);
    }
  };

  const handleRemoveBenefit = (b: string) => {
    setBenefitsList((prev) => prev.filter((item) => item !== b));
    setIsDirty(true);
  };

  // Screening questions management
  const handleAddScreeningQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: ScreeningQuestion = {
      id: `sq_${Date.now()}`,
      question: newQuestionText.trim(),
      required: newQuestionRequired,
      questionType: newQuestionType,
      idealAnswer: newQuestionIdeal.trim() || undefined,
    };
    setScreeningQuestions((prev) => [...prev, newQ]);
    setNewQuestionText('');
    setNewQuestionIdeal('');
    setIsDirty(true);
  };

  const handleRemoveScreeningQuestion = (id: string) => {
    setScreeningQuestions((prev) => prev.filter((q) => q.id !== id));
    setIsDirty(true);
  };

  // Validation before step change
  const validateCurrentStep = (): boolean => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 3) {
        setErrorMessage('Job title is required and must be at least 3 characters.');
        return false;
      }
      if (!department.trim()) {
        setErrorMessage('Department is required.');
        return false;
      }
      if (openingsCount < 1) {
        setErrorMessage('Number of openings must be at least 1.');
        return false;
      }
    } else if (currentStep === 2) {
      if (skillsRequired.length === 0) {
        setErrorMessage('Please specify at least one required skill.');
        return false;
      }
      if (minExperienceYears < 0) {
        setErrorMessage('Minimum experience cannot be negative.');
        return false;
      }
      if (maxExperienceYears < minExperienceYears) {
        setErrorMessage('Maximum experience cannot be less than minimum experience.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!aboutRole.trim() || aboutRole.trim().length < 20) {
        setErrorMessage('Job description is required and must be at least 20 characters.');
        return false;
      }
    } else if (currentStep === 4) {
      if (salaryMin < 0) {
        setErrorMessage('Minimum salary cannot be negative.');
        return false;
      }
      if (salaryMax < salaryMin) {
        setErrorMessage('Maximum salary cannot be less than minimum salary.');
        return false;
      }
    } else if (currentStep === 5) {
      if (!deadline) {
        setErrorMessage('Application deadline date is required.');
        return false;
      }
      const d = new Date(deadline.includes('T') ? deadline : `${deadline}T23:59:59Z`);
      if (isNaN(d.getTime())) {
        setErrorMessage('Invalid deadline date format.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // AI Assistant Call
  const triggerAiAssistant = async (action: AIAssistJobPayload['action']) => {
    setAiLoading(true);
    setAiActiveAction(action);
    setAiAssistantOpen(true);
    try {
      const res = await apiClient.aiAssistJob({
        action,
        title: title || 'Senior Software Engineer',
        department,
        workplaceType,
        employmentType,
        experienceYears: minExperienceYears,
        skills: skillsRequired,
        draftDescription: aboutRole,
        responsibilities: responsibilitiesText.split('\n').filter(Boolean),
        qualifications: qualificationsText.split('\n').filter(Boolean),
        benefits: benefitsList,
      });
      setAiGeneratedResult(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'AI Assistant unavailable. Resilient defaults applied.');
    } finally {
      setAiLoading(false);
    }
  };

  // Applying AI Results
  const applyAiResult = () => {
    if (!aiGeneratedResult) return;
    if (aiActiveAction === 'generate' && aiGeneratedResult.generatedText) {
      setAboutRole(aiGeneratedResult.generatedText);
      setIsDirty(true);
    } else if (aiActiveAction === 'improve' && aiGeneratedResult.improvedDescription) {
      setAboutRole(aiGeneratedResult.improvedDescription);
      setIsDirty(true);
    } else if (aiActiveAction === 'suggest_skills' && aiGeneratedResult.suggestedSkills) {
      const { required, preferred } = aiGeneratedResult.suggestedSkills;
      if (Array.isArray(required)) {
        setSkillsRequired((prev) => Array.from(new Set([...prev, ...required])));
      }
      if (Array.isArray(preferred)) {
        setPreferredSkills((prev) => Array.from(new Set([...prev, ...preferred])));
      }
      setIsDirty(true);
    } else if (aiActiveAction === 'suggest_responsibilities' && aiGeneratedResult.suggestedResponsibilities) {
      setResponsibilitiesText(aiGeneratedResult.suggestedResponsibilities.join('\n'));
      setIsDirty(true);
    } else if (aiActiveAction === 'suggest_screening_questions' && aiGeneratedResult.suggestedQuestions) {
      const newItems: ScreeningQuestion[] = aiGeneratedResult.suggestedQuestions.map((q: any, idx: number) => ({
        id: `sq_ai_${Date.now()}_${idx}`,
        question: q.question,
        required: q.required ?? true,
        questionType: q.questionType ?? 'text',
        idealAnswer: q.idealAnswer,
      }));
      setScreeningQuestions((prev) => [...prev, ...newItems]);
      setIsDirty(true);
    }
    setAiAssistantOpen(false);
  };

  // Submit Job
  const handleSubmitJob = async (action: 'save_draft' | 'submit_for_approval' | 'publish') => {
    if (!validateCurrentStep()) return;

    if (action === 'publish' && !isVerified) {
      setErrorMessage(
        'Company verification is pending or unverified. Active publishing requires approved employer verification. Please save as draft or complete company verification.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: Partial<Job> & { submissionAction: 'save_draft' | 'submit_for_approval' | 'publish' } = {
      title: title.trim(),
      jobRef,
      department,
      location,
      city,
      state,
      country,
      workplaceType,
      employmentType,
      openingsCount,
      minExperienceYears,
      maxExperienceYears,
      isFresherEligible,
      educationLevel,
      qualifications: qualificationsText.split('\n').map((s) => s.trim()).filter(Boolean),
      preferredQualifications: preferredQualificationsText.split('\n').map((s) => s.trim()).filter(Boolean),
      responsibilities: responsibilitiesText.split('\n').map((s) => s.trim()).filter(Boolean),
      salaryMin,
      salaryMax,
      salaryCurrency,
      payFrequency,
      isSalaryDisclosed,
      benefits: benefitsList,
      description: aboutRole,
      requirements: qualificationsText.split('\n').map((s) => s.trim()).filter(Boolean),
      skillsRequired,
      preferredSkills,
      openingDate,
      deadline,
      screeningQuestions,
      submissionAction: action,
    };

    try {
      let savedJob: Job;
      if (jobToEdit && jobToEdit.id) {
        savedJob = await apiClient.updateRecruiterJob(jobToEdit.id, payload);
      } else {
        savedJob = await apiClient.createRecruiterJob(payload);
      }
      setIsDirty(false);
      onJobSaved(savedJob);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save job requisition. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    { num: 1, label: 'Role Basics', icon: Briefcase },
    { num: 2, label: 'Skills & Experience', icon: Layers },
    { num: 3, label: 'Job Description', icon: FileText },
    { num: 4, label: 'Compensation', icon: DollarSign },
    { num: 5, label: 'Screening', icon: HelpCircle },
    { num: 6, label: 'Preview & Publish', icon: Eye },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* WIZARD HEADER */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {jobToEdit ? `Edit Requisition: ${jobToEdit.title}` : 'Create New Job Requisition'}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Requisition Reference: <span className="font-mono text-cyan-300 font-semibold">{jobRef}</span> · {company?.name || 'Synthetix Dynamics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDirty && (
              <span className="hidden sm:inline text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                Unsaved changes
              </span>
            )}
            <button
              onClick={() => {
                if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to exit the wizard?')) {
                  return;
                }
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PROGRESS STEPPER BAR */}
        <div className="shrink-0 px-6 py-3 border-b border-slate-800/80 bg-slate-950/50 overflow-x-auto google-photos-scrollbar">
          <div className="flex items-center justify-between min-w-[560px] gap-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = step.num < currentStep;
              const isCurrent = step.num === currentStep;

              return (
                <div key={step.num} className="flex items-center gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep || validateCurrentStep()) {
                        setCurrentStep(step.num);
                      }
                    }}
                    className={`flex items-center gap-2 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                        : isCompleted
                        ? 'text-cyan-300 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-white text-cyan-900'
                          : isCompleted
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : step.num}
                    </div>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className="h-0.5 flex-1 bg-slate-800 rounded mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR / NOTICE BANNER */}
        {errorMessage && (
          <div className="shrink-0 mx-6 mt-4 p-3 rounded-xl border border-rose-900/50 bg-rose-950/30 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Unverified Gating Notification */}
        {!isVerified && currentStep === 6 && (
          <div className="shrink-0 mx-6 mt-4 p-3.5 rounded-xl border border-amber-800/40 bg-amber-950/20 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Employer Verification Required for Public Publishing: </span>
                <span>
                  Your company status is <strong>{company?.verificationStatus || 'unverified'}</strong>. You can save this requisition as a <strong>Draft</strong> or submit it for review.
                </span>
              </div>
            </div>
            {onNavigateToVerification && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToVerification();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold shrink-0 cursor-pointer"
              >
                Verify Company
              </button>
            )}
          </div>
        )}

        {/* SCROLLABLE STEP CONTENT BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth google-photos-scrollbar p-6 space-y-6">
          
          {/* STEP 1: ROLE BASICS & WORKPLACE */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">Step 1 of 6</h3>
                <p className="text-lg font-bold text-white">Role Identification & Workplace Logistics</p>
                <p className="text-xs text-slate-400">Define the core position parameters, department hierarchy, and office arrangements.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Requisition Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Principal Distributed Systems Engineer"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Internal Reference ID</label>
                    <input
                      type="text"
                      value={jobRef}
                      onChange={(e) => {
                        setJobRef(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Business Unit</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Engineering / Core Platform"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Openings</label>
                    <input
                      type="number"
                      min={1}
                      value={openingsCount}
                      onChange={(e) => {
                        setOpeningsCount(Math.max(1, parseInt(e.target.value, 10) || 1));
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Workplace Arrangement</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Remote', 'Hybrid', 'On-site'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setWorkplaceType(mode);
                            setIsDirty(true);
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            workplaceType === mode
                              ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Employment Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Full-time', 'Contract', 'Part-time', 'Internship'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setEmploymentType(type);
                            setIsDirty(true);
                          }}
                          className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            employmentType === type
                              ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE, QUALIFICATIONS & SKILLS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">Step 2 of 6</h3>
                  <p className="text-lg font-bold text-white">Experience, Qualifications & Skill Taxonomy</p>
                  <p className="text-xs text-slate-400">Define required technologies, candidate seniority, and educational requirements.</p>
                </div>

                <button
                  type="button"
                  onClick={() => triggerAiAssistant('suggest_skills')}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span>AI Suggest Skills</span>
                </button>
              </div>

              {/* Experience and Education */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    disabled={isFresherEligible}
                    value={isFresherEligible ? 0 : minExperienceYears}
                    onChange={(e) => {
                      setMinExperienceYears(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Experience (Years)</label>
                  <input
                    type="number"
                    min={minExperienceYears}
                    value={maxExperienceYears}
                    onChange={(e) => {
                      setMaxExperienceYears(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Education</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => {
                      setEducationLevel(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="High School / Diploma">High School / Diploma</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate (Ph.D.)">Doctorate (Ph.D.)</option>
                    <option value="Any / Equivalent Experience">Any / Equivalent Experience</option>
                  </select>
                </div>
              </div>

              {/* Freshers Eligible Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFresherEligible}
                  onChange={(e) => {
                    setIsFresherEligible(e.target.checked);
                    if (e.target.checked) setMinExperienceYears(0);
                    setIsDirty(true);
                  }}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Freshers & Entry-Level Candidates Eligible</div>
                  <div className="text-[11px] text-slate-400">Allows zero-year experience graduates to discover and apply for this opening.</div>
                </div>
              </label>

              {/* Required Skills Tag Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Required Technical Skills <span className="text-rose-400">*</span>
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequiredSkill(skill)}
                          className="hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add required skill (e.g. Django, Kubernetes, PyTorch)..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRequiredSkill(customSkillInput);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddRequiredSkill(customSkillInput)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* Autocomplete Suggestions from Taxonomy */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 pt-1">
                  <span className="text-slate-500 font-mono text-[10px]">Suggested:</span>
                  {taxonomySkills
                    .filter((s) => !skillsRequired.includes(s))
                    .slice(0, 7)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddRequiredSkill(s)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Preferred / Nice-to-Have Skills
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {preferredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePreferredSkill(skill)}
                          className="hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add preferred skill..."
                      value={customPreferredSkillInput}
                      onChange={(e) => setCustomPreferredSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPreferredSkill(customPreferredSkillInput);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPreferredSkill(customPreferredSkillInput)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Qualifications Structured Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Required Qualifications (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={qualificationsText}
                    onChange={(e) => {
                      setQualificationsText(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="- 4+ years of backend engineering in Python..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preferred Qualifications (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={preferredQualificationsText}
                    onChange={(e) => {
                      setPreferredQualificationsText(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="- Prior experience in fintech or AI platform engineering..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: JOB DESCRIPTION & RESPONSIBILITIES */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">Step 3 of 6</h3>
                  <p className="text-lg font-bold text-white">Job Description & Responsibilities Editor</p>
                  <p className="text-xs text-slate-400">Craft a comprehensive narrative of the role or accelerate with AI generation.</p>
                </div>

                {/* AI Assistant Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => triggerAiAssistant('generate')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Generate Full JD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerAiAssistant('improve')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    <span>Improve Tone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerAiAssistant('check_quality')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Quality Check</span>
                  </button>
                </div>
              </div>

              {/* About the Role */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    About the Role & Mission <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {aboutRole.length} characters · Markdown supported
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={aboutRole}
                  onChange={(e) => {
                    setAboutRole(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Provide an overview of the role, engineering challenges, team mission, and impact..."
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 leading-relaxed font-sans focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Responsibilities */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Key Responsibilities (one bullet per line)
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerAiAssistant('suggest_responsibilities')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Suggest Responsibilities</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={responsibilitiesText}
                  onChange={(e) => {
                    setResponsibilitiesText(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Lead architecture and implementation of core distributed systems..."
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: COMPENSATION & BENEFITS */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">Step 4 of 6</h3>
                <p className="text-lg font-bold text-white">Compensation Benchmark & Employer Benefits</p>
                <p className="text-xs text-slate-400">Configure salary transparency, payment periodicity, and company perks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={salaryCurrency}
                    onChange={(e) => {
                      setSalaryCurrency(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Frequency</label>
                  <select
                    value={payFrequency}
                    onChange={(e) => {
                      setPayFrequency(e.target.value as any);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="annual">Annual Salary</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Compensation</label>
                  <input
                    type="number"
                    min={0}
                    value={salaryMin}
                    onChange={(e) => {
                      setSalaryMin(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Compensation</label>
                  <input
                    type="number"
                    min={salaryMin}
                    value={salaryMax}
                    onChange={(e) => {
                      setSalaryMax(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Public Salary Disclosure Toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSalaryDisclosed}
                  onChange={(e) => {
                    setIsSalaryDisclosed(e.target.checked);
                    setIsDirty(true);
                  }}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Disclose Compensation Range Publicly</div>
                  <div className="text-[11px] text-slate-400">
                    When enabled, candidates view the exact range: ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()} {salaryCurrency}. If disabled, it shows as "Competitive / Disclosed on request".
                  </div>
                </div>
              </label>

              {/* Benefits & Perks */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Company Benefits & Perks ({benefitsList.length})
                </label>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {benefitsList.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(b)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom company benefit or perk..."
                      value={customBenefitInput}
                      onChange={(e) => setCustomBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBenefit();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Add Benefit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: APPLICATION PROCESS & SCREENING QUESTIONS */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">Step 5 of 6</h3>
                  <p className="text-lg font-bold text-white">Deadlines & Candidate Screening Questions</p>
                  <p className="text-xs text-slate-400">Add custom screening questions and define application cut-off dates.</p>
                </div>

                <button
                  type="button"
                  onClick={() => triggerAiAssistant('suggest_screening_questions')}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span>AI Suggest Questions</span>
                </button>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Requisition Opening Date</label>
                  <input
                    type="date"
                    value={openingDate}
                    onChange={(e) => {
                      setOpeningDate(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Application Deadline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Once the deadline expires, the system automatically stops accepting candidate submissions.
                  </span>
                </div>
              </div>

              {/* Existing Screening Questions */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Screening Questions ({screeningQuestions.length})
                </label>

                <div className="space-y-2">
                  {screeningQuestions.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No custom screening questions added. Candidates will submit standard resumes and cover notes.
                    </div>
                  ) : (
                    screeningQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-cyan-400">Q{idx + 1}:</span>
                            <span className="text-xs font-semibold text-white">{q.question}</span>
                            {q.required && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300">
                                Required
                              </span>
                            )}
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                              {q.questionType || 'text'}
                            </span>
                          </div>
                          {q.idealAnswer && (
                            <div className="text-[11px] text-slate-400 pl-6">
                              Benchmark response: <span className="text-slate-300">{q.idealAnswer}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveScreeningQuestion(q.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Question Box */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="text-xs font-semibold text-white">Add New Screening Question</div>
                  <input
                    type="text"
                    placeholder="e.g. Do you have hands-on experience deploying Kubernetes clusters?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Answer Format</label>
                      <select
                        value={newQuestionType}
                        onChange={(e) => setNewQuestionType(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="text">Freeform Text</option>
                        <option value="yes_no">Yes / No Binary</option>
                        <option value="number">Numeric Range</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Ideal / Benchmark Answer (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Yes / 3+"
                        value={newQuestionIdeal}
                        onChange={(e) => setNewQuestionIdeal(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddScreeningQuestion}
                        className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Insert Question</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: CANDIDATE-FACING LIVE PREVIEW & WORKFLOW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">Step 6 of 6</h3>
                  <p className="text-lg font-bold text-white">Candidate Perspective Preview & Publication</p>
                  <p className="text-xs text-slate-400">Verify accurate presentation of company branding, requirements, and compensation.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Status upon save:</span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                    isVerified
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                      : 'bg-amber-950 text-amber-300 border-amber-700/60'
                  }`}>
                    {isVerified ? 'Ready for Public Publish' : 'Draft / Moderation Pending'}
                  </span>
                </div>
              </div>

              {/* CANDIDATE VIEW CARD */}
              <div className="p-6 rounded-2xl border border-slate-700/80 bg-slate-950 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-semibold">
                        {jobRef}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{company?.name || 'Synthetix Dynamics'}</span>
                      </span>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified Employer</span>
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-white">{title || 'Requisition Title'}</h1>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{location}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                        <span>{employmentType}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{minExperienceYears}+ yrs exp</span>
                      </span>
                      <span>·</span>
                      <span className="text-cyan-300 font-semibold">
                        {isSalaryDisclosed
                          ? `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()} ${salaryCurrency} / ${payFrequency}`
                          : 'Competitive / Disclosed on inquiry'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-center">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Deadline</div>
                    <div className="text-xs font-bold text-white mt-0.5">{new Date(deadline).toLocaleDateString()}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Accepting Applications</div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsRequired.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/70 text-cyan-200 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                    {preferredSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                        {s} (Preferred)
                      </span>
                    ))}
                  </div>
                </div>

                {/* About Role & Narrative */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">About the Role</div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                    {aboutRole}
                  </div>
                </div>

                {/* Key Responsibilities */}
                {responsibilitiesText.trim() && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key Responsibilities</div>
                    <ul className="text-xs text-slate-200 space-y-1.5 list-disc pl-5">
                      {responsibilitiesText.split('\n').filter(Boolean).map((r, idx) => (
                        <li key={idx} className="leading-relaxed">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">What We Offer</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {benefitsList.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screening Questions Preview */}
                {screeningQuestions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Applicant Screening Questionnaire ({screeningQuestions.length} Questions)
                    </div>
                    <div className="space-y-1.5">
                      {screeningQuestions.map((q, idx) => (
                        <div key={q.id} className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <span className="font-semibold text-cyan-300">Q{idx + 1}: </span>
                          <span>{q.question}</span>
                          {q.required && <span className="text-rose-400 font-mono text-[10px] ml-1.5">*Required</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* WIZARD FOOTER NAVIGATION & SUBMIT ACTIONS */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmitJob('save_draft')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save as Draft</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSubmitJob('submit_for_approval')}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 hover:bg-cyan-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit for Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitJob('publish')}
                  disabled={isSubmitting || !isVerified}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                    isVerified
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title={!isVerified ? 'Verification required to publish' : 'Publish Requisition'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Publish Requisition</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI ASSISTANT MODAL DIALOG */}
        {aiAssistantOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-left">
            <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-violet-800/60 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
              
              <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Requisition Copilot (Gemini 3.8 Flash)</h4>
                    <p className="text-[11px] text-slate-400 capitalize">Mode: {aiActiveAction.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiAssistantOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 google-photos-scrollbar">
                {aiLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">Synthesizing domain specifications and industry standards...</p>
                    <p className="text-[10px] text-slate-500 font-mono">Model: Google Gemini 3.8 Flash</p>
                  </div>
                ) : aiGeneratedResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      {aiGeneratedResult.generatedText && (
                        <div>
                          <div className="text-xs font-bold text-violet-300 mb-1">Generated Job Description</div>
                          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono max-h-60 overflow-y-auto google-photos-scrollbar p-3 rounded bg-slate-900/60 border border-slate-800">
                            {aiGeneratedResult.generatedText}
                          </div>
                        </div>
                      )}

                      {aiGeneratedResult.improvedDescription && (
                        <div>
                          <div className="text-xs font-bold text-violet-300 mb-1">Polished Description</div>
                          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line p-3 rounded bg-slate-900/60 border border-slate-800">
                            {aiGeneratedResult.improvedDescription}
                          </div>
                        </div>
                      )}

                      {aiGeneratedResult.suggestedSkills && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-violet-300">Suggested Technical Skills</div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Required:</span>
                            <div className="flex flex-wrap gap-1">
                              {(aiGeneratedResult.suggestedSkills.required || []).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Preferred:</span>
                            <div className="flex flex-wrap gap-1">
                              {(aiGeneratedResult.suggestedSkills.preferred || []).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {aiGeneratedResult.suggestedResponsibilities && (
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-violet-300">Suggested Key Responsibilities</div>
                          <ul className="text-xs text-slate-300 list-disc pl-5 space-y-1">
                            {aiGeneratedResult.suggestedResponsibilities.map((r: string, idx: number) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiGeneratedResult.qualityAnalysis && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Completeness Score:</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {aiGeneratedResult.qualityAnalysis.completenessScore}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-emerald-300">Strengths:</span>
                            <ul className="text-xs text-slate-300 list-disc pl-5 mt-1 space-y-0.5">
                              {(aiGeneratedResult.qualityAnalysis.strengths || []).map((s: string, idx: number) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-amber-300">Recommendations:</span>
                            <ul className="text-xs text-slate-300 list-disc pl-5 mt-1 space-y-0.5">
                              {(aiGeneratedResult.qualityAnalysis.suggestions || []).map((s: string, idx: number) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {aiGeneratedResult.suggestedQuestions && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-violet-300">Suggested Screening Questions</div>
                          <div className="space-y-1.5">
                            {aiGeneratedResult.suggestedQuestions.map((q: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200">
                                <span className="font-semibold text-cyan-300">Q{idx + 1}: </span>
                                <span>{q.question}</span>
                                {q.required && <span className="text-[10px] text-rose-400 ml-1.5 font-mono">*Required</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAiAssistantOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={applyAiResult}
                  disabled={aiLoading || !aiGeneratedResult}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/30"
                >
                  <Check className="h-4 w-4" />
                  <span>Insert Suggestions</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
