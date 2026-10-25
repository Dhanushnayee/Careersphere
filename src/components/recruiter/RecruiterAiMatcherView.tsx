import React, { useState, useEffect } from 'react';
import {
  AiMatcherJobSummary,
  AiMatcherCandidate,
  AiMatcherComparisonResult,
} from '../../types';
import { apiClient } from '../../services/api';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  Users,
  Briefcase,
  ChevronRight,
  UserCheck,
  FileText,
  Building,
  MapPin,
  Clock,
  Layers,
  HelpCircle,
  ExternalLink,
  SlidersHorizontal,
  Scale,
  Award,
  Zap,
} from 'lucide-react';

interface RecruiterAiMatcherViewProps {
  initialJobId?: string;
  onNavigateToApplicants?: (jobId: string) => void;
}

export const RecruiterAiMatcherView: React.FC<RecruiterAiMatcherViewProps> = ({
  initialJobId,
  onNavigateToApplicants,
}) => {
  // Authorized Jobs State
  const [jobs, setJobs] = useState<AiMatcherJobSummary[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || '');
  const [jobsLoading, setJobsLoading] = useState(true);

  // Candidates Matcher State
  const [candidates, setCandidates] = useState<AiMatcherCandidate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cachedCount, setCachedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<AiMatcherJobSummary | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [minExpFilter, setMinExpFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'talent_pool'>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'exp_desc' | 'name_asc'>('score_desc');

  // UI Interaction States
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<AiMatcherComparisonResult | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const [dossierCandidate, setDossierCandidate] = useState<AiMatcherCandidate | null>(null);
  const [analyzingCandidateId, setAnalyzingCandidateId] = useState<string | null>(null);
  const [shortlistingCandidateId, setShortlistingCandidateId] = useState<string | null>(null);
  const [refreshingCache, setRefreshingCache] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  // Notification Banner Timer
  useEffect(() => {
    if (actionNotice) {
      const timer = setTimeout(() => setActionNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionNotice]);

  // Load Authorized Jobs on Mount
  useEffect(() => {
    async function fetchAuthorizedJobs() {
      setJobsLoading(true);
      try {
        const authorizedJobs = await apiClient.getMatcherJobs();
        setJobs(authorizedJobs);
        if (authorizedJobs.length > 0) {
          const matchJob = initialJobId && authorizedJobs.some((j) => j.id === initialJobId)
            ? initialJobId
            : authorizedJobs[0].id;
          setSelectedJobId(matchJob);
        }
      } catch (err: any) {
        console.error('Failed to load matcher jobs:', err);
      } finally {
        setJobsLoading(false);
      }
    }
    fetchAuthorizedJobs();
  }, [initialJobId]);

  // Load Candidates when selectedJobId, filters, or page changes
  useEffect(() => {
    if (!selectedJobId) return;

    let isSubscribed = true;
    async function fetchMatches() {
      setCandidatesLoading(true);
      try {
        const minExpNum = minExpFilter !== 'all' ? parseInt(minExpFilter, 10) : undefined;
        const res = await apiClient.getMatcherCandidates({
          jobId: selectedJobId,
          search: searchQuery.trim() || undefined,
          minExperience: minExpNum,
          status: statusFilter,
          sortBy,
          page,
          limit: 10,
        });

        if (isSubscribed) {
          setActiveJob(res.job);
          setCandidates(res.candidates || []);
          setTotalCount(res.totalCount || 0);
          setCachedCount(res.cachedCount || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err: any) {
        console.error('Failed to load candidate matches:', err);
      } finally {
        if (isSubscribed) setCandidatesLoading(false);
      }
    }

    fetchMatches();
    return () => {
      isSubscribed = false;
    };
  }, [selectedJobId, searchQuery, minExpFilter, statusFilter, sortBy, page]);

  // Trigger Deep AI Analysis for a Candidate
  const handleRunAiAnalysis = async (candidateId: string) => {
    if (!selectedJobId) return;
    setAnalyzingCandidateId(candidateId);
    try {
      const result = await apiClient.analyzeMatcherCandidate(selectedJobId, candidateId, true);
      const updated = result.candidate;
      setCandidates((prev) =>
        prev.map((c) => (c.candidateId === candidateId ? updated : c))
      );
      if (dossierCandidate && dossierCandidate.candidateId === candidateId) {
        setDossierCandidate(updated);
      }
      setActionNotice(`Deep AI analysis generated for ${updated.candidateName}. Engine: ${updated.aiEngine || 'AI Model'}`);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setActionNotice('AI analysis encounter an error, deterministic rule-based match used.');
    } finally {
      setAnalyzingCandidateId(null);
    }
  };

  // Shortlist Candidate into Application Workflow
  const handleShortlistCandidate = async (candidateId: string, candidateName: string) => {
    if (!selectedJobId) return;
    setShortlistingCandidateId(candidateId);
    try {
      const res = await apiClient.shortlistMatcherCandidate(selectedJobId, candidateId);
      if (res.success) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.candidateId === candidateId
              ? {
                  ...c,
                  isApplied: true,
                  applicationStage: 'Shortlisted',
                  applicationId: res.application?.id || c.applicationId,
                }
              : c
          )
        );
        setActionNotice(`${candidateName} has been shortlisted! Timeline updated & candidate notified.`);
      }
    } catch (err: any) {
      console.error('Shortlist error:', err);
      setActionNotice('Failed to shortlist candidate. Please try again.');
    } finally {
      setShortlistingCandidateId(null);
    }
  };

  // Recalculate / Invalidate Cache
  const handleRecalculateMatches = async () => {
    if (!selectedJobId) return;
    setRefreshingCache(true);
    try {
      await apiClient.invalidateMatcherCache(selectedJobId);
      // Re-fetch matches
      const minExpNum = minExpFilter !== 'all' ? parseInt(minExpFilter, 10) : undefined;
      const res = await apiClient.getMatcherCandidates({
        jobId: selectedJobId,
        search: searchQuery.trim() || undefined,
        minExperience: minExpNum,
        status: statusFilter,
        sortBy,
        page: 1,
        limit: 10,
      });
      setActiveJob(res.job);
      setCandidates(res.candidates || []);
      setTotalCount(res.totalCount || 0);
      setCachedCount(res.cachedCount || 0);
      setTotalPages(res.totalPages || 1);
      setPage(1);
      setActionNotice('Match cache refreshed and scores recalculated from latest requisition data.');
    } catch (err: any) {
      console.error('Recalculate error:', err);
    } finally {
      setRefreshingCache(false);
    }
  };

  // Toggle selection for comparison (2 to 4 candidates)
  const handleToggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      } else {
        if (prev.length >= 4) {
          setActionNotice('You can compare a maximum of 4 candidates side-by-side.');
          return prev;
        }
        return [...prev, candidateId];
      }
    });
  };

  // Open Comparison Modal
  const handleOpenComparison = async () => {
    if (!selectedJobId || selectedCandidateIds.length < 2) return;
    setComparisonLoading(true);
    setComparisonModalOpen(true);
    try {
      const res = await apiClient.compareMatcherCandidates(selectedJobId, selectedCandidateIds);
      setComparisonData(res);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setActionNotice('Failed to generate candidate comparison matrix.');
    } finally {
      setComparisonLoading(false);
    }
  };

  // Grade color helper
  const getGradeBadge = (grade: 'Excellent' | 'Good' | 'Moderate' | 'Low', score: number) => {
    switch (grade) {
      case 'Excellent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-sm shadow-emerald-900/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {score}% · Excellent Fit
          </span>
        );
      case 'Good':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-600/50 shadow-sm shadow-cyan-900/30">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {score}% · Good Fit
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {score}% · Moderate Fit
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            {score}% · Low Alignment
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* -------------------------------------------------------------------------
          HEADER & STATUS BANNER
         ------------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                AI Candidate Matcher
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
                  Live Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Transparent 3-stage matching pipeline: Deterministic Filtering &rarr; Explainable Scoring &rarr; Bounded Gemini AI Analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculateMatches}
            disabled={refreshingCache || !selectedJobId}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Recalculate match scores and refresh version cache"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshingCache ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Recalculate Matches</span>
          </button>

          {selectedCandidateIds.length >= 2 && (
            <button
              onClick={handleOpenComparison}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-600/25 transition-all cursor-pointer animate-pulse"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Compare Selected ({selectedCandidateIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-700/80 text-cyan-200 text-xs flex items-center justify-between gap-3 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-cyan-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          JOB REQUISITION SELECTOR & ACTIVE REQUISITION SUMMARY
         ------------------------------------------------------------------------- */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            <span>Select Target Requisition</span>
            <span className="text-[11px] text-slate-500 normal-case font-normal">
              (Authorized company jobs only)
            </span>
          </label>

          <div className="w-full sm:w-80">
            {jobsLoading ? (
              <div className="h-10 rounded-xl bg-slate-800 animate-pulse" />
            ) : jobs.length === 0 ? (
              <div className="text-xs text-amber-400">No authorized open requisitions found.</div>
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setSelectedCandidateIds([]);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} · {j.location} ({j.minExperienceYears}+ yrs exp)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Selected Job Highlights */}
        {activeJob && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px] block">Role & Department</span>
              <div className="font-bold text-white truncate">{activeJob.title}</div>
              <div className="text-slate-400 text-[11px]">{activeJob.department} · {activeJob.workplaceType}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px] block">Required Experience Baseline</span>
              <div className="font-bold text-cyan-300">
                {activeJob.minExperienceYears}+ Years Experience
              </div>
              <div className="text-slate-400 text-[11px]">
                {activeJob.employmentType} · {activeJob.educationLevel || 'Degree Required'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px] block">Mandatory Required Skills ({activeJob.skillsRequired.length})</span>
              <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto pr-1">
                {activeJob.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[11px] block">Match Pipeline Status</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{totalCount} Candidates</span>
                <span className="text-slate-500 text-[10px]">({cachedCount} cached)</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Active Requisition: <span className="text-emerald-400 font-semibold">{activeJob.status}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------------
          FILTER & SEARCH CONTROLS
         ------------------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by skill, headline, candidate name or location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Min Experience Filter */}
          <div className="md:col-span-2">
            <select
              value={minExpFilter}
              onChange={(e) => {
                setMinExpFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">Any Experience</option>
              <option value="2">2+ Years</option>
              <option value="4">4+ Years</option>
              <option value="6">6+ Years</option>
              <option value="8">8+ Years</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="all">All Candidates</option>
              <option value="applied">Applied Candidates</option>
              <option value="talent_pool">Talent Pool (Unapplied)</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="score_desc">Match Score: High to Low</option>
              <option value="score_asc">Match Score: Low to High</option>
              <option value="exp_desc">Experience: High to Low</option>
              <option value="name_asc">Candidate Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Multi-Select Comparison Guidance */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <Scale className="h-3.5 w-3.5 text-cyan-400" />
            <span>Select 2 to 4 candidate checkboxes to evaluate side-by-side on uniform criteria.</span>
          </div>
          <div className="text-slate-500">
            Selected: <span className="font-semibold text-white">{selectedCandidateIds.length} / 4</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          CANDIDATES MATCH LIST
         ------------------------------------------------------------------------- */}
      {candidatesLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">
            Evaluating candidates across deterministic requirements and scoring weights...
          </p>
          <p className="text-xs text-slate-500">Comparing required skills, experience alignment, and qualifications.</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <HelpCircle className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Candidates Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No candidates matched the current search or experience filter for this requisition. Try adjusting your filters or clearing search criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setMinExpFilter('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand) => {
            const isSelected = selectedCandidateIds.includes(cand.candidateId);
            const isAnalyzing = analyzingCandidateId === cand.candidateId;
            const isShortlisting = shortlistingCandidateId === cand.candidateId;
            const isBreakdownExpanded = expandedBreakdownId === cand.candidateId;

            return (
              <div
                key={cand.candidateId}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Candidate Header & Scoring Dial */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Checkbox + Identity */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectCandidate(cand.candidateId)}
                      className="mt-1 h-4 w-4 rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
                      title="Select for side-by-side comparison"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-white hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => setDossierCandidate(cand)}>
                          {cand.candidateName}
                        </span>
                        {cand.isApplied ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                            Applied: {cand.applicationStage || 'In Review'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            Talent Pool (Unapplied)
                          </span>
                        )}
                        {cand.hasResume && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                            <FileText className="h-3 w-3" />
                            Resume Verified
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-medium truncate">
                        {cand.headline}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {cand.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {cand.experienceYears} Years Verified Exp
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-slate-500" />
                          {cand.education} ({cand.institution})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Match Score Dial & Actions */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      {getGradeBadge(cand.matchGrade, cand.overallScore)}
                      <button
                        onClick={() =>
                          setExpandedBreakdownId(isBreakdownExpanded ? null : cand.candidateId)
                        }
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline mt-1 cursor-pointer flex items-center gap-1"
                      >
                        <Layers className="h-2.5 w-2.5" />
                        {isBreakdownExpanded ? 'Hide Math Breakdown' : 'Show Score Math'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunAiAnalysis(cand.candidateId)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                        title="Run on-demand deep analysis"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                        <span>{cand.isAiAnalyzed ? 'Re-Analyze AI' : 'Deep AI Analysis'}</span>
                      </button>

                      <button
                        onClick={() => handleShortlistCandidate(cand.candidateId, cand.candidateName)}
                        disabled={isShortlisting || cand.applicationStage === 'Shortlisted'}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cand.applicationStage === 'Shortlisted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 cursor-default'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-600/30'
                        }`}
                      >
                        {isShortlisting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {cand.applicationStage === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mathematical Transparent Scoring Breakdown (Collapsible) */}
                {isBreakdownExpanded && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-1.5">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Scale className="h-3.5 w-3.5" />
                        Reproducible Score Calculation Formula
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Score = (Req &times; 50%) + (Exp &times; 25%) + (Pref &times; 15%) + (Edu/Work &times; 10%)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="text-slate-400">Required Skills (50%)</div>
                        <div className="text-base font-bold text-white">
                          {cand.scoreBreakdown.requiredSkillsScore}%
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          {cand.requiredSkillsMatched.length} of {activeJob?.skillsRequired.length || 0} matched
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="text-slate-400">Experience Alignment (25%)</div>
                        <div className="text-base font-bold text-white">
                          {cand.scoreBreakdown.experienceScore}%
                        </div>
                        <div className="text-[10px] text-cyan-300">
                          {cand.experienceAlignment.verdict}: {cand.experienceYears} yrs vs {activeJob?.minExperienceYears} yrs
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="text-slate-400">Preferred Skills (15%)</div>
                        <div className="text-base font-bold text-white">
                          {cand.scoreBreakdown.preferredSkillsScore}%
                        </div>
                        <div className="text-[10px] text-indigo-300">
                          {cand.preferredSkillsMatched.length} of {activeJob?.preferredSkills?.length || 0} matched
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="text-slate-400">Education & Work Mode (10%)</div>
                        <div className="text-base font-bold text-white">
                          {cand.scoreBreakdown.educationWorkplaceScore}%
                        </div>
                        <div className="text-[10px] text-slate-300">
                          {cand.workplacePreference || 'Remote Flexible'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Criteria Match Details: Required Skills, Missing Skills & Experience */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2.5 text-xs">
                  {/* Skills Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">Required Skills:</span>
                    {cand.requiredSkillsMatched.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/50"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {s}
                      </span>
                    ))}
                    {cand.requiredSkillsMissing.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/50 text-rose-300 border border-rose-800/40"
                      >
                        <X className="h-3 w-3 text-rose-400" />
                        Missing: {s}
                      </span>
                    ))}
                  </div>

                  {/* Preferred & Related Skills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {cand.preferredSkillsMatched.length > 0 && (
                      <>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Preferred:</span>
                        {cand.preferredSkillsMatched.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800/50"
                          >
                            <Award className="h-3 w-3 text-indigo-400" />
                            {s}
                          </span>
                        ))}
                      </>
                    )}

                    {cand.relatedSkills.length > 0 && (
                      <>
                        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Related:</span>
                        {cand.relatedSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {s}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {/* AI Analysis Card (Key Strengths & Potential Gaps) */}
                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        Job Alignment & Evidence Summary
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400">
                        Engine: {cand.aiEngine || 'Deterministic Rule-Based Match'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[11px] font-semibold text-emerald-400 mb-1">Key Strengths</div>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {cand.keyStrengths.slice(0, 2).map((st, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400">&bull;</span>
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-amber-400 mb-1">Potential Considerations</div>
                        <ul className="space-y-1 text-slate-400 text-[11px]">
                          {cand.potentialGaps.slice(0, 2).map((gap, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400">&bull;</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Evidence Snippet */}
                    {cand.evidenceSnippets.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 italic">
                        {cand.evidenceSnippets[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* -------------------------------------------------------------------------
              PAGINATION
             ------------------------------------------------------------------------- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Showing page <span className="font-semibold text-white">{page}</span> of{' '}
                <span className="font-semibold text-white">{totalPages}</span> ({totalCount} total candidates)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          FAIRNESS & ADVISORY NOTICE BANNER
         ------------------------------------------------------------------------- */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-300">Non-Discrimination & Human-in-the-Loop Safeguard</div>
          <div>
            AI Candidate Match scores and insights are strictly advisory. The matching engine evaluates objective job requirements, skills coverage, and verifiable work history without evaluating protected characteristics (name, age, gender, ethnicity). Human recruiters retain complete discretion and responsibility for all hiring decisions.
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          SIDE-BY-SIDE COMPARISON MODAL
         ------------------------------------------------------------------------- */}
      {comparisonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="h-4 w-4 text-cyan-400" />
                  Side-by-Side Candidate Comparison Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Target Requisition: <span className="font-semibold text-cyan-300">{activeJob?.title}</span> ({activeJob?.department})
                </p>
              </div>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {comparisonLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                  <p className="text-xs text-slate-400">Constructing comparison matrix across selected candidates...</p>
                </div>
              ) : comparisonData ? (
                <div className="space-y-6">
                  {/* Candidates Top Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {comparisonData.candidates.map((cand) => (
                      <div
                        key={cand.candidateId}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-sm text-white truncate">{cand.candidateName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{cand.headline}</div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Match Score:</span>
                          {getGradeBadge(cand.matchGrade, cand.overallScore)}
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Experience:</span>
                            <span className="font-semibold text-white">{cand.experienceYears} yrs</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Skills Coverage:</span>
                            <span className="font-semibold text-emerald-400">{cand.skillsCoveragePercentage}%</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Status:</span>
                            <span className="text-cyan-300">{cand.isApplied ? 'Applied' : 'Talent Pool'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleShortlistCandidate(cand.candidateId, cand.candidateName)}
                          disabled={cand.applicationStage === 'Shortlisted'}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            cand.applicationStage === 'Shortlisted'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          }`}
                        >
                          {cand.applicationStage === 'Shortlisted' ? 'Shortlisted' : 'Shortlist Candidate'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Skills Coverage Matrix */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Technical Skills Coverage Matrix
                    </h4>
                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                          <tr>
                            <th className="p-3">Skill Requirement</th>
                            <th className="p-3">Requirement Type</th>
                            {comparisonData.candidates.map((c) => (
                              <th key={c.candidateId} className="p-3 text-center">
                                {c.candidateName.split(' ')[0]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {comparisonData.matrix.skills.map((row) => (
                            <tr key={row.skillName} className="hover:bg-slate-800/40">
                              <td className="p-3 font-semibold text-white">{row.skillName}</td>
                              <td className="p-3">
                                {row.isRequired ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                                    Preferred
                                  </span>
                                )}
                              </td>
                              {comparisonData.candidates.map((cand) => {
                                const hasSkill = row.candidateMap[cand.candidateId];
                                return (
                                  <td key={cand.candidateId} className="p-3 text-center">
                                    {hasSkill ? (
                                      <span className="inline-flex items-center text-emerald-400 font-bold">
                                        <CheckCircle2 className="h-4 w-4" />
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-slate-600">
                                        <X className="h-4 w-4" />
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Pros & Considerations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {comparisonData.candidates.map((cand) => (
                      <div key={cand.candidateId} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="font-bold text-slate-300">{cand.candidateName.split(' ')[0]}'s Assessment</div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-emerald-400">Top Strengths:</div>
                          <ul className="text-[10px] text-slate-300 space-y-0.5">
                            {cand.pros.map((p, i) => (
                              <li key={i}>&bull; {p}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-amber-400">Gaps:</div>
                          <ul className="text-[10px] text-slate-400 space-y-0.5">
                            {cand.cons.map((c, i) => (
                              <li key={i}>&bull; {c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          CANDIDATE DOSSIER MODAL
         ------------------------------------------------------------------------- */}
      {dossierCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-left">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{dossierCandidate.candidateName}</span>
                  {getGradeBadge(dossierCandidate.matchGrade, dossierCandidate.overallScore)}
                </h3>
                <p className="text-xs text-slate-400">{dossierCandidate.headline}</p>
              </div>
              <button
                onClick={() => setDossierCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Experience</span>
                  <div className="font-bold text-white">{dossierCandidate.experienceYears} Years</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Location</span>
                  <div className="font-bold text-white truncate">{dossierCandidate.location}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Education</span>
                  <div className="font-bold text-white truncate">{dossierCandidate.education}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase">Workplace Fit</span>
                  <div className="font-bold text-cyan-300">{dossierCandidate.workplacePreference || 'Remote'}</div>
                </div>
              </div>

              {/* Verified Technical Skills */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-300">Platform Verified Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {dossierCandidate.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 text-slate-200 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tailored Interview Questions */}
              {dossierCandidate.tailoredInterviewQuestions?.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    AI Tailored Screening Questions
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {dossierCandidate.tailoredInterviewQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Evaluation timestamp: {new Date(dossierCandidate.lastEvaluatedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDossierCandidate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleShortlistCandidate(dossierCandidate.candidateId, dossierCandidate.candidateName);
                    setDossierCandidate(null);
                  }}
                  disabled={dossierCandidate.applicationStage === 'Shortlisted'}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                >
                  {dossierCandidate.applicationStage === 'Shortlisted' ? 'Already Shortlisted' : 'Shortlist Candidate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
