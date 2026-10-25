import React, { useState, useEffect } from 'react';
import {
  Application,
  Interview,
  Job,
  RecruiterInternalNote,
  CandidateMatchAnalysis,
  AIScreeningSummary,
  TalentPoolCandidate,
  CandidateComparisonItem,
  ApplicationStage,
} from '../../types';
import { apiClient } from '../../services/api';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  UserCheck,
  X,
  FileText,
  Download,
  Tag,
  Trash2,
  Plus,
  MessageSquare,
  AlertCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Bookmark,
  Check,
  Eye,
  Columns,
  List,
  Shield,
  HelpCircle,
  Copy,
  CheckCheck,
  SlidersHorizontal,
  ChevronRight,
  UserMinus,
  RefreshCw,
  FolderHeart,
} from 'lucide-react';

interface RecruiterApplicantsViewProps {
  jobs: Job[];
}

const STAGES: ApplicationStage[] = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Assessment',
  'Interview Scheduled',
  'Offer Extended',
  'Hired',
  'Rejected',
];

const PRESET_TAGS = [
  'Top Candidate',
  'High Priority',
  'Fast Track',
  'Strong Match',
  'Culture Fit',
  'Quick Screen',
  'Leadership Potential',
];

export const RecruiterApplicantsView: React.FC<RecruiterApplicantsViewProps> = ({ jobs }) => {
  // Main view mode: 'table' | 'kanban' | 'talent_pool'
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'talent_pool'>('table');
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [talentPoolList, setTalentPoolList] = useState<TalentPoolCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

  // Filter State
  const [filterJobId, setFilterJobId] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMinExp, setFilterMinExp] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<string>('all');

  // Multi-select for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('Qualifications did not align with current requisition priorities.');

  // Applicant Detail Drawer
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'match' | 'ai' | 'notes' | 'timeline'>('profile');
  const [newNoteText, setNewNoteText] = useState('');
  const [newCustomTag, setNewCustomTag] = useState('');
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);

  // Side-by-Side Comparison Modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState<{ job: Job | null; candidates: CandidateComparisonItem[] } | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Schedule Interview modal
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Notifications / feedback
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  useEffect(() => {
    loadApplicants();
    if (viewMode === 'talent_pool') {
      loadTalentPool();
    }
  }, [filterJobId, filterStage, viewMode]);

  const showNotification = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4500);
  };

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getRecruiterApplicants({
        jobId: filterJobId !== 'all' ? filterJobId : undefined,
        stage: filterStage !== 'all' ? filterStage : undefined,
      });
      setApplicants(res.applicants);
      setStageCounts(res.stageCounts || {});
    } catch (err) {
      console.warn('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTalentPool = async () => {
    try {
      const list = await apiClient.getTalentPool();
      setTalentPoolList(list);
    } catch (err) {
      console.warn('Failed to load talent pool:', err);
    }
  };

  const openApplicantDetail = async (appId: string) => {
    setSelectedAppId(appId);
    setDetailLoading(true);
    setDrawerTab('profile');
    try {
      const data = await apiClient.getRecruiterApplicationDetail(appId);
      setDetailData(data);
    } catch (err: any) {
      console.error('Failed to load applicant detail:', err);
      showNotification('Error loading candidate profile.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStageChange = async (appId: string, newStage: ApplicationStage, reason?: string) => {
    try {
      const updated = await apiClient.updateApplicantStage(appId, newStage, undefined, reason);
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: updated.stage } : a))
      );
      if (detailData && detailData.application.id === appId) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            stage: updated.stage,
            statusTimeline: updated.statusTimeline,
          },
        });
      }
      showNotification(`Candidate moved to "${newStage}".`);
    } catch (err: any) {
      console.error('Failed to update stage:', err);
      showNotification('Failed to update stage.');
    }
  };

  const handleAddNote = async () => {
    if (!selectedAppId || !newNoteText.trim()) return;
    try {
      const res = await apiClient.addRecruiterInternalNote(selectedAppId, newNoteText.trim());
      if (detailData) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            internalNotes: res.internalNotes,
          },
        });
      }
      setNewNoteText('');
      showNotification('Internal private note saved.');
    } catch (err) {
      showNotification('Failed to save note.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedAppId) return;
    try {
      await apiClient.deleteRecruiterInternalNote(selectedAppId, noteId);
      if (detailData) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            internalNotes: (detailData.application.internalNotes || []).filter(
              (n: RecruiterInternalNote) => n.id !== noteId
            ),
          },
        });
      }
      showNotification('Note removed.');
    } catch (err) {
      showNotification('Failed to delete note.');
    }
  };

  const handleAddTag = async (tagToAdd: string) => {
    if (!selectedAppId || !tagToAdd.trim()) return;
    try {
      const updatedTags = await apiClient.addApplicationTag(selectedAppId, tagToAdd.trim());
      if (detailData) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            tags: updatedTags,
          },
        });
      }
      setApplicants((prev) =>
        prev.map((a) => (a.id === selectedAppId ? { ...a, tags: updatedTags } : a))
      );
      setNewCustomTag('');
      showNotification(`Tag "${tagToAdd}" added.`);
    } catch (err) {
      showNotification('Failed to add tag.');
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!selectedAppId) return;
    try {
      const updatedTags = await apiClient.deleteApplicationTag(selectedAppId, tagToDelete);
      if (detailData) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            tags: updatedTags,
          },
        });
      }
      setApplicants((prev) =>
        prev.map((a) => (a.id === selectedAppId ? { ...a, tags: updatedTags } : a))
      );
      showNotification(`Tag "${tagToDelete}" removed.`);
    } catch (err) {
      showNotification('Failed to remove tag.');
    }
  };

  const handleRunAiMatch = async () => {
    if (!selectedAppId) return;
    setAiMatchLoading(true);
    try {
      const analysis = await apiClient.runAiCandidateMatch(selectedAppId);
      if (detailData) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            matchAnalysis: analysis,
            matchScore: analysis.overallScore,
          },
        });
      }
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === selectedAppId ? { ...a, matchAnalysis: analysis, matchScore: analysis.overallScore } : a
        )
      );
      showNotification('Explainable AI Match generated.');
    } catch (err) {
      showNotification('AI analysis generation failed.');
    } finally {
      setAiMatchLoading(false);
    }
  };

  const handleRunAiSummary = async () => {
    if (!selectedAppId) return;
    setAiSummaryLoading(true);
    try {
      const summary = await apiClient.runAiCandidateSummary(selectedAppId);
      if (detailData) {
        setDetailData({
          ...detailData,
          application: {
            ...detailData.application,
            aiSummary: summary,
          },
        });
      }
      showNotification('Screening questions generated.');
    } catch (err) {
      showNotification('Failed to generate summary.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleAddToTalentPool = async (appId: string) => {
    try {
      await apiClient.addCandidateToTalentPool({ applicationId: appId });
      showNotification('Candidate saved to Company Talent Pool.');
      loadTalentPool();
    } catch (err) {
      showNotification('Failed to save to talent pool.');
    }
  };

  const handleRemoveFromTalentPool = async (tpId: string) => {
    try {
      await apiClient.removeCandidateFromTalentPool(tpId);
      setTalentPoolList((prev) => prev.filter((t) => t.id !== tpId));
      showNotification('Candidate removed from Talent Pool.');
    } catch (err) {
      showNotification('Failed to remove from talent pool.');
    }
  };

  // Bulk Actions
  const handleBulkStageChange = async (targetStage: ApplicationStage) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await apiClient.bulkApplicantAction({
        applicationIds: selectedIds,
        action: 'stage_change',
        stage: targetStage,
      });
      setApplicants((prev) =>
        prev.map((a) => (selectedIds.includes(a.id) ? { ...a, stage: targetStage } : a))
      );
      setSelectedIds([]);
      showNotification(`Moved ${res.updatedCount} candidate(s) to "${targetStage}".`);
    } catch (err) {
      showNotification('Bulk stage update failed.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkAddTag = async () => {
    if (selectedIds.length === 0 || !bulkTagInput.trim()) return;
    setBulkActionLoading(true);
    try {
      const res = await apiClient.bulkApplicantAction({
        applicationIds: selectedIds,
        action: 'add_tag',
        tag: bulkTagInput.trim(),
      });
      loadApplicants();
      setSelectedIds([]);
      setShowBulkTagModal(false);
      setBulkTagInput('');
      showNotification(`Added tag "${bulkTagInput}" to ${res.updatedCount} candidate(s).`);
    } catch (err) {
      showNotification('Failed to add tag in bulk.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await apiClient.bulkApplicantAction({
        applicationIds: selectedIds,
        action: 'reject',
        rejectionReason: bulkRejectReason,
      });
      setApplicants((prev) =>
        prev.map((a) => (selectedIds.includes(a.id) ? { ...a, stage: 'Rejected' } : a))
      );
      setSelectedIds([]);
      setShowBulkRejectModal(false);
      showNotification(`Rejected ${res.updatedCount} candidate(s) with dignified notice.`);
    } catch (err) {
      showNotification('Bulk reject failed.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleCompareCandidates = async () => {
    if (selectedIds.length < 2 || selectedIds.length > 4) {
      showNotification('Select between 2 and 4 candidates to compare.');
      return;
    }
    setCompareLoading(true);
    setCompareModalOpen(true);
    try {
      const res = await apiClient.compareCandidates(selectedIds);
      setCompareData(res);
    } catch (err) {
      showNotification('Failed to generate comparison matrix.');
      setCompareModalOpen(false);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (filterJobId !== 'all') params.set('jobId', filterJobId);
    if (filterStage !== 'all') params.set('stage', filterStage);
    window.location.href = `/api/v1/recruiter/applications/export?${params.toString()}`;
    showNotification('Exporting sanitized CSV report...');
  };

  const handleInterviewScheduled = (newInt: Interview) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === newInt.applicationId ? { ...a, stage: 'Interview Scheduled' } : a))
    );
    showNotification(`Interview confirmed with candidate.`);
  };

  // Filter & Search Logic
  const filteredApplicants = applicants.filter((app) => {
    const matchJob = filterJobId === 'all' || app.jobId === filterJobId;
    const matchStage = filterStage === 'all' || app.stage.toLowerCase() === filterStage.toLowerCase();
    const candidateName = (app as any).candidateName || '';
    const headline = (app as any).candidateHeadline || '';
    const email = (app as any).candidateEmail || '';
    const skills = (app as any).candidateSkills || [];
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      candidateName.toLowerCase().includes(q) ||
      headline.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      skills.some((s: string) => s.toLowerCase().includes(q));

    const exp = (app as any).candidateExperienceYears || 0;
    const matchExp =
      filterMinExp === 'all'
        ? true
        : filterMinExp === '3'
        ? exp >= 3
        : filterMinExp === '5'
        ? exp >= 5
        : filterMinExp === '7'
        ? exp >= 7
        : true;

    const matchSkill =
      filterSkill === 'all'
        ? true
        : skills.some((s: string) => s.toLowerCase().includes(filterSkill.toLowerCase()));

    return matchJob && matchStage && matchSearch && matchExp && matchSkill;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 text-slate-100 text-left">
      {/* Toast Notification Banner */}
      {bannerNotice && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-cyan-950 border border-cyan-500/60 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Applicant Tracking System (ATS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Candidate Pipeline & Screening Command
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate semantic match scores, conduct structured reviews, schedule interviews, and manage your company talent pool.
          </p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('talent_pool')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'talent_pool'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Talent Pool</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Download sanitized CSV report"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stage Summary Cards / Metric Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { key: 'all', label: 'Total', count: stageCounts.all || applicants.length, color: 'text-white' },
          { key: 'Submitted', label: 'Applied', count: stageCounts.submitted || 0, color: 'text-cyan-400' },
          { key: 'Under Review', label: 'Review', count: stageCounts.under_review || 0, color: 'text-amber-400' },
          { key: 'Shortlisted', label: 'Shortlist', count: stageCounts.shortlisted || 0, color: 'text-indigo-400' },
          { key: 'Assessment', label: 'Assess', count: stageCounts.assessment || 0, color: 'text-purple-400' },
          { key: 'Interview Scheduled', label: 'Interview', count: stageCounts.interview_scheduled || 0, color: 'text-emerald-400' },
          { key: 'Offer Extended', label: 'Offer', count: stageCounts.offer_extended || 0, color: 'text-teal-400' },
          { key: 'Rejected', label: 'Rejected', count: stageCounts.rejected || 0, color: 'text-rose-400' },
        ].map((st) => (
          <button
            key={st.key}
            onClick={() => setFilterStage(st.key === 'all' ? 'all' : st.key)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              (st.key === 'all' && filterStage === 'all') || filterStage.toLowerCase() === st.key.toLowerCase()
                ? 'bg-slate-800/90 border-cyan-500/60 ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] text-slate-400 font-medium truncate">{st.label}</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${st.color}`}>
              {st.count}
            </div>
          </button>
        ))}
      </div>

      {/* Main Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, headline, skills, email..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Requisition dropdown */}
          <div>
            <select
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Requisitions ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <select
              value={filterMinExp}
              onChange={(e) => setFilterMinExp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">Experience (Any)</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="7">7+ Years</option>
            </select>
          </div>

          {/* Skills Filter */}
          <div>
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">Filter by Skill (Any)</option>
              <option value="Python">Python</option>
              <option value="Django">Django REST</option>
              <option value="React">React 19</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Kubernetes">Kubernetes</option>
              <option value="Vector">Vector DBs / RAG</option>
              <option value="PostgreSQL">PostgreSQL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Toolbar when 1+ selected */}
      {selectedIds.length > 0 && viewMode === 'table' && (
        <div className="sticky top-4 z-30 p-3 rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-mono px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40">
              {selectedIds.length} Selected
            </span>
            <span className="text-slate-400">Apply action across candidates:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Move Stage Dropdown */}
            <select
              disabled={bulkActionLoading}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStageChange(e.target.value as ApplicationStage);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">Move to Stage...</option>
              {STAGES.filter((s) => s !== 'Rejected').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Add Tag */}
            <button
              onClick={() => setShowBulkTagModal(true)}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Tag className="h-3 w-3 text-cyan-400" />
              <span>Add Tag</span>
            </button>

            {/* Compare (if 2-4) */}
            {selectedIds.length >= 2 && selectedIds.length <= 4 && (
              <button
                onClick={handleCompareCandidates}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/50 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <SlidersHorizontal className="h-3 w-3 text-indigo-300" />
                <span>Compare Side-by-Side</span>
              </button>
            )}

            {/* Reject */}
            <button
              onClick={() => setShowBulkRejectModal(true)}
              disabled={bulkActionLoading}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <UserMinus className="h-3 w-3" />
              <span>Bulk Reject</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* VIEW: TALENT POOL */}
      {viewMode === 'talent_pool' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-cyan-400" />
                <span>Company Talent Pool</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved candidate profiles for future openings, leadership roles, and proactive outreach.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
              {talentPoolList.length} Archived Prospects
            </span>
          </div>

          {talentPoolList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/60">
              Your company talent pool is currently empty. Star or save candidates from applicant reviews to build your private pipeline.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {talentPoolList.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                        {t.candidateName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{t.candidateName}</div>
                        <div className="text-xs text-slate-400">{t.candidateHeadline}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFromTalentPool(t.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove from Talent Pool"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {t.skills.slice(0, 5).map((sk) => (
                      <span key={sk} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {sk}
                      </span>
                    ))}
                    {t.skills.length > 5 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        +{t.skills.length - 5}
                      </span>
                    )}
                  </div>

                  {t.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                      <span className="text-slate-500 font-semibold mr-1.5">Archived Note:</span>
                      <span>{t.notes}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>Saved by {t.addedByRecruiterName}</span>
                    </span>
                    <a
                      href={`mailto:${t.candidateEmail}`}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      <span>{t.candidateEmail}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredApplicants.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Candidate & Role</th>
                  <th className="py-3 px-4">Fit Score</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                      No candidate applications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => {
                    const isChecked = selectedIds.includes(app.id);
                    const candidateName = (app as any).candidateName || 'Alex Chen';
                    const candidateHeadline = (app as any).candidateHeadline || 'Systems Engineer';
                    const jobTitle = (app as any).jobTitle || 'Senior AI Systems Architect';
                    const score = app.matchScore || 90;

                    return (
                      <tr
                        key={app.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isChecked ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectOne(app.id)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-[11px] text-white shrink-0">
                              {candidateName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => openApplicantDetail(app.id)}
                                className="font-bold text-white hover:text-cyan-300 transition-colors text-left truncate block cursor-pointer"
                              >
                                {candidateName}
                              </button>
                              <div className="text-[11px] text-slate-400 truncate">
                                {candidateHeadline} · <span className="text-slate-300">{jobTitle}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1 ${
                              score >= 90
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                                : score >= 80
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-600/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            <span>{score}%</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {(app as any).candidateExperienceYears || 4} yrs
                        </td>

                        <td className="py-3 px-4 text-slate-400 truncate max-w-[120px]">
                          {(app as any).candidateLocation || 'Remote'}
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setInterviewApp(app);
                                setScheduleModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                              title="Schedule Interview Round"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => openApplicantDetail(app.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                            >
                              <span>Dossier</span>
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px] items-start">
            {STAGES.map((stage) => {
              const stageApps = filteredApplicants.filter(
                (a) => a.stage.toLowerCase() === stage.toLowerCase()
              );

              return (
                <div
                  key={stage}
                  className="w-72 shrink-0 rounded-2xl bg-slate-900/70 border border-slate-800 p-3 space-y-3 flex flex-col max-h-[750px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {stage}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {stageApps.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                    {stageApps.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                        No candidates in this stage.
                      </div>
                    ) : (
                      stageApps.map((app) => {
                        const candidateName = (app as any).candidateName || 'Candidate';
                        const candidateHeadline = (app as any).candidateHeadline || 'Engineer';
                        const score = app.matchScore || 88;

                        return (
                          <div
                            key={app.id}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 shadow-sm transition-all space-y-2.5 text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                onClick={() => openApplicantDetail(app.id)}
                                className="font-bold text-white text-xs hover:text-cyan-300 transition-colors text-left line-clamp-1 cursor-pointer"
                              >
                                {candidateName}
                              </button>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 shrink-0">
                                {score}%
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-400 line-clamp-1">
                              {candidateHeadline}
                            </div>

                            {/* Tags */}
                            {app.tags && app.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {app.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Quick Action Progression */}
                            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                              <button
                                onClick={() => openApplicantDetail(app.id)}
                                className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Dossier</span>
                              </button>

                              <select
                                value={app.stage}
                                onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 focus:outline-none cursor-pointer"
                              >
                                {STAGES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPLICANT DETAIL DOSSIER DRAWER */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col text-left overflow-y-auto">
            {detailLoading || !detailData ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full space-y-3">
                <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="text-xs">Loading comprehensive candidate dossier...</span>
              </div>
            ) : (
              <>
                {/* Drawer Top Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                      {detailData.candidate.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{detailData.candidate.name}</h3>
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50 flex items-center gap-1 font-bold">
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          <span>{detailData.application.matchScore}% Match</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {detailData.candidate.headline} · Applied for <span className="text-white font-medium">{detailData.job.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/v1/recruiter/applications/${detailData.application.id}/resume`}
                      download
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Download Authorized Resume"
                    >
                      <Download className="h-4 w-4 text-cyan-400" />
                    </a>
                    <button
                      onClick={() => handleAddToTalentPool(detailData.application.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                      title="Add to Talent Pool"
                    >
                      <FolderHeart className="h-4 w-4 text-rose-400" />
                    </button>
                    <button
                      onClick={() => setSelectedAppId(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Stage Controls Bar */}
                <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Current Pipeline Stage:</span>
                    <select
                      value={detailData.application.stage}
                      onChange={(e) => handleStageChange(detailData.application.id, e.target.value as ApplicationStage)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setInterviewApp(detailData.application);
                        setScheduleModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Schedule Round</span>
                    </button>

                    <button
                      onClick={() => handleStageChange(detailData.application.id, 'Rejected', 'Role criteria did not match.')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-800 px-5 gap-4 text-xs font-medium text-slate-400 overflow-x-auto">
                  {[
                    { id: 'profile', label: 'Candidate Profile & Experience' },
                    { id: 'match', label: 'Side-by-Side Job Match' },
                    { id: 'ai', label: 'Explainable AI Match & Screening' },
                    { id: 'notes', label: `Internal Notes (${(detailData.application.internalNotes || []).length})` },
                    { id: 'timeline', label: 'Stage Audit Timeline' },
                  ].map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => setDrawerTab(tb.id as any)}
                      className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                        drawerTab === tb.id
                          ? 'border-cyan-400 text-cyan-300 font-bold'
                          : 'border-transparent hover:text-slate-200'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 space-y-6 flex-1">
                  {/* TAB 1: PROFILE & EXPERIENCE */}
                  {drawerTab === 'profile' && (
                    <div className="space-y-6">
                      {/* Contact & Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                          <span className="truncate">{detailData.candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                          <span>{detailData.candidate.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Briefcase className="h-4 w-4 text-slate-500 shrink-0" />
                          <span>{detailData.candidate.experienceYears}+ Years Exp</span>
                        </div>
                      </div>

                      {/* Bio */}
                      {detailData.candidate.bio && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Professional Summary</h4>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                            {detailData.candidate.bio}
                          </p>
                        </div>
                      )}

                      {/* Technical Skills Inventory */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Verified Technical Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {detailData.candidate.skills.map((sk: string) => (
                            <span key={sk} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-200 border border-slate-700">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Work Experience */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Work History</h4>
                        <div className="space-y-3">
                          {(detailData.candidate.experience || []).map((exp: any) => (
                            <div key={exp.id || exp.company} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white text-sm">{exp.position}</span>
                                <span className="text-slate-400 font-mono text-[11px]">{exp.startDate} - {exp.endDate || 'Present'}</span>
                              </div>
                              <div className="text-xs text-cyan-400 font-medium">{exp.company}</div>
                              {exp.description && <p className="text-xs text-slate-300">{exp.description}</p>}
                              {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                                  {exp.bullets.map((b: string, i: number) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Academic Credentials</h4>
                        <div className="space-y-2">
                          {(detailData.candidate.education || []).map((edu: any) => (
                            <div key={edu.id || edu.institution} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-white">{edu.degree}</div>
                                <div className="text-slate-400">{edu.institution} {edu.fieldOfStudy ? `· ${edu.fieldOfStudy}` : ''}</div>
                              </div>
                              {edu.graduationYear && (
                                <span className="font-mono text-slate-400 text-[11px]">Class of {edu.graduationYear}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Screening Answers */}
                      {detailData.application.screeningResponses && detailData.application.screeningResponses.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Candidate Application Responses</h4>
                          <div className="space-y-2.5">
                            {detailData.application.screeningResponses.map((sr: any, i: number) => (
                              <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                                <div className="font-semibold text-slate-300">Q: {sr.questionText}</div>
                                <div className="text-cyan-300 pl-2 border-l-2 border-cyan-500">A: {sr.answer}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SIDE-BY-SIDE JOB MATCH */}
                  {drawerTab === 'match' && (
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Skills Match</span>
                          <span className="text-xs font-mono font-bold text-cyan-300">
                            {detailData.sideBySideMatch.matchedRequiredSkills.length} of {detailData.sideBySideMatch.requiredSkills.length} Verified
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Matched Required Skills</span>
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {detailData.sideBySideMatch.matchedRequiredSkills.map((sk: string) => (
                                <span key={sk} className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 space-y-1.5">
                            <span className="font-bold text-rose-300 flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                              <span>Missing Required Skills</span>
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {detailData.sideBySideMatch.missingRequiredSkills.length === 0 ? (
                                <span className="text-slate-400 text-xs italic">All required skills present</span>
                              ) : (
                                detailData.sideBySideMatch.missingRequiredSkills.map((sk: string) => (
                                  <span key={sk} className="font-mono text-[11px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200">
                                    {sk}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Experience Comparison */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">Experience Seniority Check</div>
                          <div className="text-slate-400 mt-0.5">
                            Requisition requires <span className="text-white font-medium">{detailData.sideBySideMatch.experienceRequired}+ years</span>.
                            Candidate possesses <span className="text-cyan-300 font-medium">{detailData.sideBySideMatch.experienceCandidate} years</span>.
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                          {detailData.sideBySideMatch.experienceVerdict}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: EXPLAINABLE AI MATCH & SCREENING */}
                  {drawerTab === 'ai' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Explainable AI Candidate Matching (Gemini 3.8 Flash)</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Non-discriminatory explainable scoring grounded directly in candidate evidence snippets.
                          </p>
                        </div>
                        <button
                          onClick={handleRunAiMatch}
                          disabled={aiMatchLoading}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${aiMatchLoading ? 'animate-spin' : ''}`} />
                          <span>{detailData.application.matchAnalysis ? 'Re-run AI Analysis' : 'Evaluate Match'}</span>
                        </button>
                      </div>

                      {/* Advisory Notice */}
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/50 text-[11px] text-indigo-300 flex items-start gap-2">
                        <Shield className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Recruiter Governance Notice:</strong> AI candidate fit scoring is algorithmic decision-support guidance for human recruiter evaluation. All hiring determinations must be made by human interviewers in accordance with fair hiring standards.
                        </span>
                      </div>

                      {detailData.application.matchAnalysis && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="font-bold text-white">Algorithm Match Grade</span>
                            <span className="font-mono text-sm font-bold text-emerald-400">
                              {detailData.application.matchAnalysis.matchGrade} ({detailData.application.matchAnalysis.overallScore}%)
                            </span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-300 block mb-1">Key Strengths</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-300">
                              {detailData.application.matchAnalysis.keyStrengths.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>

                          {detailData.application.matchAnalysis.evidenceSnippets && (
                            <div>
                              <span className="font-bold text-slate-300 block mb-1">Evidence Citations</span>
                              <div className="space-y-1.5">
                                {detailData.application.matchAnalysis.evidenceSnippets.map((ev: string, i: number) => (
                                  <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-slate-400">
                                    {ev}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Resume Screening Questions */}
                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            AI-Assisted Screening Questions
                          </h4>
                          <button
                            onClick={handleRunAiSummary}
                            disabled={aiSummaryLoading}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            {detailData.application.aiSummary ? 'Refresh Questions' : 'Generate Screening Questions'}
                          </button>
                        </div>

                        {detailData.application.aiSummary && (
                          <div className="space-y-3">
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                              <span className="font-bold text-cyan-400 block mb-1">Executive Screening Summary</span>
                              {detailData.application.aiSummary.executiveSummary}
                            </div>

                            <div className="space-y-2">
                              {detailData.application.aiSummary.suggestedInterviewQuestions.map((qObj: any, idx: number) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-semibold text-white">Q{idx + 1}: {qObj.question}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(qObj.question);
                                        setCopiedQuestionIdx(idx);
                                        setTimeout(() => setCopiedQuestionIdx(null), 2000);
                                      }}
                                      className="text-slate-400 hover:text-cyan-300 p-1 shrink-0"
                                      title="Copy question text"
                                    >
                                      {copiedQuestionIdx === idx ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                  <div className="text-[11px] text-cyan-400">Focus: {qObj.focusArea}</div>
                                  <div className="text-[11px] text-slate-400">Expected Evidence: {qObj.expectedEvidence}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INTERNAL NOTES & TAGS */}
                  {drawerTab === 'notes' && (
                    <div className="space-y-5">
                      {/* Tags Manager */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Candidate Tags</span>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(detailData.application.tags || []).map((t: string) => (
                            <span key={t} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 font-medium">
                              <span>{t}</span>
                              <button
                                onClick={() => handleDeleteTag(t)}
                                className="text-slate-400 hover:text-rose-400 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Presets & Add custom */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-semibold">Quick Presets:</span>
                          {PRESET_TAGS.filter((pt) => !(detailData.application.tags || []).includes(pt)).slice(0, 4).map((pt) => (
                            <button
                              key={pt}
                              onClick={() => handleAddTag(pt)}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 cursor-pointer transition-colors"
                            >
                              + {pt}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={newCustomTag}
                            onChange={(e) => setNewCustomTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newCustomTag)}
                            placeholder="Add custom tag..."
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={() => handleAddTag(newCustomTag)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Internal Notes */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Private Recruiter Notes</span>
                          <span className="text-[11px] text-amber-400/90 font-medium">Internal Only · Strictly isolated from candidate</span>
                        </div>

                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Add an internal evaluation note for the recruiting team..."
                            className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={handleAddNote}
                            className="px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0"
                          >
                            Save Note
                          </button>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          {(detailData.application.internalNotes || []).length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
                              No internal recruiter notes added yet.
                            </div>
                          ) : (
                            detailData.application.internalNotes.map((note: RecruiterInternalNote) => (
                              <div key={note.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs text-left">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-white">{note.authorName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400 font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                                    <button
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{note.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: TIMELINE AUDIT */}
                  {drawerTab === 'timeline' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Stage Transition History</h4>
                      <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                        {(detailData.application.statusTimeline || []).map((tl: any, i: number) => (
                          <div key={i} className="relative space-y-1 text-xs">
                            <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{tl.stage}</span>
                              <span className="text-[11px] font-mono text-slate-400">{new Date(tl.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-cyan-400 font-medium">Actor: {tl.actor}</div>
                            {tl.note && <div className="text-slate-300 text-xs">{tl.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE CANDIDATE COMPARISON MODAL */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                  <span>Candidate Side-by-Side Comparison</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct evaluation across verified skills, match score, experience, and current pipeline stage.
                </p>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {compareLoading || !compareData ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                <span>Assembling comparison matrix...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compareData.candidates.map((cand) => (
                    <div
                      key={cand.applicationId}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {cand.candidateName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{cand.candidateName}</div>
                            <div className="text-[11px] text-slate-400 truncate">{cand.candidateHeadline}</div>
                          </div>
                        </div>

                        {/* Match score */}
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Fit Score:</span>
                          <span className="font-mono font-bold text-cyan-300 text-sm">{cand.matchScore}%</span>
                        </div>

                        {/* Experience & Education */}
                        <div className="text-xs space-y-1 text-slate-300">
                          <div><strong>Experience:</strong> {cand.experienceYears} Years</div>
                          <div><strong>Education:</strong> {cand.education}</div>
                          <div><strong>Location:</strong> {cand.location}</div>
                        </div>

                        {/* Skills Matched */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-emerald-400 block">Matched Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {cand.matchedRequiredSkills.map((sk: string) => (
                              <span key={sk} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-200 border border-emerald-800/40">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing Skills */}
                        {cand.missingRequiredSkills.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-rose-400 block">Missing Skills:</span>
                            <div className="flex flex-wrap gap-1">
                              {cand.missingRequiredSkills.map((sk: string) => (
                                <span key={sk} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-200 border border-rose-800/40">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800">
                        <select
                          value={cand.stage}
                          onChange={(e) => handleStageChange(cand.applicationId, e.target.value as ApplicationStage)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 cursor-pointer"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK TAG MODAL */}
      {showBulkTagModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-cyan-400" />
              <span>Add Tag to {selectedIds.length} Candidates</span>
            </h3>
            <input
              type="text"
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              placeholder="e.g. High Priority, Front Runner..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkTagModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAddTag}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white font-semibold text-xs cursor-pointer"
              >
                Apply Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK REJECT MODAL */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <UserMinus className="h-4 w-4" />
              <span>Reject {selectedIds.length} Candidate(s)?</span>
            </h3>
            <p className="text-xs text-slate-300">
              Candidates will receive a dignified, respectful notification regarding their application status.
            </p>
            <textarea
              rows={3}
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Reason for record..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkRejectModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewApp && (
        <ScheduleInterviewModal
          isOpen={scheduleModalOpen}
          application={interviewApp}
          onClose={() => setScheduleModalOpen(false)}
          onSuccess={handleInterviewScheduled}
        />
      )}
    </div>
  );
};
