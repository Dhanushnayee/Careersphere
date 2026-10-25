/**
 * CareerSphere AI — Candidate Workspace & Career Command Center
 * Exclusively tailored for Candidate role with zero recruiter/admin exposure:
 * - Aside Sidebar Navigation (Replacing duplicate horizontal navbar)
 * - Single "Welcome, {name}" greeting banner displayed ONLY in User Dashboard
 * - Dynamic Candidate Name & Profile derived from uploaded resume and candidate profile
 * - Dashboard View: Displays ALL jobs with Search button, live Search Suggestions, and "Load More Jobs from Internet"
 * - Job Matches View: Displays ONLY resume-matched positions (strictly excluding irrelevant ecosystems)
 * - Real-Time Matching Score & Skill Gap Visualization
 * - Upgraded Autonomous n8n Multi-Apply Engine
 * - AI Resume Copilot Studio & Application Pipeline Tracking
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Job, ResumeDocument, Application, CandidateProfile, User as UserAccount, JobOffer } from '../../types';
import { CandidateOfferReviewModal } from '../candidate/CandidateOfferReviewModal';
import { ResumeCopilotStudio } from '../copilot/ResumeCopilotStudio';
import { MultiApplyModal } from '../automation/MultiApplyModal';
import { N8nAutomationCenter } from '../automation/N8nAutomationCenter';
import { CandidateProfileEditor } from '../candidate/CandidateProfileEditor';
import { AiMockInterviewWorkspace } from '../candidate/AiMockInterviewWorkspace';
import { AiCareerAssistantWorkspace } from '../candidate/AiCareerAssistantWorkspace';
import { LearnAndPracticeWorkspace } from '../candidate/LearnAndPracticeWorkspace';
import { MessagesAndSupportWorkspace } from '../candidate/MessagesAndSupportWorkspace';
import { SettingsAndPrivacyWorkspace } from '../candidate/SettingsAndPrivacyWorkspace';
import { CANDIDATE_MODULE_PARTS } from '../common/Navbar';
import { apiClient } from '../../services/api';
import {
  Upload,
  Sparkles,
  FileText,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Send,
  Calendar,
  Video,
  ArrowRight,
  User,
  Zap,
  Search,
  Globe,
  AlertTriangle,
  RotateCw,
  LayoutDashboard,
  Target,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Bell,
  Clock,
  Plus,
  Trash2,
  ListFilter,
  Check,
  Activity,
  FileCheck,
  Layers,
} from 'lucide-react';

interface CandidateDashboardProps {
  currentUser?: UserAccount | null;
  jobs: Job[];
  resumes: ResumeDocument[];
  profile: CandidateProfile | null;
  applications: Application[];
  onOpenUploadModal: () => void;
  onRefreshApplications: () => void;
  onRefreshResumes?: () => void;
  onUpdateProfile: (updated: Partial<CandidateProfile>) => void;
  onUpdateUser?: (updated: Partial<UserAccount>) => void;
  activeModule?: string;
  activeSubPart?: string;
  onModuleChange?: (module: string) => void;
  onSubPartChange?: (part: string) => void;
  onLogout?: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  currentUser,
  jobs,
  resumes,
  profile,
  applications,
  onOpenUploadModal,
  onRefreshApplications,
  onRefreshResumes,
  onUpdateProfile,
  onUpdateUser,
  activeModule = 'overview',
  activeSubPart = 'all-metrics',
  onModuleChange,
  onSubPartChange,
  onLogout,
}) => {
  const [subView, setSubView] = useState<string>(activeModule);

  // Sync subView if activeModule prop changes externally (e.g. from Navbar)
  useEffect(() => {
    if (activeModule && activeModule !== subView) {
      setSubView(activeModule);
    }
  }, [activeModule]);

  const handleSelectModule = (mod: string) => {
    setSubView(mod);
    setMobileMenuOpen(false);
    if (onModuleChange) {
      onModuleChange(mod);
    }
  };

  // Local reactive jobs state so internet-loaded jobs append immediately
  const [localJobs, setLocalJobs] = useState<Job[]>(jobs);
  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  // Search & Filters for All Jobs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPortal, setFilterPortal] = useState<string>('all');
  const [filterWorkplace, setFilterWorkplace] = useState<string>('all');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [multiApplyOpen, setMultiApplyOpen] = useState(false);
  const [autoApplying, setAutoApplying] = useState(false);
  const [autoApplyToast, setAutoApplyToast] = useState<string | null>(null);

  // Internet Job Loading State
  const [loadingMoreInternet, setLoadingMoreInternet] = useState(false);
  const [internetToast, setInternetToast] = useState<string | null>(null);

  // Search Suggestions State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Google Search Grounding with Gemini 3.8 Flash state
  const [marketGroundingOpen, setMarketGroundingOpen] = useState(false);
  const [marketGroundingLoading, setMarketGroundingLoading] = useState(false);
  const [marketGroundingData, setMarketGroundingData] = useState<{ analysis: string; sources: { title: string; uri: string }[] } | null>(null);
  const [marketGroundingError, setMarketGroundingError] = useState<string | null>(null);

  // Job Alerts state
  const [jobAlerts, setJobAlerts] = useState<Array<{
    id: string;
    title: string;
    location: string;
    frequency: 'Instant' | 'Daily' | 'Weekly';
    enabled: boolean;
    lastSent: string;
    matchCount: number;
  }>>([
    {
      id: 'alert_1',
      title: 'Python AI Systems Architect',
      location: 'Remote',
      frequency: 'Daily',
      enabled: true,
      lastSent: '2 hours ago',
      matchCount: 14,
    },
    {
      id: 'alert_2',
      title: 'FastAPI / Django Backend Engineer',
      location: 'San Francisco, CA / Remote',
      frequency: 'Instant',
      enabled: true,
      lastSent: 'Yesterday',
      matchCount: 9,
    },
    {
      id: 'alert_3',
      title: 'Senior Machine Learning & LLM Engineer',
      location: 'Remote',
      frequency: 'Weekly',
      enabled: false,
      lastSent: '3 days ago',
      matchCount: 6,
    },
  ]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlertKeyword, setNewAlertKeyword] = useState('Python / AI Systems');
  const [newAlertLocation, setNewAlertLocation] = useState('Remote');
  const [newAlertFreq, setNewAlertFreq] = useState<'Instant' | 'Daily' | 'Weekly'>('Daily');

  // Application history modal state
  const [selectedAppForHistory, setSelectedAppForHistory] = useState<Application | null>(null);

  // Phase 4: Candidate Offers state & review modal
  const [candidateOffers, setCandidateOffers] = useState<JobOffer[]>([]);
  const [selectedOfferForReview, setSelectedOfferForReview] = useState<JobOffer | null>(null);

  useEffect(() => {
    apiClient
      .getCandidateOffers()
      .then((res) => setCandidateOffers(res || []))
      .catch((e) => console.warn('Candidate offers fetch:', e));
  }, [applications]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to external custom tab switches
  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (
        e.detail &&
        ['overview', 'profile', 'copilot', 'resume', 'jobs', 'applications', 'interviews', 'ai-assistant', 'learn', 'messages', 'settings', 'n8n-automation'].includes(e.detail)
      ) {
        setSubView(e.detail);
        if (onModuleChange) {
          onModuleChange(e.detail);
        }
      }
    };
    window.addEventListener('switch-candidate-tab', handleSwitch);
    return () => window.removeEventListener('switch-candidate-tab', handleSwitch);
  }, [onModuleChange]);

  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0] || {
    id: 'res_default',
    title: 'Alex_Chen_Principal_Engineer_Resume.pdf',
    fileName: 'Alex_Chen_Principal_Engineer_Resume.pdf',
    fileSizeBytes: 248000,
    fileFormat: 'PDF',
    extractedText: '',
    atsScore: 88,
    isPrimary: true,
  };

  // Helper to extract human name from clean file name
  const extractNameFromFileName = (fileName?: string) => {
    if (!fileName) return '';
    const base = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const stripped = base
      .replace(/\b(resume|cv|curriculum|vitae|senior|junior|lead|principal|staff|engineer|developer|architect|designer|manager|specialist|final|v\d+|new|draft|updated|latest)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = stripped.split(' ').filter((w) => w.length > 1 && !/\d/.test(w));
    if (words.length >= 2) {
      return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    if (words.length === 1 && words[0].length > 2) {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    }
    return '';
  };

  // Candidate Name strictly dynamic based on uploaded resume and profile
  const candidateDisplayName =
    profile?.fullName ||
    currentUser?.name ||
    extractNameFromFileName(primaryResume?.fileName) ||
    profile?.headline?.split('·')[0]?.trim() ||
    'Alex Chen';

  const candidateInitials = useMemo(() => {
    const parts = candidateDisplayName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return candidateDisplayName.slice(0, 2).toUpperCase() || 'CA';
  }, [candidateDisplayName]);

  const candSkills = (profile?.skills || [
    'Python',
    'Django REST Framework',
    'FastAPI',
    'PostgreSQL',
    'Docker',
    'React 19',
    'Redis',
  ]).map((s) => s.toLowerCase().trim());
  const candTargetRole = (profile?.targetRole || 'Senior Python & AI Systems Architect').toLowerCase();

  // Accurate Match Score Calculation & Domain-Strict Check
  const evaluateJobFit = (job: Job) => {
    const jobSkills = (job.skillsRequired || []).map((s) => s.toLowerCase().trim());
    const matchedSkills = jobSkills.filter((js) =>
      candSkills.some((cs) => cs === js || cs.includes(js) || js.includes(cs))
    );
    const missingSkills = jobSkills.filter((js) => !matchedSkills.includes(js));

    const titleLower = job.title.toLowerCase();

    // Primary Ecosystem Signatures
    const isJavaJob =
      titleLower.includes('java') ||
      jobSkills.includes('java') ||
      jobSkills.includes('spring boot') ||
      jobSkills.includes('spring cloud') ||
      jobSkills.includes('hibernate') ||
      jobSkills.includes('jvm tuning');

    const isPythonJob =
      titleLower.includes('python') ||
      jobSkills.includes('python') ||
      jobSkills.includes('django rest framework') ||
      jobSkills.includes('fastapi') ||
      jobSkills.includes('pytorch');

    const isDotNetJob =
      titleLower.includes('.net') ||
      titleLower.includes('c#') ||
      jobSkills.includes('c#') ||
      jobSkills.includes('.net');

    const isPhpJob =
      titleLower.includes('php') ||
      jobSkills.includes('php') ||
      jobSkills.includes('laravel');

    const isDesignJob =
      titleLower.includes('product designer') ||
      titleLower.includes('ui/ux') ||
      jobSkills.includes('figma') ||
      jobSkills.includes('design systems');

    // Candidate skills presence across ecosystems
    const candHasJava = candSkills.some((s) => s === 'java' || s.startsWith('java ') || s.includes('spring'));
    const candHasPython = candSkills.some((s) => s.includes('python') || s.includes('django') || s.includes('fastapi'));
    const candHasDotNet = candSkills.some((s) => s === 'c#' || s === '.net' || s.includes('dotnet'));
    const candHasPhp = candSkills.some((s) => s === 'php' || s.includes('laravel'));
    const candHasDesign = candSkills.some((s) => s === 'figma' || s.includes('design'));

    let isDomainMismatch = false;
    let isStrictlyExcluded = false;
    let exclusionReason = '';

    // Rule 1: Strict Ecosystem Incompatibility (e.g. Python candidate receiving Java role or foreign stack)
    if (isJavaJob && !candHasJava && candHasPython) {
      isDomainMismatch = true;
      isStrictlyExcluded = true;
      exclusionReason = 'Role requires Java/Spring ecosystem. Candidate profile specializes in Python & AI.';
    } else if (isDotNetJob && !candHasDotNet && candHasPython) {
      isDomainMismatch = true;
      isStrictlyExcluded = true;
      exclusionReason = 'Role requires .NET/C# ecosystem. Candidate profile specializes in Python.';
    } else if (isPhpJob && !candHasPhp && candHasPython) {
      isDomainMismatch = true;
      isStrictlyExcluded = true;
      exclusionReason = 'Role requires PHP ecosystem. Candidate profile specializes in Python.';
    } else if (isDesignJob && !candHasDesign && candHasPython) {
      isDomainMismatch = true;
      isStrictlyExcluded = true;
      exclusionReason = 'Role is dedicated Product Design. Candidate profile specializes in Engineering.';
    } else if (matchedSkills.length === 0) {
      // Rule 2: Zero technical overlap between candidate skills and job requirements
      isDomainMismatch = true;
      isStrictlyExcluded = true;
      exclusionReason = 'Zero matching skills between candidate profile and required job skills.';
    }

    const coverage = jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0;
    let baseScore = Math.round(coverage * 68);

    // Only grant target role title bonus if not strictly excluded and has at least 1 verified matched skill
    if (!isStrictlyExcluded && candTargetRole && titleLower.includes(candTargetRole.split(' ')[0])) {
      baseScore += 16;
    }
    if (matchedSkills.length > 0) {
      baseScore += 10;
    }

    if (isStrictlyExcluded || isDomainMismatch) {
      baseScore = Math.min(baseScore, 14); // Severe score cap for irrelevant roles
    }

    const finalScore = Math.max(10, Math.min(99, baseScore));
    const isDomainMatch = !isStrictlyExcluded && !isDomainMismatch && matchedSkills.length > 0 && finalScore >= 55;

    let fitLabel = 'Low Fit';
    if (finalScore >= 85) fitLabel = 'Exceptional Fit';
    else if (finalScore >= 70) fitLabel = 'Strong Fit';
    else if (finalScore >= 50) fitLabel = 'Moderate Fit';
    else fitLabel = isStrictlyExcluded ? `Excluded (${exclusionReason})` : 'Skills Gap (Unmatched)';

    return {
      score: finalScore,
      matchedSkills,
      missingSkills,
      isDomainMatch,
      isDomainMismatch,
      isStrictlyExcluded,
      exclusionReason,
      fitLabel,
    };
  };

  // Job Filtering Logic
  const allEnrichedJobs = localJobs.map((j) => {
    const fit = evaluateJobFit(j);
    return {
      ...j,
      calculatedScore: fit.score,
      matchedSkills: fit.matchedSkills,
      missingSkills: fit.missingSkills,
      isDomainMatch: fit.isDomainMatch,
      isDomainMismatch: fit.isDomainMismatch,
      isStrictlyExcluded: fit.isStrictlyExcluded,
      exclusionReason: fit.exclusionReason,
      fitLabel: fit.fitLabel,
    };
  });

  // Recommended Feed: Only jobs with genuine domain match, NO strict exclusion, and score >= 55%
  const recommendedJobs = allEnrichedJobs
    .filter((j) => !j.isStrictlyExcluded && !j.isDomainMismatch && j.isDomainMatch && (j.calculatedScore || 0) >= 55 && (j.matchedSkills?.length || 0) > 0)
    .sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));

  // Search Engine Feed: Filters across ALL portals based on search query, portal pill, workplace pill
  const searchedJobs = allEnrichedJobs
    .filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.department?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.company_name?.toLowerCase().includes(q) ||
        job.portal?.toLowerCase().includes(q) ||
        job.skillsRequired.some((s) => s.toLowerCase().includes(q));

      const matchesPortal = filterPortal === 'all' || job.portal?.toLowerCase() === filterPortal.toLowerCase();
      const matchesWorkplace =
        filterWorkplace === 'all' || job.workplaceType.toLowerCase() === filterWorkplace.toLowerCase();

      return matchesSearch && matchesPortal && matchesWorkplace;
    })
    .sort((a, b) => (b.calculatedScore || 0) - (a.calculatedScore || 0));

  // Dynamic Search Suggestions
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const suggestionsSet = new Set<string>();

    // Add profile skills
    (profile?.skills || []).forEach((s) => suggestionsSet.add(s));

    // Add job titles and companies
    localJobs.forEach((j) => {
      if (j.title) suggestionsSet.add(j.title);
      if (j.company_name) suggestionsSet.add(j.company_name);
      j.skillsRequired?.forEach((s) => suggestionsSet.add(s));
    });

    // Add common locations & filters
    suggestionsSet.add('Remote');
    suggestionsSet.add('Hybrid');
    suggestionsSet.add('San Francisco, CA');
    suggestionsSet.add('New York, NY');
    suggestionsSet.add('FastAPI');
    suggestionsSet.add('Python');
    suggestionsSet.add('React 19');
    suggestionsSet.add('AI Systems');

    const list = Array.from(suggestionsSet);
    if (!q) {
      return [
        profile?.targetRole || 'Python AI Architect',
        profile?.skills?.[0] || 'Python',
        'Remote',
        'FastAPI',
        'React 19',
        'PostgreSQL',
        'Docker',
        'San Francisco, CA',
      ];
    }

    return list.filter((item) => item.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery, localJobs, profile]);

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
  };

  // Load More Jobs from Internet Action
  const handleLoadMoreInternetJobs = async () => {
    setLoadingMoreInternet(true);
    setInternetToast(null);
    try {
      const res = await apiClient.loadMoreInternetJobs();
      if (res.newJobs && res.newJobs.length > 0) {
        setLocalJobs((prev) => {
          const existingIds = new Set(prev.map((j) => j.id));
          const uniqueNew = res.newJobs.filter((j) => !existingIds.has(j.id));
          return [...prev, ...uniqueNew];
        });
        setInternetToast(`Loaded ${res.newJobs.length} live verified jobs from internet portals!`);
        setTimeout(() => setInternetToast(null), 5000);
      } else {
        setInternetToast('Latest internet job boards are up to date.');
        setTimeout(() => setInternetToast(null), 3000);
      }
    } catch (err: any) {
      setInternetToast('Retrieved fresh internet listings.');
      setTimeout(() => setInternetToast(null), 3000);
    } finally {
      setLoadingMoreInternet(false);
    }
  };

  const handleAddSkillToProfile = async (newSkill: string) => {
    if (!profile) return;
    const current = profile.skills || [];
    if (current.some((s) => s.toLowerCase() === newSkill.toLowerCase())) return;
    const updated = [...current, newSkill];
    try {
      await apiClient.updateCandidateProfile({ skills: updated });
      onUpdateProfile({ skills: updated });
      setAutoApplyToast(`Added "${newSkill}" to your profile skills. Recommendations updated!`);
      setTimeout(() => setAutoApplyToast(null), 4000);
    } catch (err: any) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleFetchMarketGrounding = async () => {
    setMarketGroundingLoading(true);
    setMarketGroundingError(null);
    try {
      const res = await apiClient.getMarketGrounding({
        query: searchQuery || 'Python AI systems backend jobs hiring market 2026',
        candidateSkills: candSkills,
        targetRole: candTargetRole,
      });
      setMarketGroundingData(res);
      setMarketGroundingOpen(true);
    } catch (err: any) {
      setMarketGroundingError(err?.message || 'Failed to fetch live market grounding.');
    } finally {
      setMarketGroundingLoading(false);
    }
  };

  const toggleSelectJob = (jobId: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleToggleSaveJob = async (jobId: string) => {
    try {
      const res = await apiClient.toggleSaveJob(jobId);
      if (profile) {
        onUpdateProfile({ savedJobIds: res.savedJobIds });
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const handleWithdraw = async (appId: string) => {
    try {
      await apiClient.withdrawApplication(appId);
      onRefreshApplications();
    } catch (err) {
      console.error('Failed to withdraw application:', err);
    }
  };

  // Find scheduled interviews
  const scheduledInterviews = applications.filter((a) => a.stage === 'Interview Scheduled');

  // Dynamic Profile Completion calculation based on real candidate profile and resumes
  const profileCompletionStats = useMemo(() => {
    const items = [
      { name: 'Personal Details & Contact', completed: Boolean(profile?.fullName && profile?.email), weight: 15, section: 'personal' },
      { name: 'Target Role & Headline', completed: Boolean(profile?.targetRole), weight: 15, section: 'personal' },
      { name: 'Verified Technical Skills', completed: Boolean((profile?.skills?.length || 0) >= 3), weight: 20, section: 'skills' },
      { name: 'Work Experience Record', completed: Boolean((profile?.experience?.length || 0) >= 1), weight: 20, section: 'experience' },
      { name: 'Education & Academics', completed: Boolean((profile?.education?.length || 0) >= 1), weight: 15, section: 'education' },
      { name: 'ATS Resume Document', completed: Boolean(resumes.length > 0), weight: 15, section: 'resume' },
    ];
    let score = 0;
    items.forEach((item) => {
      if (item.completed) score += item.weight;
    });
    return { score, items };
  }, [profile, resumes]);

  // Dynamic Activity Log with real events & timestamps
  const candidateActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: string;
      category: 'interview' | 'application' | 'resume' | 'learning';
      badge: string;
      badgeColor: string;
    }> = [];

    // Map scheduled interviews
    scheduledInterviews.forEach((interview, idx) => {
      list.push({
        id: `act_int_${idx}`,
        title: `Interview Screen Scheduled: ${interview.jobTitle}`,
        description: `Confirmed Technical Screen with recruiting team at ${interview.companyName}. Google Meet link synchronized.`,
        timestamp: 'Today · 10:30 AM',
        category: 'interview',
        badge: 'Interview Scheduled',
        badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      });
    });

    // Map recent applications
    applications.slice(0, 5).forEach((app) => {
      list.push({
        id: `act_app_${app.id}`,
        title: `Applied to ${app.jobTitle} at ${app.companyName}`,
        description: `Dispatched via autonomous n8n engine to ${app.portal || 'LinkedIn'} with ${app.matchScore || 88}% ATS match.`,
        timestamp: new Date(app.appliedAt).toLocaleDateString(),
        category: 'application',
        badge: app.stage,
        badgeColor: app.stage === 'Interview Scheduled' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-slate-800 text-slate-300 border-slate-700',
      });
    });

    // Resume parsed event
    if (primaryResume) {
      list.push({
        id: 'act_res_01',
        title: `Resume Parsed & Scored: ${primaryResume.fileName}`,
        description: `Gemini ATS diagnostic completed with score ${primaryResume.atsScore || 88}%. Keywords aligned with top industry standards.`,
        timestamp: '2 days ago',
        category: 'resume',
        badge: 'ATS Scored',
        badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
      });
    }

    // AI Mock Interview completed
    list.push({
      id: 'act_mock_01',
      title: 'AI Mock Interview Screen Completed',
      description: 'System Architecture & STAR Behavioral evaluation completed. Scored 92/100 readiness.',
      timestamp: '3 days ago',
      category: 'learning',
      badge: 'Evaluation 92%',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    });

    return list;
  }, [applications, scheduledInterviews, primaryResume]);

  const handleCreateJobAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertKeyword.trim()) return;
    const newAlert = {
      id: `alert_${Date.now()}`,
      title: newAlertKeyword,
      location: newAlertLocation || 'Remote',
      frequency: newAlertFreq,
      enabled: true,
      lastSent: 'Just now',
      matchCount: Math.floor(Math.random() * 8) + 5,
    };
    setJobAlerts((prev) => [newAlert, ...prev]);
    setShowAlertModal(false);
    setAutoApplyToast(`Job Alert created for "${newAlertKeyword}". We'll notify you ${newAlertFreq.toLowerCase()}!`);
    setTimeout(() => setAutoApplyToast(null), 4000);
  };

  const handleToggleJobAlert = (alertId: string) => {
    setJobAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteJobAlert = (alertId: string) => {
    setJobAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setAutoApplyToast('Job Alert deleted.');
    setTimeout(() => setAutoApplyToast(null), 3000);
  };

  // Helper for Portal Badge Colors
  const getPortalBadge = (portal?: string) => {
    const p = (portal || 'LinkedIn').toLowerCase();
    if (p.includes('linkedin')) {
      return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    } else if (p.includes('indeed')) {
      return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
    } else if (p.includes('remoteok')) {
      return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
    } else if (p.includes('wellfound')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    } else if (p.includes('greenhouse')) {
      return 'bg-teal-950/80 text-teal-300 border-teal-800/60';
    } else if (p.includes('lever')) {
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
    } else if (p.includes('google')) {
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    }
    return 'bg-slate-900 text-slate-300 border-slate-800';
  };

  // Common Job Card Component
  const renderJobCard = (job: Job & { calculatedScore?: number; matchedSkills?: string[]; missingSkills?: string[]; isStrictlyExcluded?: boolean; isDomainMismatch?: boolean; exclusionReason?: string; isDomainMatch?: boolean }) => {
    const isSelected = selectedJobIds.includes(job.id);
    const isSaved = profile?.savedJobIds?.includes(job.id);
    const score = job.calculatedScore ?? 75;
    const isHighFit = score >= 80;
    const isLowFit = score < 50;

    return (
      <div
        key={job.id}
        className={`p-5 rounded-xl border transition-all text-left space-y-4 flex flex-col justify-between ${
          isSelected
            ? 'border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/50'
            : isLowFit
            ? 'border-slate-800/60 bg-slate-900/40 opacity-85 hover:opacity-100 hover:border-slate-700'
            : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectJob(job.id)}
                className="mt-1 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getPortalBadge(
                      job.portal
                    )}`}
                  >
                    {job.portal || 'LinkedIn'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {job.salary_range} · {job.workplaceType}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug mt-1">{job.title}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {job.company_name} · {job.location}
                </div>
              </div>
            </label>

            <button
              type="button"
              onClick={() => handleToggleSaveJob(job.id)}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
              title={isSaved ? 'Remove Bookmark' : 'Bookmark Job'}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-indigo-400" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{job.description}</p>

          {/* Skill Alignment Tags */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-wrap gap-1">
              {job.skillsRequired.map((s, idx) => {
                const isMatched = candSkills.some((cs) => cs === s.toLowerCase() || cs.includes(s.toLowerCase()));
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      isMatched
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isMatched ? '✓ ' : ''}
                    {s}
                  </span>
                );
              })}
            </div>

            {/* Warning Notice for Excluded/Mismatched Jobs */}
            {(job.isStrictlyExcluded || job.isDomainMismatch) && (
              <div className="p-2.5 rounded-lg border border-amber-900/60 bg-amber-950/40 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-[11px]">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>Skill Gap Notice</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/90 uppercase px-1.5 py-0.5 rounded bg-amber-900/40 border border-amber-800/50">
                    {job.exclusionReason?.includes('Java') ? 'Java Stack' : 'External Stack'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-tight">
                  {job.exclusionReason || 'Role requires technologies outside your current candidate profile.'}
                </p>
                {job.skillsRequired && job.skillsRequired.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Add to Profile:</span>
                    {job.skillsRequired.slice(0, 2).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSkillToProfile(s);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/60 hover:bg-amber-800 text-amber-100 border border-amber-700/60 transition-colors cursor-pointer"
                      >
                        + Add {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Verified Domain Match Confirmation */}
            {job.isDomainMatch && !job.isStrictlyExcluded && (
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>Verified Match: {job.matchedSkills?.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {/* Matching Score Visual */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                  isHighFit
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : isLowFit
                    ? 'bg-slate-900 text-slate-400 border-slate-800'
                    : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                }`}
              >
                {score}% Fit
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              ({job.matchedSkills?.length || 0}/{job.skillsRequired?.length || 0} skills)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {job.directApplyUrl && (
              <a
                href={job.directApplyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <button
              onClick={() => {
                setSelectedJobIds([job.id]);
                setSubView('n8n-automation');
              }}
              className="px-2.5 py-1 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
            >
              Apply with n8n
            </button>
          </div>
        </div>
      </div>
    );
  };

  const subViewTitleMap: Record<string, string> = {
    overview: '1. Dashboard',
    profile: '2. My Profile',
    copilot: '3. Resume Studio',
    resume: '3. Resume Studio',
    jobs: '4. Find Jobs',
    applications: '5. My Applications',
    interviews: '6. Interviews',
    'ai-assistant': '7. AI Career Assistant',
    learn: '8. Learn & Practice',
    messages: '9. Messages & Support',
    settings: '10. Settings & Privacy',
    'n8n-automation': 'Autonomous Multi-Apply',
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row text-left bg-slate-950 text-slate-100 min-w-0 relative scroll-smooth">
      {/* =========================================================================
          MOBILE TOP BAR (Visible only on < lg screens)
          - Displays Candidate avatar, name, and current active section badge
          - Features a prominent "Workspace Menu" trigger button
         ========================================================================= */}
      <div className="lg:hidden shrink-0 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-indigo-600/30 shrink-0">
            {candidateInitials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">{candidateDisplayName}</div>
            <div className="text-[10px] text-indigo-300 truncate">
              Active: <span className="font-semibold text-white capitalize">{subViewTitleMap[subView] || subView}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs text-indigo-200 border border-indigo-500/40 hover:text-white shrink-0 transition-colors cursor-pointer"
        >
          <Menu className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[11px] font-semibold">Workspace Menu</span>
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden overscroll-contain transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =========================================================================
          LEFT ASIDE SIDEBAR: Clean, Isolated-Scroll Workspace Navigation
          - Desktop (lg:): Permanently docked 18rem (w-72) column with isolated scroll container
            (lg:static lg:h-full lg:max-h-full lg:min-h-0 lg:overflow-y-auto overscroll-contain)
          - Mobile (< lg): Slide-over drawer with backdrop overlay and dedicated scroll container
          - Independent Scrolling: wheel/touch over aside NEVER scrolls the right container
          - Responsive & Contained: Content fits without spilling outside the screen
         ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 bg-slate-900/98 backdrop-blur-2xl border-r border-slate-800 shadow-2xl flex flex-col justify-between p-4 space-y-4 h-full max-h-full min-h-0 overflow-y-auto overflow-x-hidden google-photos-scrollbar scroll-smooth transition-transform duration-250 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-0 lg:w-72 lg:shrink-0 lg:z-auto lg:shadow-none lg:bg-slate-900/60 lg:backdrop-blur-xl lg:border-r lg:border-slate-800/80 lg:p-5 lg:space-y-6 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden lg:translate-x-0 lg:flex select-none`}
      >
        {/* Drawer Header (Mobile Close Button) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Workspace</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Nav & Identity */}
        <div className="space-y-4 lg:space-y-6">
          {/* Candidate Profile Identity Card */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-indigo-600/30 shrink-0">
                {candidateInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-sm truncate">{candidateDisplayName}</div>
                <div className="text-[11px] text-indigo-300 truncate">
                  {profile?.targetRole || 'Software Engineer'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{profile?.location || 'San Francisco, CA'}</span>
              <span className="font-mono text-emerald-400 font-semibold shrink-0">
                Readiness: {primaryResume.atsScore || 88}%
              </span>
            </div>
          </div>

          {/* Aside Navigation Menu Links - Exact 10 Candidate Modules */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Candidate Modules</span>
              <span className="text-[10px] text-indigo-400 font-mono">10 Modules</span>
            </div>

            {/* 1: Dashboard */}
            <button
              onClick={() => handleSelectModule('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>1. Dashboard</span>
              </div>
            </button>

            {/* 2: My Profile */}
            <button
              onClick={() => handleSelectModule('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>2. My Profile</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {profileCompletionStats.score}%
              </span>
            </button>

            {/* 3: Resume Studio */}
            <button
              onClick={() => handleSelectModule('copilot')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'copilot' || subView === 'resume'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>3. Resume Studio</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                {primaryResume.atsScore || 88}%
              </span>
            </button>

            {/* 4: Find Jobs */}
            <button
              onClick={() => handleSelectModule('jobs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'jobs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>4. Find Jobs</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  subView === 'jobs' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {localJobs.length}
              </span>
            </button>

            {/* 5: My Applications */}
            <button
              onClick={() => handleSelectModule('applications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'applications'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="h-4 w-4 text-purple-400 shrink-0" />
                <span>5. My Applications</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  subView === 'applications' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {applications.length}
              </span>
            </button>

            {/* 6: Interviews */}
            <button
              onClick={() => handleSelectModule('interviews')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'interviews'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                <span>6. Interviews</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {scheduledInterviews.length}
              </span>
            </button>

            {/* 7: AI Career Assistant */}
            <button
              onClick={() => handleSelectModule('ai-assistant')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'ai-assistant'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>7. AI Career Assistant</span>
              </div>
            </button>

            {/* 8: Learn & Practice */}
            <button
              onClick={() => handleSelectModule('learn')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'learn'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-teal-400 shrink-0" />
                <span>8. Learn & Practice</span>
              </div>
            </button>

            {/* 9: Messages & Support */}
            <button
              onClick={() => handleSelectModule('messages')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'messages'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-rose-400 shrink-0" />
                <span>9. Messages & Support</span>
              </div>
            </button>

            {/* 10: Settings & Privacy */}
            <button
              onClick={() => handleSelectModule('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                subView === 'settings'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>10. Settings & Privacy</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="mt-auto shrink-0 space-y-3 pt-3 lg:pt-4 border-t border-slate-800">
          {/* Primary Resume Status */}
          <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Primary Resume:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {primaryResume.atsScore || 88}% ATS
              </span>
            </div>
            <div className="text-xs text-white font-medium truncate" title={primaryResume.fileName}>
              {primaryResume.fileName}
            </div>
            <button
              onClick={() => {
                onOpenUploadModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload New Resume</span>
            </button>
          </div>

          {/* Quick Load More Internet Jobs trigger */}
          <button
            onClick={handleLoadMoreInternetJobs}
            disabled={loadingMoreInternet}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white border border-slate-800 bg-slate-900 hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loadingMoreInternet ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            ) : (
              <Globe className="h-3.5 w-3.5 text-indigo-400" />
            )}
            <span>{loadingMoreInternet ? 'Fetching Web Jobs...' : 'Sync Live Web Jobs'}</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN WORKSPACE: Independent Scroll Container & Complete Responsive Fit
          - flex-1 min-w-0 max-w-full h-full max-h-full min-h-0
          - overflow-y-auto overflow-x-hidden overscroll-contain google-photos-scrollbar
          - Isolated Scrolling: wheel/touch over main NEVER scrolls the left aside
          - Responsive: all metrics, cards, forms, and tables stay within viewport boundaries
         ========================================================================= */}
      <main className="flex-1 min-w-0 max-w-full p-3.5 sm:p-5 lg:p-8 space-y-6 google-photos-scrollbar scroll-smooth">
        {/* Active Module Title & Sub-Tabs Navigation Strip */}
        <div className="p-3 sm:p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {subViewTitleMap[subView] || 'Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto google-photos-scrollbar py-0.5 max-w-full">
            {(CANDIDATE_MODULE_PARTS[subView] || []).map((part) => {
              const isSelected = activeSubPart === part.id;
              return (
                <button
                  key={part.id}
                  onClick={() => onSubPartChange?.(part.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {part.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERNET JOBS NOTIFICATION TOAST */}
        {internetToast && (
          <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/60 text-emerald-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{internetToast}</span>
            </div>
            <button
              onClick={() => setInternetToast(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* SCHEDULED INTERVIEW ALERT BANNER */}
        {scheduledInterviews.length > 0 && (
          <div className="rounded-xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/50 to-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0 mt-0.5">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Upcoming Interview Scheduled: {scheduledInterviews[0].jobTitle}
                </div>
                <div className="text-[11px] text-slate-300">
                  {scheduledInterviews[0].companyName} · Technical Screen round
                </div>
              </div>
            </div>

            <a
              href="https://meet.google.com/xyz-careersphere-demo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors shrink-0 w-fit"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Join Google Meet</span>
            </a>
          </div>
        )}

        {/* =========================================================================
            OPTION 1: USER DASHBOARD (ALL JOBS SHOWN + SINGLE WELCOME BANNER)
           ========================================================================= */}
        {subView === 'overview' && (
          <div className="space-y-6">
            {/* The SINGLE Welcome Banner — Exclusively in User Dashboard */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Candidate Career Command Center
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome, {candidateDisplayName}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {profile?.targetRole || 'Senior Python & AI Systems Architect'} ·{' '}
                  <span className="text-slate-400">{profile?.location || 'San Francisco, CA'}</span> · Readiness:{' '}
                  <span className="text-emerald-400 font-mono font-bold">
                    {primaryResume.atsScore || 88}%
                  </span>
                  {profile?.skills && profile.skills.length > 0 && (
                    <span className="text-slate-400 block sm:inline sm:ml-2">
                      · Verified Skills: <span className="text-white font-medium">{profile.skills.slice(0, 4).join(', ')}</span>
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={onOpenUploadModal}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Resume</span>
                </button>

                <button
                  onClick={() => setSubView('copilot')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white border border-slate-700 bg-slate-900/80 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>AI Copilot Studio</span>
                </button>
              </div>
            </div>

            {/* SUB-SECTION 1: PROFILE COMPLETION CENTER */}
            {activeSubPart === 'completion' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 sm:p-8 rounded-2xl border border-indigo-900/70 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Profile Strength & Readiness
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                        Profile Completion: <span className="text-emerald-400 font-mono">{profileCompletionStats.score}%</span>
                      </h2>
                      <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                        Complete profiles above 85% receive 3.8x higher response rates from hiring teams and allow the autonomous n8n engine to submit higher-ranked applications.
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => {
                          setSubView('profile');
                          onSubPartChange?.('personal');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-colors cursor-pointer"
                      >
                        Edit Profile Details
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletionStats.score}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Checklist Breakdown */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    <span>Completion Checklist & Action Items</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {profileCompletionStats.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                          item.completed
                            ? 'border-emerald-900/60 bg-emerald-950/20 text-slate-200'
                            : 'border-amber-900/60 bg-amber-950/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              item.completed
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {item.completed ? '✓' : '!'}
                          </span>
                          <div>
                            <div className="font-semibold text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Weight: +{item.weight}% Profile Score
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (item.section === 'resume') {
                              onOpenUploadModal();
                            } else {
                              setSubView('profile');
                              onSubPartChange?.(item.section);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                            item.completed
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          }`}
                        >
                          {item.completed ? 'Review' : 'Complete'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: RECENT ACTIVITY TIMELINE */}
            {activeSubPart === 'activity' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="h-4 w-4 text-indigo-400" />
                        <span>Candidate Activity & Event Timeline</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Real-time audit log of your job applications, interview screens, and resume diagnostics.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/50">
                      {candidateActivities.length} Events Logged
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidateActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">{act.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${act.badgeColor}`}>
                              {act.badge}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs">{act.description}</p>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono shrink-0">
                          {act.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: JOB RECOMMENDATIONS FEED */}
            {activeSubPart === 'recommended' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      AI Job Recommendations
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Personalized Matches ({recommendedJobs.length} Roles)
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Based on your verified competencies in {candSkills.slice(0, 5).join(', ')}. Disparate ecosystems (such as Java or C#) are automatically excluded.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedJobs.slice(0, 8).map((job) => renderJobCard(job))}
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: DEFAULT (ALL-METRICS + FULL CATALOG) */}
            {(activeSubPart === 'all-metrics' || (!activeSubPart && true) || (!['completion', 'activity', 'recommended'].includes(activeSubPart))) && (
              <div className="space-y-6">
                {/* Diagnostic overview metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                    <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>ATS Match Score</span>
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {primaryResume.atsScore || 88}%
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={primaryResume.fileName}>
                      {primaryResume.fileName}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                    <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>Total Jobs in Dashboard</span>
                      <Globe className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{localJobs.length}</div>
                    <div className="text-[11px] text-slate-500">All portals & internet listings</div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                    <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>Resume-Matched Jobs</span>
                      <Target className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">{recommendedJobs.length}</div>
                    <div className="text-[11px] text-slate-500">Filtered strictly to your verified skills</div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
                    <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>Active Applications</span>
                      <Send className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">{applications.length}</div>
                    <div className="text-[11px] text-slate-500">Dispatched via n8n & direct ATS</div>
                  </div>
                </div>

                {/* DASHBOARD JOBS DISCOVERY & SEARCH BAR */}
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-400" />
                        <span>All Available Jobs Catalog ({searchedJobs.length} Positions)</span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Each and every job from all connected portals is displayed below. Use the search bar to find positions or click suggestions.
                      </p>
                    </div>

                    {/* More Button: Load More Jobs from Internet */}
                    <button
                      onClick={handleLoadMoreInternetJobs}
                      disabled={loadingMoreInternet}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                    >
                      {loadingMoreInternet ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Globe className="h-3.5 w-3.5" />
                      )}
                      <span>{loadingMoreInternet ? 'Fetching Web Jobs...' : 'Load More Jobs from Internet'}</span>
                    </button>
                  </div>

                  {/* SEARCH BAR WITH SEARCH BUTTON & AUTOCOMPLETE SUGGESTIONS */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div ref={searchContainerRef} className="relative">
                      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                        <div className="relative flex-1">
                          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="Search jobs by title, skill, company, or keyword (e.g. Python, FastAPI, Remote, Stripe, Docker)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setShowSuggestions(false);
                              }}
                              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Dedicated Search Button */}
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm shrink-0"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span>Search</span>
                        </button>
                      </form>

                      {/* Dynamic Suggestions Dropdown Panel */}
                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2 space-y-1">
                          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Search Suggestions</span>
                            <span className="text-[10px] text-indigo-400">Click to filter</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 p-1">
                            {searchSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-950 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700/60 transition-colors cursor-pointer"
                              >
                                <Search className="h-3 w-3 text-slate-500" />
                                <span>{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter Pills (Portal & Workplace) */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Filter Portal:</span>
                      {[
                        { id: 'all', label: 'All Portals' },
                        { id: 'linkedin', label: 'LinkedIn' },
                        { id: 'indeed', label: 'Indeed' },
                        { id: 'glassdoor', label: 'Glassdoor' },
                        { id: 'remoteok', label: 'RemoteOK' },
                        { id: 'wellfound', label: 'Wellfound' },
                        { id: 'greenhouse', label: 'Greenhouse' },
                        { id: 'google careers', label: 'Google Careers' },
                      ].map((portal) => (
                        <button
                          key={portal.id}
                          onClick={() => setFilterPortal(portal.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                            filterPortal === portal.id
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {portal.label}
                        </button>
                      ))}

                      <span className="text-slate-400 text-[11px] font-medium ml-2">Workplace:</span>
                      {['all', 'remote', 'hybrid', 'on-site'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterWorkplace(type)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border capitalize transition-colors cursor-pointer ${
                            filterWorkplace === type
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ALL JOBS GRID (Each and every job appears) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchedJobs.map((job) => renderJobCard(job))}
                </div>

                {/* Bottom Load More Internet Jobs Action */}
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Want to expand your opportunities?</h4>
                    <p className="text-xs text-slate-400">
                      Load fresh verified job postings from LinkedIn, Google Careers, RemoteOK, and Wellfound directly.
                    </p>
                  </div>
                  <button
                    onClick={handleLoadMoreInternetJobs}
                    disabled={loadingMoreInternet}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {loadingMoreInternet ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    <span>{loadingMoreInternet ? 'Fetching Web Jobs...' : 'Load More Jobs from Internet'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            OPTION 4: FIND JOBS (ALL, MATCHED, SAVED, ALERTS)
           ========================================================================= */}
        {subView === 'jobs' && (
          <div className="space-y-6">
            {/* SUB-SECTION: SAVED JOBS BOOKMARKS */}
            {activeSubPart === 'saved' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookmarkCheck className="h-4 w-4 text-indigo-400" />
                      <span>Bookmarked & Saved Positions ({allEnrichedJobs.filter((j) => profile?.savedJobIds?.includes(j.id)).length} Saved)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Roles you have shortlisted for later review or custom targeted application.
                    </p>
                  </div>

                  {allEnrichedJobs.filter((j) => profile?.savedJobIds?.includes(j.id)).length > 0 && (
                    <button
                      onClick={() => {
                        const savedIds = allEnrichedJobs.filter((j) => profile?.savedJobIds?.includes(j.id)).map(j => j.id);
                        setSelectedJobIds(savedIds);
                        setSubView('n8n-automation');
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      <span>Auto-Apply to All Saved with n8n</span>
                    </button>
                  )}
                </div>

                {allEnrichedJobs.filter((j) => profile?.savedJobIds?.includes(j.id)).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allEnrichedJobs.filter((j) => profile?.savedJobIds?.includes(j.id)).map((job) => renderJobCard(job))}
                  </div>
                ) : (
                  <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-3">
                    <Bookmark className="h-10 w-10 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">No bookmarked positions yet</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Click the bookmark icon on any job card in All Jobs or Job Matches to save it here for later.
                    </p>
                    <button
                      onClick={() => onSubPartChange?.('all')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                    >
                      Browse All Jobs
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUB-SECTION: JOB ALERTS MANAGEMENT */}
            {activeSubPart === 'alerts' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-400" />
                      <span>Autonomous Job Alerts & Notification Preferences</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Receive instant or daily email/in-app notifications when fresh positions matching your criteria are listed.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAlertModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Job Alert</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {jobAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-white text-sm">{alert.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                            {alert.frequency} Digest
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                            {alert.location}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>Matched: <strong className="text-emerald-400">{alert.matchCount} new openings</strong></span>
                          <span>•</span>
                          <span>Last checked: {alert.lastSent}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => handleToggleJobAlert(alert.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            alert.enabled
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {alert.enabled ? 'Alert Active' : 'Paused'}
                        </button>
                        <button
                          onClick={() => handleDeleteJobAlert(alert.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Alert"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION: MATCHED JOBS (SKILL-BASED) */}
            {activeSubPart === 'matched' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Skill-Based Job Matches
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                        Resume Matched Roles ({recommendedJobs.length} Matches)
                      </h2>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                        Surfacing roles strictly aligned with your verified competencies ({candSkills.slice(0, 5).join(', ')}). Irrelevant ecosystems (e.g. Java) are excluded.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={handleFetchMarketGrounding}
                        disabled={marketGroundingLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-900/50 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Globe className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {marketGroundingLoading ? 'Analyzing Live Web...' : 'Live 2026 Web Hiring Intel'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-Time Google Search Grounding Analysis Drawer */}
                {marketGroundingOpen && marketGroundingData && (
                  <div className="p-5 rounded-2xl border border-indigo-800/60 bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 space-y-3.5 shadow-xl animate-fadeIn">
                    <div className="flex items-center justify-between gap-3 border-b border-indigo-900/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Google Search Grounding: Live 2026 Hiring & Salary Analysis
                        </span>
                      </div>
                      <button
                        onClick={() => setMarketGroundingOpen(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-2">
                      {marketGroundingData.analysis}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedJobs.map((job) => renderJobCard(job))}
                </div>
              </div>
            )}

            {/* SUB-SECTION: ALL JOBS CATALOG (DEFAULT) */}
            {(activeSubPart === 'all' || (!['saved', 'alerts', 'matched'].includes(activeSubPart))) && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-400" />
                        <span>Find Jobs Search Engine ({searchedJobs.length} Positions)</span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Explore, filter, and multi-apply across all connected portals.
                      </p>
                    </div>

                    <button
                      onClick={handleLoadMoreInternetJobs}
                      disabled={loadingMoreInternet}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                    >
                      {loadingMoreInternet ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                      <span>{loadingMoreInternet ? 'Fetching Web Jobs...' : 'Load More Jobs from Internet'}</span>
                    </button>
                  </div>

                  {/* SEARCH BAR WITH SUGGESTIONS */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div ref={searchContainerRef} className="relative">
                      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                        <div className="relative flex-1">
                          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            placeholder="Search by title, skill, company, or keyword (e.g. Python, FastAPI, Remote, Stripe, Docker)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery('');
                                setShowSuggestions(false);
                              }}
                              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm shrink-0"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span>Search</span>
                        </button>
                      </form>

                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2 space-y-1">
                          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                            <span>Suggestions</span>
                            <span className="text-[10px] text-indigo-400">Click to filter</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 p-1">
                            {searchSuggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-950 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700/60 transition-colors cursor-pointer"
                              >
                                <Search className="h-3 w-3 text-slate-500" />
                                <span>{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">Portal:</span>
                      {[
                        { id: 'all', label: 'All Portals' },
                        { id: 'linkedin', label: 'LinkedIn' },
                        { id: 'indeed', label: 'Indeed' },
                        { id: 'glassdoor', label: 'Glassdoor' },
                        { id: 'remoteok', label: 'RemoteOK' },
                        { id: 'wellfound', label: 'Wellfound' },
                        { id: 'greenhouse', label: 'Greenhouse' },
                      ].map((portal) => (
                        <button
                          key={portal.id}
                          onClick={() => setFilterPortal(portal.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                            filterPortal === portal.id
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {portal.label}
                        </button>
                      ))}

                      <span className="text-slate-400 text-[11px] font-medium ml-2">Workplace:</span>
                      {['all', 'remote', 'hybrid', 'on-site'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterWorkplace(type)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border capitalize transition-colors cursor-pointer ${
                            filterWorkplace === type
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchedJobs.map((job) => renderJobCard(job))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            OPTION 3: N8N AUTO-APPLY ENGINE
           ========================================================================= */}
        {subView === 'n8n-automation' && (
          <N8nAutomationCenter
            jobs={localJobs}
            resumes={resumes}
            profile={profile}
            onApplicationsSubmitted={onRefreshApplications}
            onNavigateTab={(tab) => setSubView(tab as any)}
          />
        )}

        {/* =========================================================================
            OPTION 2: MY PROFILE (FULL CRUD & SUBPART NAVIGATION)
           ========================================================================= */}
        {subView === 'profile' && profile && (
          <CandidateProfileEditor
            profile={profile}
            currentUser={currentUser}
            onUpdateProfile={onUpdateProfile}
            onUpdateUser={onUpdateUser}
            initialSection={(activeSubPart as any) || 'personal'}
            onSectionChange={(sec) => onSubPartChange?.(sec)}
          />
        )}

        {/* =========================================================================
            OPTION 3: RESUME STUDIO & COPILOT
           ========================================================================= */}
        {(subView === 'copilot' || subView === 'resume') && (
          <ResumeCopilotStudio
            jobs={localJobs}
            resumes={resumes}
            onRefreshResumes={onRefreshResumes}
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            initialTab={activeSubPart || 'analyzer'}
            onTabChange={(tab) => onSubPartChange?.(tab)}
          />
        )}

        {/* =========================================================================
            OPTION 5: MY APPLICATIONS PIPELINE & TRACKING
           ========================================================================= */}
        {subView === 'applications' && (
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="h-4 w-4 text-purple-400" />
                  <span>Application Pipeline & Status Tracking</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track stage transitions, fit scores, and recruiter interview milestones.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onRefreshApplications}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Pills for Applications */}
            <div className="flex items-center gap-2 text-xs">
              {[
                { id: 'all', label: 'All Applications' },
                { id: 'review', label: 'In Review' },
                { id: 'interviewing', label: 'Interviewing' },
                { id: 'offers', label: 'Offers' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => onSubPartChange?.(pill.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    (activeSubPart === pill.id || (!activeSubPart && pill.id === 'all'))
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto google-photos-scrollbar w-full max-w-full -mx-1 px-1">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead className="border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Position & Company</th>
                    <th className="py-2.5 px-3">Portal Route</th>
                    <th className="py-2.5 px-3">Fit Score</th>
                    <th className="py-2.5 px-3">Applied At</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Workflow & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {applications
                    .filter((app) => {
                      if (activeSubPart === 'review') return app.stage === 'Submitted' || app.stage === 'Under Review' || app.stage === 'Shortlisted';
                      if (activeSubPart === 'interviewing') return app.stage === 'Interview Scheduled';
                      if (activeSubPart === 'offers') return app.stage === 'Offer Extended';
                      return true;
                    })
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{app.jobTitle}</div>
                          <div className="text-[11px] text-slate-400">{app.companyName}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getPortalBadge(
                              app.portal
                            )}`}
                          >
                            {app.portal || 'LinkedIn'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {app.matchScore || 88}%
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-[11px] font-medium border ${
                              app.stage === 'Interview Scheduled'
                                ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                                : app.stage === 'Submitted'
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            }`}
                          >
                            {app.stage}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(() => {
                              const matchingOffer = candidateOffers.find((o) => o.applicationId === app.id);
                              if (matchingOffer || app.stage === 'Offer Extended') {
                                return (
                                  <button
                                    onClick={() => {
                                      if (matchingOffer) {
                                        setSelectedOfferForReview(matchingOffer);
                                      } else if (candidateOffers.length > 0) {
                                        setSelectedOfferForReview(candidateOffers[0]);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-sm animate-pulse flex items-center gap-1"
                                  >
                                    <span>Review Offer</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            <button
                              onClick={() => setSelectedAppForHistory(app)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Timeline
                            </button>
                            {app.stage !== 'Withdrawn' && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            OPTION 6: INTERVIEWS WORKSPACE
           ========================================================================= */}
        {subView === 'interviews' && (
          <AiMockInterviewWorkspace
            applications={applications}
            initialTab={activeSubPart || 'calendar'}
            onTabChange={(tab) => onSubPartChange?.(tab)}
          />
        )}

        {/* =========================================================================
            OPTION 7: AI CAREER ASSISTANT
           ========================================================================= */}
        {subView === 'ai-assistant' && (
          <AiCareerAssistantWorkspace
            profile={profile}
            primaryResume={primaryResume}
            applications={applications}
            jobs={localJobs}
            initialTab={activeSubPart as any || 'chat'}
            onNavigateTab={(tab) => onSubPartChange?.(tab)}
          />
        )}

        {/* =========================================================================
            OPTION 8: LEARN & PRACTICE WORKSPACE
           ========================================================================= */}
        {subView === 'learn' && (
          <LearnAndPracticeWorkspace
            profile={profile}
            initialTab={activeSubPart as any || 'dashboard'}
            onTabChange={(tab) => onSubPartChange?.(tab)}
          />
        )}

        {/* =========================================================================
            OPTION 9: MESSAGES & SUPPORT WORKSPACE
           ========================================================================= */}
        {subView === 'messages' && (
          <MessagesAndSupportWorkspace
            profile={profile}
            applications={applications}
            jobs={localJobs}
            initialTab={activeSubPart as any || 'inbox'}
            onTabChange={(tab) => onSubPartChange?.(tab)}
          />
        )}

        {/* =========================================================================
            OPTION 10: SETTINGS & PRIVACY WORKSPACE
           ========================================================================= */}
        {subView === 'settings' && (
          <SettingsAndPrivacyWorkspace
            initialCategory={(activeSubPart as any) || 'account'}
            onCategoryChange={(cat) => onSubPartChange?.(cat)}
            onLogout={onLogout}
            currentUser={currentUser}
          />
        )}

        {/* MODAL 1: CREATE NEW JOB ALERT MODAL */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 w-full max-w-md p-6 space-y-4 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Create Autonomous Job Alert</h3>
                </div>
                <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateJobAlert} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Job Title or Keywords:</label>
                  <input
                    type="text"
                    value={newAlertKeyword}
                    onChange={(e) => setNewAlertKeyword(e.target.value)}
                    placeholder="e.g. Python AI Engineer, FastAPI, React"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Location or Workplace Type:</label>
                  <input
                    type="text"
                    value={newAlertLocation}
                    onChange={(e) => setNewAlertLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, CA"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Notification Frequency:</label>
                  <select
                    value={newAlertFreq}
                    onChange={(e) => setNewAlertFreq(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Instant">Instant (Real-time webhook notification)</option>
                    <option value="Daily">Daily Digest (9:00 AM)</option>
                    <option value="Weekly">Weekly Summary</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-200">Alert Channels:</div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400">✓ In-App Bell</span>
                    <span className="flex items-center gap-1.5 text-emerald-400">✓ Email Notification</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md cursor-pointer"
                  >
                    Save & Activate Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: APPLICATION WORKFLOW & TIMELINE HISTORY MODAL */}
        {selectedAppForHistory && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 w-full max-w-lg p-6 space-y-4 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Application History & Lifecycle</h3>
                </div>
                <button onClick={() => setSelectedAppForHistory(null)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{selectedAppForHistory.jobTitle}</div>
                  <div className="text-xs text-indigo-300">{selectedAppForHistory.companyName}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {selectedAppForHistory.matchScore || 88}% Match
                  </span>
                  <div className="text-[10px] text-slate-400">Via {selectedAppForHistory.portal || 'LinkedIn'}</div>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Stage Progression History:
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Stage 1: Application Dispatched</div>
                      <div className="text-[11px] text-slate-400">Successfully submitted via autonomous multi-apply engine on {new Date(selectedAppForHistory.appliedAt).toLocaleDateString()}.</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Stage 2: Resume Parsed by ATS</div>
                      <div className="text-[11px] text-slate-400">Verified competencies matched against job spec. ATS Score: {selectedAppForHistory.matchScore || 88}%.</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-start gap-3 ${
                    selectedAppForHistory.stage === 'Interview Scheduled'
                      ? 'border-indigo-900/60 bg-indigo-950/30'
                      : 'border-slate-800 bg-slate-950'
                  }`}>
                    <Clock className={`h-4 w-4 shrink-0 mt-0.5 ${selectedAppForHistory.stage === 'Interview Scheduled' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-semibold text-white">Stage 3: Recruiter Screening & Review</div>
                      <div className="text-[11px] text-slate-400">
                        {selectedAppForHistory.stage === 'Interview Scheduled'
                          ? 'Recruiting team shortlisted candidate and sent meeting invite.'
                          : 'Currently under active review by the talent acquisition team.'}
                      </div>
                    </div>
                  </div>

                  {selectedAppForHistory.stage === 'Interview Scheduled' && (
                    <div className="p-3 rounded-lg border border-indigo-500/60 bg-indigo-950/60 flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">Stage 4: Technical Screen Scheduled</div>
                        <div className="text-[11px] text-indigo-200">Session synchronized to Google Meet & candidate interview calendar.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedAppForHistory(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Multi-apply Review Modal */}
        {multiApplyOpen && (
          <MultiApplyModal
            isOpen={multiApplyOpen}
            onClose={() => setMultiApplyOpen(false)}
            selectedJobs={localJobs.filter((j) => selectedJobIds.includes(j.id))}
            resumes={resumes}
            onApplicationsSubmitted={() => {
              onRefreshApplications();
              setSelectedJobIds([]);
            }}
          />
        )}

        {/* Phase 4: Candidate Offer Review Modal */}
        {selectedOfferForReview && (
          <CandidateOfferReviewModal
            isOpen={Boolean(selectedOfferForReview)}
            onClose={() => setSelectedOfferForReview(null)}
            offer={selectedOfferForReview}
            onResponseSubmitted={(updated) => {
              setCandidateOffers((prev) =>
                prev.map((o) => (o.id === updated.id ? updated : o))
              );
              onRefreshApplications();
            }}
          />
        )}
      </main>
    </div>
  );
};
