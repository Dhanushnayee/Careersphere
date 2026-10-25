/**
 * CareerSphere AI — Recruiter & Employer Portal (Phase 1 Foundation)
 * Complete recruiter workspace layout with sidebar navigation matching Candidate style.
 * Modules: Dashboard, Company Profile, My Jobs, Applicants, AI Candidate Matcher,
 * Interviews, Offers, Messages, Notifications, Analytics, Team Management, Settings.
 */
import React, { useState, useEffect } from 'react';
import { Job, Company, RecruiterProfile, User } from '../../types';
import { apiClient } from '../../services/api';
import { RecruiterDashboardView } from '../recruiter/RecruiterDashboardView';
import { CompanyProfileView } from '../recruiter/CompanyProfileView';
import { CompanyVerificationView } from '../recruiter/CompanyVerificationView';
import { RecruiterJobsView } from '../recruiter/RecruiterJobsView';
import { RecruiterApplicantsView } from '../recruiter/RecruiterApplicantsView';
import { InterviewsManagementView } from '../recruiter/InterviewsManagementView';
import { OffersManagementView } from '../recruiter/OffersManagementView';
import { RecruiterMessagingView } from '../recruiter/RecruiterMessagingView';
import { TeamManagementView } from '../recruiter/TeamManagementView';
import { RecruiterAnalyticsView } from '../recruiter/RecruiterAnalyticsView';
import { RecruiterAuditLogsView } from '../recruiter/RecruiterAuditLogsView';
import { RecruiterAiMatcherView } from '../recruiter/RecruiterAiMatcherView';
import { RecruiterNotificationsCenterView } from '../recruiter/RecruiterNotificationsCenterView';
import { RecruiterSettingsWorkspace } from '../recruiter/RecruiterSettingsWorkspace';
import { ComingSoonView } from '../recruiter/ComingSoonView';
import { RecruiterOnboardingModal } from '../recruiter/RecruiterOnboardingModal';
import {
  LayoutDashboard,
  Building,
  Briefcase,
  Users,
  Sparkles,
  Calendar,
  Gift,
  MessageSquare,
  Bell,
  BarChart3,
  UserCheck,
  Settings,
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface RecruiterDashboardProps {
  currentUser?: User | null;
  jobs: Job[];
  onAddJob: (newJob: Job) => void;
  onRefreshJobs: () => void;
  activeModule?: string;
  activeSubPart?: string;
  onModuleChange?: (module: string) => void;
  onSubPartChange?: (subPart: string) => void;
  onLogout?: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentUser = null,
  jobs,
  onAddJob,
  onRefreshJobs,
  activeModule = 'dashboard',
  activeSubPart = 'overview',
  onModuleChange,
  onSubPartChange,
  onLogout,
}) => {
  const [currentModule, setCurrentModule] = useState<string>(activeModule);
  const [currentPart, setCurrentPart] = useState<string>(activeSubPart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Domain data
  const [company, setCompany] = useState<Company | null>(null);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  useEffect(() => {
    if (activeModule && activeModule !== currentModule) {
      setCurrentModule(activeModule);
    }
  }, [activeModule]);

  useEffect(() => {
    if (activeSubPart && activeSubPart !== currentPart) {
      setCurrentPart(activeSubPart);
    }
  }, [activeSubPart]);

  useEffect(() => {
    async function initRecruiterData() {
      try {
        const profData = await apiClient.getRecruiterProfile();
        setProfile(profData.profile);
        setCompany(profData.company);

        if (!profData.profile?.isOnboarded) {
          setOnboardingOpen(true);
        }
      } catch (err) {
        console.warn('Initial recruiter profile probe:', err);
      }
    }
    initRecruiterData();
  }, []);

  // Poll and listen for recruiter unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await apiClient.getRecruiterUnreadCount();
        setUnreadNotificationsCount(res.unreadCount || 0);
      } catch (err) {
        // Silently handle if unauthenticated or network transient
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);

    const handleCustomEvent = () => fetchUnreadCount();
    window.addEventListener('careersphere:recruiter_event', handleCustomEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('careersphere:recruiter_event', handleCustomEvent);
    };
  }, []);

  const handleSelectModule = (mod: string, part = 'overview') => {
    setCurrentModule(mod);
    setCurrentPart(part);
    onModuleChange?.(mod);
    onSubPartChange?.(part);
    setMobileMenuOpen(false);
  };

  const recruiterDisplayName = currentUser?.name || profile?.title || 'Recruiter Admin';
  const recruiterInitials = recruiterDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isCompanyVerified = company?.isVerified && company?.verificationStatus === 'verified';
  const verificationStatus = company?.verificationStatus || (company?.isVerified ? 'verified' : 'draft');

  const moduleTitleMap: Record<string, string> = {
    dashboard: '1. Dashboard',
    company: '2. Company Profile',
    jobs: '3. My Jobs',
    applicants: '4. Applicants',
    matcher: '5. AI Candidate Matcher',
    interviews: '6. Interviews',
    offers: '7. Offers',
    messages: '8. Messages',
    notifications: '9. Notifications',
    analytics: '10. Analytics',
    team: '11. Team Management',
    settings: '12. Settings',
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row text-left bg-slate-950 text-slate-100 min-w-0 relative scroll-smooth">
      
      {/* =========================================================================
          MOBILE TOP BAR (Visible only on < lg screens)
          Matching Candidate Dashboard mobile top bar styles exactly!
         ========================================================================= */}
      <div className="lg:hidden shrink-0 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-cyan-600/30 shrink-0">
            {recruiterInitials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">{recruiterDisplayName}</div>
            <div className="text-[10px] text-cyan-300 truncate">
              Active: <span className="font-semibold text-white capitalize">{moduleTitleMap[currentModule] || currentModule}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-xs text-cyan-200 border border-cyan-500/40 hover:text-white shrink-0 transition-colors cursor-pointer"
        >
          <Menu className="h-3.5 w-3.5 text-cyan-400" />
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
          Exact same dimensions, borders, scrolls, and layout as Candidate asidebar!
         ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 bg-slate-900/98 backdrop-blur-2xl border-r border-slate-800 shadow-2xl flex flex-col justify-between p-4 space-y-4 h-full max-h-full min-h-0 overflow-y-auto overflow-x-hidden google-photos-scrollbar scroll-smooth transition-transform duration-250 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:top-0 lg:w-72 lg:shrink-0 lg:z-auto lg:shadow-none lg:bg-slate-900/60 lg:backdrop-blur-xl lg:border-r lg:border-slate-800/80 lg:p-5 lg:space-y-6 lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden lg:translate-x-0 lg:flex select-none`}
      >
        {/* Drawer Header (Mobile Close Button) */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Recruiter Workspace</span>
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
          
          {/* Recruiter & Company Identity Card (Matches Candidate Identity Card) */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-cyan-600/30 shrink-0">
                {recruiterInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-sm truncate">{recruiterDisplayName}</div>
                <div className="text-[11px] text-cyan-300 truncate">
                  {company?.name || 'Synthetix Dynamics'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{company?.headquarters || 'San Francisco, CA'}</span>
              <span className={`font-mono font-semibold px-2 py-0.5 rounded text-[10px] shrink-0 border ${
                isCompanyVerified
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
                  : 'bg-amber-950 text-amber-300 border-amber-700/60'
              }`}>
                {verificationStatus}
              </span>
            </div>
          </div>

          {/* Aside Navigation Menu Links - 13 Recruiter Modules */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Recruiter Modules</span>
              <span className="text-[10px] text-cyan-400 font-mono">13 Modules</span>
            </div>

            {/* 1: Dashboard */}
            <button
              onClick={() => handleSelectModule('dashboard', 'overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>1. Dashboard</span>
              </div>
            </button>

            {/* 2: Company Profile */}
            <button
              onClick={() => handleSelectModule('company', 'profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'company'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>2. Company Profile</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {isCompanyVerified ? 'Verified' : 'Draft'}
              </span>
            </button>

            {/* 3: My Jobs */}
            <button
              onClick={() => handleSelectModule('jobs', 'all')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'jobs'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>3. My Jobs</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                {jobs.length}
              </span>
            </button>

            {/* 4: Applicants */}
            <button
              onClick={() => handleSelectModule('applicants', 'pipeline')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'applicants'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>4. Applicants</span>
              </div>
            </button>

            {/* 5: AI Candidate Matcher */}
            <button
              onClick={() => handleSelectModule('matcher', 'recommendations')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'matcher'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                <span>5. AI Matcher</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
                Live
              </span>
            </button>

            {/* 6: Interviews */}
            <button
              onClick={() => handleSelectModule('interviews', 'calendar')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'interviews'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>6. Interviews</span>
              </div>
            </button>

            {/* 7: Offers */}
            <button
              onClick={() => handleSelectModule('offers', 'draft')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'offers'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Gift className="h-4 w-4 text-rose-400 shrink-0" />
                <span>7. Offers</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Phase 2
              </span>
            </button>

            {/* 8: Messages */}
            <button
              onClick={() => handleSelectModule('messages', 'inbox')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'messages'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-amber-400 shrink-0" />
                <span>8. Messages</span>
              </div>
            </button>

            {/* 9: Notifications */}
            <button
              onClick={() => handleSelectModule('notifications', 'all')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'notifications'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 text-sky-400 shrink-0" />
                <span>9. Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm shadow-cyan-900/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* 10: Analytics */}
            <button
              onClick={() => handleSelectModule('analytics', 'funnel')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'analytics'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>10. Analytics</span>
              </div>
            </button>

            {/* 11: Team Management */}
            <button
              onClick={() => handleSelectModule('team', 'members')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'team'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>11. Team Access</span>
              </div>
            </button>

            {/* 12: Audit Logs */}
            <button
              onClick={() => handleSelectModule('audit', 'logs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'audit'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>12. Audit Logs</span>
              </div>
            </button>

            {/* 13: Settings */}
            <button
              onClick={() => handleSelectModule('settings', 'profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'settings'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-slate-400 shrink-0" />
                <span>13. Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Asidebar Footer (Matches Candidate Asidebar Footer) */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate">RBAC Role:</span>
            <span className="font-mono text-cyan-400 font-semibold uppercase">{currentUser?.role || 'recruiter'}</span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 border border-rose-900/30 transition-colors cursor-pointer"
            >
              <span className="font-semibold">Sign Out</span>
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN CONTENT AREA
          Independent scroll, contains recruiter module screens
         ========================================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100 google-photos-scrollbar scroll-smooth">
        
        {/* Module 1: Dashboard */}
        {currentModule === 'dashboard' && (
          <RecruiterDashboardView
            onNavigateSubView={(mod, part) => handleSelectModule(mod, part)}
            onOpenCreateJobModal={() => handleSelectModule('jobs', 'post-job')}
          />
        )}

        {/* Module 2: Company Profile / Verification */}
        {currentModule === 'company' && currentPart === 'verification' ? (
          <CompanyVerificationView
            company={company}
            onStatusChanged={(updated) => setCompany(updated)}
          />
        ) : currentModule === 'company' ? (
          <CompanyProfileView
            initialCompany={company}
            onCompanyUpdated={(updated) => setCompany(updated)}
            onNavigateToVerification={() => handleSelectModule('company', 'verification')}
          />
        ) : null}

        {/* Module 3: My Jobs */}
        {currentModule === 'jobs' && (
          <RecruiterJobsView
            jobs={jobs}
            company={company}
            initialOpenCreateWizard={currentPart === 'post-job'}
            onJobCreated={(newJob) => onAddJob(newJob)}
            onRefreshJobs={onRefreshJobs}
            onNavigateToVerification={() => handleSelectModule('company', 'verification')}
            onNavigateToApplicants={(jobId) => handleSelectModule('applicants', jobId || 'pipeline')}
          />
        )}

        {/* Module 4: Applicants */}
        {currentModule === 'applicants' && (
          <RecruiterApplicantsView jobs={jobs} />
        )}

        {/* Module 5: AI Candidate Matcher (Live Engine) */}
        {currentModule === 'matcher' && (
          <RecruiterAiMatcherView
            onNavigateToApplicants={(jobId) => handleSelectModule('applicants', jobId)}
          />
        )}

        {/* Module 6: Interviews */}
        {currentModule === 'interviews' && (
          <InterviewsManagementView jobs={jobs} />
        )}

        {/* Module 7: Offers */}
        {currentModule === 'offers' && (
          <OffersManagementView jobs={jobs} />
        )}

        {/* Module 8: Messages */}
        {currentModule === 'messages' && (
          <RecruiterMessagingView jobs={jobs} />
        )}

        {/* Module 9: Notifications */}
        {currentModule === 'notifications' && (
          <RecruiterNotificationsCenterView
            onNavigateSubView={(mod, part, targetId) => handleSelectModule(mod, part || 'overview')}
            onUnreadCountChange={(cnt) => setUnreadNotificationsCount(cnt)}
          />
        )}

        {/* Module 10: Analytics */}
        {currentModule === 'analytics' && (
          <RecruiterAnalyticsView
            jobs={jobs}
            onNavigateSubView={(mod, part) => handleSelectModule(mod, part)}
          />
        )}

        {/* Module 11: Team Management */}
        {currentModule === 'team' && (
          <TeamManagementView company={company} />
        )}

        {/* Module 12: Audit Logs */}
        {currentModule === 'audit' && (
          <RecruiterAuditLogsView />
        )}

        {/* Module 13: Settings & Account Preferences */}
        {currentModule === 'settings' && (
          <RecruiterSettingsWorkspace
            initialTab={currentPart || 'profile'}
            onTabChange={(tab) => {
              setCurrentPart(tab);
              onSubPartChange?.(tab);
            }}
            onNavigateModule={(mod, part) => handleSelectModule(mod, part)}
            onLogout={onLogout}
            onCompanyUpdated={(updated) => setCompany(updated)}
          />
        )}
      </main>

      {/* RECRUITER ONBOARDING MODAL */}
      <RecruiterOnboardingModal
        isOpen={onboardingOpen}
        currentUser={currentUser}
        onSuccess={(prof, comp) => {
          setProfile(prof);
          setCompany(comp);
          setOnboardingOpen(false);
        }}
        onDismiss={() => setOnboardingOpen(false)}
      />
    </div>
  );
};
