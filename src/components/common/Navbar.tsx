/**
 * CareerSphere AI — Top Navigation Bar
 * Follows strict Top Bar Contract with distinct role portals and session management.
 * Zone 1: Single text element wordmark
 * Zone 2: Concise single-line links for Candidate, Recruiter, Admin Hub, and Platform
 * Zone 3: Health probe indicator & Auth Status with distinct role access
 */
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { Menu, X, Sparkles, Layers, LogIn, LogOut, User as UserIcon, Briefcase, Shield, ChevronDown } from 'lucide-react';

export const CANDIDATE_MODULE_PARTS: Record<string, Array<{ id: string; label: string }>> = {
  overview: [
    { id: 'all-metrics', label: 'Summary & Stats' },
    { id: 'completion', label: 'Profile Completion' },
    { id: 'activity', label: 'Recent Activity' },
    { id: 'recommended', label: 'Job Recommendations' },
  ],
  profile: [
    { id: 'personal', label: 'Personal Details' },
    { id: 'skills', label: 'Skills Inventory' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects & Portfolio' },
  ],
  copilot: [
    { id: 'builder', label: 'Resume Builder' },
    { id: 'ats', label: 'ATS Analysis' },
    { id: 'cover-letter', label: 'Cover Letters' },
    { id: 'copilot', label: 'Bullet Rewriter' },
    { id: 'versions', label: 'Versions & Upload' },
  ],
  resume: [
    { id: 'builder', label: 'Resume Builder' },
    { id: 'ats', label: 'ATS Analysis' },
    { id: 'cover-letter', label: 'Cover Letters' },
    { id: 'copilot', label: 'Bullet Rewriter' },
    { id: 'versions', label: 'Versions & Upload' },
  ],
  jobs: [
    { id: 'all', label: 'All Jobs' },
    { id: 'matched', label: 'Job Matches' },
    { id: 'saved', label: 'Saved Jobs' },
    { id: 'alerts', label: 'Job Alerts' },
  ],
  applications: [
    { id: 'all', label: 'All Applications' },
    { id: 'review', label: 'In Review' },
    { id: 'interviewing', label: 'Interviewing' },
    { id: 'offers', label: 'Offers' },
  ],
  interviews: [
    { id: 'calendar', label: 'Schedule & Calendar' },
    { id: 'mock', label: 'AI Mock Interview' },
    { id: 'bank', label: 'Question Bank' },
    { id: 'reminders', label: 'Interview Reminders' },
  ],
  'ai-assistant': [
    { id: 'chat', label: 'Career Guidance Chat' },
    { id: 'roadmap', label: 'Career Roadmap' },
    { id: 'interview-prep', label: 'AI Interview Prep' },
  ],
  learn: [
    { id: 'dashboard', label: 'Analytics & Overview' },
    { id: 'plans', label: 'Learning Plans' },
    { id: 'quizzes', label: 'Skill Assessments' },
    { id: 'coding', label: 'Coding Practice' },
  ],
  messages: [
    { id: 'inbox', label: 'Recruiter Messages' },
    { id: 'tickets', label: 'Support Tickets' },
    { id: 'report', label: 'Trust & Safety Report' },
    { id: 'faqs', label: 'Help & FAQs' },
  ],
  settings: [
    { id: 'account', label: 'Account Info' },
    { id: 'security', label: 'Login & Security' },
    { id: 'sessions', label: 'Active Devices' },
    { id: 'privacy', label: 'Privacy & Visibility' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'data', label: 'Data Management & GDPR' },
  ],
};

export const RECRUITER_MODULE_PARTS: Record<string, Array<{ id: string; label: string }>> = {
  dashboard: [
    { id: 'overview', label: 'Command Overview' },
    { id: 'actions', label: 'Pending Actions' },
    { id: 'activity', label: 'Recent Activity' },
  ],
  company: [
    { id: 'profile', label: 'Company Profile' },
    { id: 'verification', label: 'Verification & Compliance' },
    { id: 'brand', label: 'Logo & Media' },
    { id: 'culture', label: 'Culture & Benefits' },
  ],
  jobs: [
    { id: 'all', label: 'All Requisitions' },
    { id: 'active', label: 'Active Postings' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'closed', label: 'Closed' },
    { id: 'post-job', label: 'Post Requisition' },
  ],
  applicants: [
    { id: 'pipeline', label: 'Pipeline Kanban' },
    { id: 'new', label: 'New Received' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'table', label: 'Candidates Table' },
  ],
  matcher: [
    { id: 'recommendations', label: 'Semantic Fits' },
    { id: 'ranking', label: 'Skill Gap Breakdown' },
  ],
  interviews: [
    { id: 'schedule', label: 'Upcoming Rounds' },
    { id: 'calendar', label: 'Interview Calendar' },
    { id: 'completed', label: 'Past Feedback' },
  ],
  offers: [
    { id: 'draft', label: 'Offer Letters' },
    { id: 'sent', label: 'Pending Acceptance' },
  ],
  messages: [
    { id: 'inbox', label: 'Candidate Threads' },
    { id: 'broadcasts', label: 'Outreach Campaigns' },
  ],
  notifications: [
    { id: 'all', label: 'All Alerts' },
    { id: 'unread', label: 'Unread Alerts' },
    { id: 'applications', label: 'Applications' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'jobs', label: 'Requisitions' },
    { id: 'company', label: 'Company & Offers' },
    { id: 'system', label: 'System & Policy' },
  ],
  analytics: [
    { id: 'funnel', label: 'Hiring Funnel' },
    { id: 'sourcing', label: 'Sourcing Channels' },
  ],
  team: [
    { id: 'members', label: 'Team Directory' },
    { id: 'roles', label: 'Permissions & Invites' },
  ],
  settings: [
    { id: 'profile', label: 'Personal Profile' },
    { id: 'security', label: 'Account & Security' },
    { id: 'notifications', label: 'Notification Preferences' },
    { id: 'company', label: 'Company & Team' },
    { id: 'privacy', label: 'Privacy & Data' },
    { id: 'appearance', label: 'Appearance & Display' },
  ],
};

interface NavbarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenHealth: () => void;
  backendConnected: boolean;
  currentUser: User | null;
  onOpenLogin: (role?: UserRole) => void;
  onOpenRegister: (role?: 'candidate' | 'recruiter') => void;
  onLogout: () => void;
  candidateActiveModule?: string;
  candidateActivePart?: string;
  onSelectCandidatePart?: (partId: string) => void;
  recruiterActiveModule?: string;
  recruiterActivePart?: string;
  onSelectRecruiterPart?: (partId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenHealth,
  backendConnected,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  candidateActiveModule = 'overview',
  candidateActivePart = 'all-metrics',
  onSelectCandidatePart,
  recruiterActiveModule = 'dashboard',
  recruiterActivePart = 'overview',
  onSelectRecruiterPart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const handlePortalClick = (target: 'candidate' | 'recruiter' | 'admin') => {
    setMobileMenuOpen(false);
    setPortalDropdownOpen(false);
    if (!currentUser) {
      onOpenLogin(target);
    } else {
      onNavigate(target);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            onNavigate('landing');
            setMobileMenuOpen(false);
          }}
          className="group flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-100">CareerSphere AI</span>
        </button>

        {/* Zone 2: Role-isolated navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {currentUser?.role === 'candidate' ? (
            /* Active Module Parts Navigation in Top Bar */
            <div className="flex items-center gap-1.5 overflow-x-auto google-photos-scrollbar py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                <span>Section:</span>
              </span>
              {(CANDIDATE_MODULE_PARTS[candidateActiveModule] || []).map((part) => {
                const isSelected = candidateActivePart === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => onSelectCandidatePart?.(part.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    {part.label}
                  </button>
                );
              })}
            </div>
          ) : currentUser?.role === 'recruiter' || currentView === 'recruiter' ? (
            /* Recruiter Active Module Parts Navigation in Top Bar */
            <div className="flex items-center gap-1.5 overflow-x-auto google-photos-scrollbar py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                <span>Section:</span>
              </span>
              {(RECRUITER_MODULE_PARTS[recruiterActiveModule] || []).map((part) => {
                const isSelected = recruiterActivePart === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => onSelectRecruiterPart?.(part.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    {part.label}
                  </button>
                );
              })}
            </div>
          ) : currentUser?.role === 'admin' ? (
            /* Admin enclave full view */
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'landing' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                Platform
              </button>
              <button
                onClick={() => onNavigate('candidate')}
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors text-indigo-300 hover:text-white cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                <span>Candidate Portal</span>
              </button>
              <button
                onClick={() => onNavigate('recruiter')}
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors text-cyan-300 hover:text-white cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                <span>Recruiter Portal</span>
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'admin' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Admin Enclave</span>
              </button>
              <button
                onClick={() => onNavigate('architecture')}
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors text-slate-400 hover:text-white cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Architecture</span>
              </button>
            </>
          ) : (
            /* Logged-out navigation */
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'landing' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                Platform
              </button>
              <button
                onClick={() => handlePortalClick('candidate')}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'candidate' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                <span>Candidate Portal</span>
              </button>
              <button
                onClick={() => handlePortalClick('recruiter')}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'recruiter' ? 'text-cyan-400 font-semibold' : ''
                }`}
              >
                <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                <span>Recruiter Portal</span>
              </button>
              <button
                onClick={() => handlePortalClick('admin')}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'admin' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Admin Enclave</span>
              </button>
              <button
                onClick={() => onNavigate('architecture')}
                className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white cursor-pointer ${
                  currentView === 'architecture' ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Architecture & Spec</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action & Auth Status */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Health probe indicator - only for non-candidates */}
          {currentUser?.role !== 'candidate' && (
            <button
              onClick={onOpenHealth}
              title="Inspect Full-Stack Health & AI API Status"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  backendConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[11px]">{backendConnected ? 'v1 Full-Stack' : 'Connecting'}</span>
            </button>
          )}

          {/* User session controls */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    currentUser.role === 'admin'
                      ? 'bg-emerald-400'
                      : currentUser.role === 'recruiter'
                      ? 'bg-cyan-400'
                      : 'bg-indigo-400'
                  }`}
                />
                <span className="font-semibold text-slate-200">{currentUser.name}</span>
                <span
                  className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                    currentUser.role === 'admin'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : currentUser.role === 'recruiter'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-rose-300 hover:border-rose-800 hover:bg-slate-900 transition-colors text-xs font-medium cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Sign In button with dedicated role portal selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/80 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Sign In</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {portalDropdownOpen && (
                  <div
                    onMouseLeave={() => setPortalDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-left space-y-1 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Select Role Portal:
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenLogin('candidate');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Candidate Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenLogin('recruiter');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
                      <span>HR Recruiter Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenLogin('admin');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Admin Hub Sign In</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenRegister('candidate')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col gap-2 pt-2">
            {currentUser?.role === 'candidate' ? (
              <div className="space-y-3">
                <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Module Sections:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(CANDIDATE_MODULE_PARTS[candidateActiveModule] || []).map((part) => {
                    const isSelected = candidateActivePart === part.id;
                    return (
                      <button
                        key={part.id}
                        onClick={() => {
                          onSelectCandidatePart?.(part.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                      >
                        {part.label}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-300 font-semibold">{currentUser.name}</div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : currentUser?.role === 'recruiter' ? (
              <button
                onClick={() => {
                  onNavigate('recruiter');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-3 text-sm font-medium text-cyan-300 hover:bg-slate-900 rounded-md flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4 text-cyan-400" />
                <span>Recruiter Portal</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 px-3 text-sm font-medium text-slate-300 hover:bg-slate-900 rounded-md"
                >
                  Platform
                </button>
                <button
                  onClick={() => handlePortalClick('candidate')}
                  className="text-left py-2 px-3 text-sm font-medium text-indigo-300 hover:bg-slate-900 rounded-md flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4 text-indigo-400" />
                  <span>Candidate Portal</span>
                </button>
                <button
                  onClick={() => handlePortalClick('recruiter')}
                  className="text-left py-2 px-3 text-sm font-medium text-cyan-300 hover:bg-slate-900 rounded-md flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4 text-cyan-400" />
                  <span>Recruiter Portal</span>
                </button>
                <button
                  onClick={() => handlePortalClick('admin')}
                  className="text-left py-2 px-3 text-sm font-medium text-emerald-300 hover:bg-slate-900 rounded-md flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Admin Enclave</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('architecture');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 px-3 text-sm font-medium text-slate-400 hover:bg-slate-900 rounded-md"
                >
                  Architecture & Spec
                </button>
              </>
            )}
          </div>

          {!currentUser && (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin('candidate');
                }}
                className="w-full py-2 text-center text-xs font-semibold text-slate-200 bg-slate-900 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister('candidate');
                }}
                className="w-full py-2 text-center text-xs font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Register Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
