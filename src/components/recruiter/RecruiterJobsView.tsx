import React, { useState, useEffect } from 'react';
import { Job, Company, JobStatus } from '../../types';
import { apiClient } from '../../services/api';
import { JobCreationWizard } from './JobCreationWizard';
import { JobDetailsModal } from './JobDetailsModal';
import { JobPreviewModal } from './JobPreviewModal';
import { JobStatusConfirmModal } from './JobStatusConfirmModal';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Loader2,
  DollarSign,
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Edit,
  Copy,
  Pause,
  Play,
  RotateCcw,
  LayoutGrid,
  List,
  ArrowUpDown,
  Sparkles,
  Calendar,
  Building,
  FileText,
} from 'lucide-react';

interface RecruiterJobsViewProps {
  jobs: Job[];
  company: Company | null;
  onJobCreated: (job: Job) => void;
  onJobUpdated?: (job: Job) => void;
  onRefreshJobs: () => void;
  onNavigateToVerification?: () => void;
  onNavigateToApplicants?: (jobId?: string) => void;
  initialOpenCreateWizard?: boolean;
}

export const RecruiterJobsView: React.FC<RecruiterJobsViewProps> = ({
  jobs,
  company,
  onJobCreated,
  onJobUpdated,
  onRefreshJobs,
  onNavigateToVerification,
  onNavigateToApplicants,
  initialOpenCreateWizard = false,
}) => {
  // Filters & Query state
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedWorkplace, setSelectedWorkplace] = useState('all');
  const [selectedEmployment, setSelectedEmployment] = useState('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'deadline' | 'applicantsCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Server data state
  const [serverJobs, setServerJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    all: 0,
    active: 0,
    draft: 0,
    pending_approval: 0,
    paused: 0,
    closed: 0,
    rejected: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [wizardOpen, setWizardOpen] = useState(initialOpenCreateWizard);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [confirmJob, setConfirmJob] = useState<Job | null>(null);
  const [confirmAction, setConfirmAction] = useState<'publish' | 'pause' | 'resume' | 'close' | 'reopen' | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (initialOpenCreateWizard) {
      setEditingJob(null);
      setWizardOpen(true);
    }
  }, [initialOpenCreateWizard]);

  const isVerified = company?.isVerified && company?.verificationStatus === 'verified';

  // Fetch jobs from server with filters
  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getRecruiterJobs({
        search: searchQuery.trim() || undefined,
        status: activeTab !== 'all' ? activeTab : undefined,
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
        workplaceType: selectedWorkplace !== 'all' ? selectedWorkplace : undefined,
        employmentType: selectedEmployment !== 'all' ? selectedEmployment : undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      });

      setServerJobs(res.jobs);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setStatusCounts(res.statusCounts);
    } catch (err: any) {
      console.warn('Failed to load recruiter jobs:', err);
      // Fallback to local filtering
      const companyJobs = company ? jobs.filter((j) => j.companyId === company.id) : jobs;
      setServerJobs(companyJobs);
      setTotalCount(companyJobs.length);
      setStatusCounts({
        all: companyJobs.length,
        active: companyJobs.filter((j) => j.status === 'active').length,
        draft: companyJobs.filter((j) => j.status === 'draft' || (j.status === 'paused' && !j.publishedAt)).length,
        pending_approval: companyJobs.filter((j) => j.status === 'pending_approval').length,
        paused: companyJobs.filter((j) => j.status === 'paused' && j.publishedAt).length,
        closed: companyJobs.filter((j) => j.status === 'closed').length,
        rejected: companyJobs.filter((j) => j.status === 'rejected').length,
        expired: companyJobs.filter((j) => j.status === 'expired').length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, [activeTab, searchQuery, selectedDepartment, selectedWorkplace, selectedEmployment, sortBy, sortOrder, currentPage, itemsPerPage]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Actions
  const handleOpenCreate = () => {
    setEditingJob(null);
    setWizardOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setWizardOpen(true);
  };

  const handleOpenPreview = (job: Job) => {
    setPreviewJob(job);
    setPreviewModalOpen(true);
  };

  const handleOpenDetails = (job: Job) => {
    setDetailsJob(job);
    setDetailsModalOpen(true);
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      const cloned = await apiClient.duplicateRecruiterJob(job.id);
      showToast(`Requisition duplicated into draft copy (${cloned.jobRef || cloned.id}).`);
      onJobCreated(cloned);
      fetchRecruiterJobs();
      onRefreshJobs();
    } catch (err: any) {
      showToast(err?.message || 'Failed to duplicate job.', 'error');
    }
  };

  const handleRequestStatusChange = (job: Job, action: 'publish' | 'pause' | 'resume' | 'close' | 'reopen') => {
    setConfirmJob(job);
    setConfirmAction(action);
    setConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = async (
    action: 'publish' | 'pause' | 'resume' | 'close' | 'reopen',
    reason?: string,
    newDeadline?: string
  ) => {
    if (!confirmJob) return;
    try {
      const updated = await apiClient.updateRecruiterJobStatus(confirmJob.id, action, reason, newDeadline);
      showToast(`Requisition "${updated.title}" successfully transitioned to ${updated.status}.`);
      fetchRecruiterJobs();
      onRefreshJobs();
      if (detailsJob && detailsJob.id === updated.id) {
        setDetailsJob(updated);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update job status.', 'error');
      throw err;
    }
  };

  // Filter tabs definition
  const filterTabs = [
    { id: 'all', label: 'All Jobs', count: statusCounts.all },
    { id: 'active', label: 'Published (Active)', count: statusCounts.active },
    { id: 'draft', label: 'Drafts', count: statusCounts.draft },
    { id: 'pending_approval', label: 'Pending Review', count: statusCounts.pending_approval },
    { id: 'paused', label: 'Paused', count: statusCounts.paused },
    { id: 'closed', label: 'Closed', count: statusCounts.closed },
    { id: 'rejected', label: 'Rejected', count: statusCounts.rejected },
    { id: 'expired', label: 'Expired', count: statusCounts.expired },
  ];

  return (
    <div className="space-y-6 text-slate-100 text-left animate-fade-in">
      
      {/* TOAST FEEDBACK */}
      {feedbackToast && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-fade-in ${
          feedbackToast.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
            : 'bg-rose-950/80 border-rose-800/60 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Recruiter Portal · Phase 2</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {company?.name || 'Synthetix Dynamics'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Job Requisition Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, publish, monitor, and transition open career opportunities for your organization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Requisition</span>
          </button>
        </div>
      </div>

      {/* UNVERIFIED COMPANY GATING BANNER */}
      {!isVerified && (
        <div className="p-4 rounded-xl border border-amber-800/40 bg-amber-950/25 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Draft Gating Enforced: </span>
              <span>
                Your employer status is currently <strong>{company?.verificationStatus || 'unverified'}</strong>. New requisitions are saved as drafts until company verification is reviewed and approved by administrators.
              </span>
            </div>
          </div>
          {onNavigateToVerification && (
            <button
              onClick={onNavigateToVerification}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors text-xs font-semibold shrink-0 cursor-pointer"
            >
              Verify Company
            </button>
          )}
        </div>
      )}

      {/* FILTER TABS WITH DATABASE COUNTS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 google-photos-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800/80 hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === tab.id ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* SEARCH & SECONDARY CONTROLS BAR */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, REQ reference, skill, department, or city..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Secondary Dropdowns & Sort */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="AI Infrastructure">AI Infrastructure</option>
              <option value="Payments Core">Payments Core</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="createdAt">Date Posted</option>
              <option value="title">Role Title</option>
              <option value="deadline">Deadline</option>
              <option value="applicantsCount">Applicants</option>
            </select>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={`Sorting: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table Layout"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Cards Layout"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JOBS CONTENT SECTION */}
      {loading ? (
        <div className="py-16 text-center space-y-3 border border-slate-800 rounded-2xl bg-slate-900/50">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-xs text-slate-400">Retrieving verified requisitions from database...</p>
        </div>
      ) : serverJobs.length === 0 ? (
        /* USEFUL CONTEXTUAL EMPTY STATE */
        <div className="py-14 px-6 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {activeTab === 'all'
                ? 'No requisitions found'
                : `No ${activeTab.replace('_', ' ')} requisitions`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No jobs match your search "${searchQuery}". Try clearing filters or altering search terms.`
                : activeTab === 'draft'
                ? 'You have not saved any draft positions. Drafts allow you to refine specifications before publishing.'
                : activeTab === 'pending_approval'
                ? 'No requisitions currently awaiting administrative review.'
                : activeTab === 'paused'
                ? 'You do not have any paused requisitions.'
                : activeTab === 'closed'
                ? 'No requisitions have been marked closed.'
                : activeTab === 'expired'
                ? 'No requisitions have expired deadlines.'
                : 'Get started by creating your company\'s first engineering requisition.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Requisition</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        
        /* TABLE LAYOUT */
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 shadow-xl">
          <div className="overflow-x-auto google-photos-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Role Title & Ref</th>
                  <th className="py-3.5 px-3">Department</th>
                  <th className="py-3.5 px-3">Location & Mode</th>
                  <th className="py-3.5 px-3">Dates & Deadline</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-center">Applicants</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {serverJobs.map((job) => {
                  const isExpired = job.status === 'expired' || (job.deadline && new Date(job.deadline).getTime() < Date.now());

                  return (
                    <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Role Title & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => handleOpenDetails(job)}
                            className="font-bold text-white hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{job.title}</span>
                          </button>
                          <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-2">
                            <span>{job.jobRef || `REQ-${job.id.slice(-6)}`}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">
                              {job.isSalaryDisclosed !== false
                                ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`
                                : 'Salary Undisclosed'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-3 text-slate-300 font-medium whitespace-nowrap">
                        {job.department}
                      </td>

                      {/* Location & Mode */}
                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[140px]">{job.location}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {job.workplaceType} · {job.employmentType}
                          </div>
                        </div>
                      </td>

                      {/* Dates & Deadline */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-semibold inline-flex items-center gap-1 ${
                          job.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                            : job.status === 'closed'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : job.status === 'expired'
                            ? 'bg-rose-950 text-rose-300 border-rose-800/50'
                            : job.status === 'pending_approval'
                            ? 'bg-sky-950 text-sky-300 border-sky-800/60'
                            : job.status === 'rejected'
                            ? 'bg-rose-950 text-rose-400 border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border-amber-700/60'
                        }`}>
                          {job.status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          <span>{job.status === 'paused' && !job.publishedAt ? 'Draft' : job.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>

                      {/* Applicants Count */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (onNavigateToApplicants) {
                              onNavigateToApplicants(job.id);
                            } else {
                              handleOpenDetails(job);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-800 text-cyan-300 text-xs font-mono font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>{job.applicantsCount || 0}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Specifications & Analytics"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Requisition in Wizard"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenPreview(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Candidate View Preview"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDuplicateJob(job)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Duplicate to New Draft"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          {job.status === 'active' && (
                            <button
                              onClick={() => handleRequestStatusChange(job, 'pause')}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 transition-colors cursor-pointer"
                              title="Pause Applications"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          )}

                          {job.status === 'paused' && (
                            <button
                              onClick={() => handleRequestStatusChange(job, 'resume')}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                              title="Resume Applications"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}

                          {(job.status === 'active' || job.status === 'paused') && (
                            <button
                              onClick={() => handleRequestStatusChange(job, 'close')}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Close Requisition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          {(job.status === 'closed' || job.status === 'expired') && (
                            <button
                              onClick={() => handleRequestStatusChange(job, 'reopen')}
                              className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-950/40 transition-colors cursor-pointer"
                              title="Reopen Requisition"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* CARDS LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serverJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-semibold">
                      {job.jobRef || `REQ-${job.id.slice(-6)}`}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      job.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                        : job.status === 'closed'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : job.status === 'expired'
                        ? 'bg-rose-950 text-rose-300 border-rose-800/50'
                        : 'bg-amber-950 text-amber-300 border-amber-700/60'
                    }`}>
                      {job.status === 'paused' && !job.publishedAt ? 'Draft' : job.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer" onClick={() => handleOpenDetails(job)}>
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span>{job.department}</span>
                    <span>·</span>
                    <span>{job.location}</span>
                    <span>·</span>
                    <span className="text-cyan-300 font-semibold">
                      {job.isSalaryDisclosed !== false
                        ? `$${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k`
                        : 'Undisclosed'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center shrink-0">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Applicants</div>
                  <div className="text-sm font-extrabold text-cyan-400 mt-0.5">{job.applicantsCount || 0}</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {(job.skillsRequired || []).slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenDetails(job)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(job)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-xs font-semibold text-cyan-200 border border-cyan-500/40 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Showing <span className="text-white font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="text-white font-semibold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
            <span className="text-white font-semibold">{totalCount}</span> requisitions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono text-cyan-300 font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 disabled:opacity-40 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* JOB CREATION / EDIT WIZARD */}
      {wizardOpen && (
        <JobCreationWizard
          company={company}
          jobToEdit={editingJob}
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setEditingJob(null);
          }}
          onJobSaved={(saved) => {
            showToast(
              editingJob
                ? `Requisition "${saved.title}" updated successfully.`
                : `New requisition "${saved.title}" (${saved.jobRef}) created successfully!`
            );
            onJobCreated(saved);
            fetchRecruiterJobs();
            onRefreshJobs();
          }}
          onNavigateToVerification={onNavigateToVerification}
        />
      )}

      {/* JOB DETAILS MODAL */}
      {detailsModalOpen && detailsJob && (
        <JobDetailsModal
          job={detailsJob}
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setDetailsJob(null);
          }}
          onEdit={(j) => handleOpenEdit(j)}
          onDuplicate={(j) => handleDuplicateJob(j)}
          onStatusChangeRequest={(j, action) => handleRequestStatusChange(j, action)}
        />
      )}

      {/* CANDIDATE PREVIEW MODAL */}
      {previewModalOpen && previewJob && (
        <JobPreviewModal
          job={previewJob}
          company={company}
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewJob(null);
          }}
          onEdit={(j) => handleOpenEdit(j)}
        />
      )}

      {/* STATUS CONFIRMATION MODAL */}
      {confirmModalOpen && confirmJob && confirmAction && (
        <JobStatusConfirmModal
          job={confirmJob}
          action={confirmAction}
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setConfirmJob(null);
            setConfirmAction(null);
          }}
          onConfirm={handleConfirmStatusChange}
        />
      )}
    </div>
  );
};
