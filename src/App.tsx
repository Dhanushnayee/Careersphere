/**
 * CareerSphere AI — Main Application Root Component
 * Full-stack orchestrator supporting Phases 1 through 6:
 * - Role-based Portals (Candidate, Recruiter, Admin Hub) with strict boundary separation
 * - Resend Email OTP Verification flow
 * - Autonomous n8n Multi-Apply Engine
 * - AI Resume Copilot & Job Description Matching (Gemini 3.8 Flash)
 * - HR Pipeline Kanban & System Governance Enclave
 */
import React, { useState, useEffect } from 'react';
import { Navbar, CANDIDATE_MODULE_PARTS, RECRUITER_MODULE_PARTS } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CandidateDashboard } from './components/dashboards/CandidateDashboard';
import { RecruiterDashboard } from './components/dashboards/RecruiterDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ArchitectureExplorer } from './components/architecture/ArchitectureExplorer';
import { HealthModal } from './components/common/HealthModal';
import { ResumeUploadModal } from './components/common/ResumeUploadModal';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { OtpModal } from './components/auth/OtpModal';
import { DedicatedAuthPage } from './components/auth/DedicatedAuthPage';
import { RoleAccessGate } from './components/common/RoleAccessGate';
import {
  PlatformHealth,
  Job,
  AuditRecord,
  ResumeDocument,
  CandidateProfile,
  Application,
  User,
  UserRole,
  UploadResumeResult,
} from './types';
import { apiClient } from './services/api';
import { User as UserIcon, Briefcase, Shield, Layers, LogIn, Lock } from 'lucide-react';

export type AppView =
  | 'landing'
  | 'candidate'
  | 'recruiter'
  | 'admin'
  | 'architecture'
  | 'auth-candidate'
  | 'auth-recruiter'
  | 'auth-admin';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  // Starts unauthenticated: user views the public platform dashboard initially
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // Modals
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDemoHint, setOtpDemoHint] = useState<string | undefined>(undefined);

  // Dedicated role selection for modals & sandbox
  const [activeLoginRole, setActiveLoginRole] = useState<UserRole>('candidate');
  const [activeRegisterRole, setActiveRegisterRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sandboxBypassed, setSandboxBypassed] = useState(false);

  // Domain data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<ResumeDocument[]>([
    {
      id: 'res_01',
      title: 'Alex_Chen_Principal_Engineer_Resume.pdf',
      fileName: 'Alex_Chen_Principal_Engineer_Resume.pdf',
      fileSizeBytes: 248000,
      fileFormat: 'PDF',
      uploadedAt: '2 days ago',
      isPrimary: true,
      parsingStatus: 'parsed',
      atsScoreDemo: 88,
    },
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [candidateActiveModule, setCandidateActiveModule] = useState<string>('overview');
  const [candidateActivePart, setCandidateActivePart] = useState<string>('all-metrics');
  const [recruiterActiveModule, setRecruiterActiveModule] = useState<string>('dashboard');
  const [recruiterActivePart, setRecruiterActivePart] = useState<string>('overview');

  // Initial data loading
  useEffect(() => {
    async function init() {
      try {
        const healthData = await apiClient.getHealth();
        setHealth(healthData);
        setBackendConnected(healthData.dependencies.database.status !== 'unreachable');

        // Check if an existing user session exists
        const me = await apiClient.getMe();
        if (me) {
          setCurrentUser(me);
        }

        const [jobsData, logsData, resumesData] = await Promise.all([
          apiClient.getJobs().catch(() => []),
          apiClient.getAuditLogs().catch(() => []),
          apiClient.getResumes().catch(() => []),
        ]);

        if (jobsData.length > 0) setJobs(jobsData);
        if (logsData.length > 0) setAuditLogs(logsData);
        if (resumesData.length > 0) setResumes(resumesData);

        // Load candidate data
        refreshCandidateData();
      } catch (err) {
        console.warn('Initial platform probe error:', err);
      }
    }
    init();
  }, []);

  const refreshCandidateData = async () => {
    try {
      const [profData, appsData] = await Promise.all([
        apiClient.getCandidateProfile().catch(() => null),
        apiClient.getCandidateApplications().catch(() => []),
      ]);
      if (profData) setProfile(profData);
      if (appsData) setApplications(appsData);
    } catch (err) {
      console.warn('Error loading candidate profile data:', err);
    }
  };

  const handleRefreshJobs = async () => {
    try {
      const jobsData = await apiClient.getJobs();
      setJobs(jobsData);
    } catch (err) {
      console.warn('Error refreshing jobs:', err);
    }
  };

  const handleRefreshApplications = async () => {
    try {
      const apps = await apiClient.getCandidateApplications();
      setApplications(apps);
    } catch (err) {
      console.warn('Error refreshing applications:', err);
    }
  };

  const handleUpdateProfile = async (updated: Partial<CandidateProfile>) => {
    try {
      const saved = await apiClient.updateCandidateProfile(updated);
      setProfile(saved);
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
    }
  };

  const handleAddJob = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  const handleRefreshResumes = async () => {
    try {
      const list = await apiClient.getResumes();
      if (list && list.length > 0) setResumes(list);
    } catch (err) {
      console.warn('Error refreshing resumes:', err);
    }
  };

  const handleResumeUploaded = (result: UploadResumeResult) => {
    if (result.resume) {
      setResumes((prev) => [result.resume, ...prev.filter((r) => r.id !== result.resume.id)]);
    }
    if (result.updatedProfile) {
      setProfile(result.updatedProfile);
    }
    if (result.updatedUser) {
      const u = result.updatedUser;
      setCurrentUser((prev) =>
        prev
          ? { ...prev, ...u }
          : {
              id: u.id || 'user_candidate_01',
              name: u.name || 'Candidate',
              email: u.email || 'candidate@careersphere.ai',
              role: (u.role as UserRole) || 'candidate',
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
            }
      );
    }
    handleRefreshResumes();
    refreshCandidateData();
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSandboxBypassed(false);
    setLoginModalOpen(false);
    setOtpModalOpen(false);
    if (user.role === 'candidate') {
      setCurrentView('candidate');
      refreshCandidateData();
    } else if (user.role === 'recruiter') {
      setCurrentView('recruiter');
      handleRefreshJobs();
    } else if (user.role === 'admin') {
      setCurrentView('admin');
    }
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setSandboxBypassed(false);
    setCurrentView('landing');
  };

  const [otpResendError, setOtpResendError] = useState<string | undefined>(undefined);

  const handlePromptOtp = (email: string, hint?: string, error?: string) => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
    setOtpEmail(email);
    setOtpDemoHint(hint);
    setOtpResendError(error);
    setOtpModalOpen(true);
  };

  const handleOpenLogin = (role?: UserRole) => {
    setAuthMode('login');
    setActiveLoginRole(role || 'candidate');
    setCurrentView(`auth-${role || 'candidate'}` as AppView);
  };

  const handleOpenRegister = (role?: 'candidate' | 'recruiter') => {
    setAuthMode('register');
    setActiveRegisterRole(role || 'candidate');
    setCurrentView(`auth-${role || 'candidate'}` as AppView);
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demoEmail =
      role === 'candidate'
        ? 'candidate@careersphere.ai'
        : role === 'recruiter'
        ? 'recruiter@synthetix.com'
        : 'admin@careersphere.ai';

    try {
      const data = await apiClient.login(demoEmail, 'Password123!', true);
      if (data.user) {
        handleLoginSuccess(data.user);
      }
    } catch (err) {
      console.warn('Quick demo login error:', err);
    }
  };

  return (
    <div
      className="flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white min-h-screen w-full scroll-smooth"
    >
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setSandboxBypassed(false);
          setCurrentView(view);
        }}
        onOpenHealth={() => setHealthModalOpen(true)}
        backendConnected={backendConnected}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onLogout={handleLogout}
        candidateActiveModule={candidateActiveModule}
        candidateActivePart={candidateActivePart}
        onSelectCandidatePart={(partId) => setCandidateActivePart(partId)}
        recruiterActiveModule={recruiterActiveModule}
        recruiterActivePart={recruiterActivePart}
        onSelectRecruiterPart={(partId) => setRecruiterActivePart(partId)}
      />

      {/* Role Workspace Context Switcher (Shown ONLY for Admins — candidate only sees Candidate Portal) */}
      {currentUser?.role === 'admin' && ['candidate', 'recruiter', 'admin', 'architecture'].includes(currentView) && (
        <div className="shrink-0 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                Active Workspace:
              </span>
              <span className="text-indigo-400 font-medium capitalize">{currentView}</span>
              {currentUser && (
                <span className="text-slate-500 hidden sm:inline">
                  • Signed in as <span className="text-slate-300 font-medium">{currentUser.name}</span>{' '}
                  <span className="text-indigo-300 font-mono font-bold">({currentUser.role})</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/80 border border-slate-800">
              <button
                onClick={() => {
                  setSandboxBypassed(false);
                  setCurrentView('candidate');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  currentView === 'candidate'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Candidate</span>
              </button>

              <button
                onClick={() => {
                  setSandboxBypassed(false);
                  setCurrentView('recruiter');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  currentView === 'recruiter'
                    ? 'bg-cyan-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Recruiter</span>
              </button>

              <button
                onClick={() => {
                  setSandboxBypassed(false);
                  setCurrentView('admin');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Hub</span>
              </button>

              <button
                onClick={() => setCurrentView('architecture')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  currentView === 'architecture'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Architecture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport with Strict Role Guards ("evaru ememi cheyyalo adi matrame cheyyali") */}
      <main className="flex-1 min-w-0 w-full flex flex-col scroll-smooth">
        {currentView === 'landing' && (
          <LandingPage
            onNavigateCandidate={() => (currentUser ? setCurrentView('candidate') : setCurrentView('auth-candidate'))}
            onNavigateRecruiter={() => (currentUser ? setCurrentView('recruiter') : setCurrentView('auth-recruiter'))}
            onNavigateAdmin={() => (currentUser ? setCurrentView('admin') : setCurrentView('auth-admin'))}
            onNavigateArchitecture={() => setCurrentView('architecture')}
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
        )}

        {/* DEDICATED AUTHENTICATION PAGES */}
        {currentView === 'auth-candidate' && (
          <DedicatedAuthPage
            role="candidate"
            mode={authMode}
            onSuccess={handleLoginSuccess}
            onPromptOtp={handlePromptOtp}
            onNavigateHome={() => setCurrentView('landing')}
            onSwitchRole={(r) => setCurrentView(`auth-${r}` as AppView)}
          />
        )}

        {currentView === 'auth-recruiter' && (
          <DedicatedAuthPage
            role="recruiter"
            mode={authMode}
            onSuccess={handleLoginSuccess}
            onPromptOtp={handlePromptOtp}
            onNavigateHome={() => setCurrentView('landing')}
            onSwitchRole={(r) => setCurrentView(`auth-${r}` as AppView)}
          />
        )}

        {currentView === 'auth-admin' && (
          <DedicatedAuthPage
            role="admin"
            mode="login"
            onSuccess={handleLoginSuccess}
            onPromptOtp={handlePromptOtp}
            onNavigateHome={() => setCurrentView('landing')}
            onSwitchRole={(r) => setCurrentView(`auth-${r}` as AppView)}
          />
        )}

        {/* CANDIDATE VIEW */}
        {currentView === 'candidate' &&
          (currentUser?.role === 'candidate' || sandboxBypassed ? (
            <CandidateDashboard
              currentUser={currentUser}
              jobs={jobs}
              resumes={resumes}
              profile={profile}
              applications={applications}
              onOpenUploadModal={() => setUploadModalOpen(true)}
              onRefreshApplications={handleRefreshApplications}
              onRefreshResumes={handleRefreshResumes}
              onUpdateProfile={handleUpdateProfile}
              activeModule={candidateActiveModule}
              activeSubPart={candidateActivePart}
              onModuleChange={(mod) => {
                setCandidateActiveModule(mod);
                const firstPart = (CANDIDATE_MODULE_PARTS[mod] || [])[0]?.id || 'all';
                setCandidateActivePart(firstPart);
              }}
              onSubPartChange={(part) => setCandidateActivePart(part)}
              onLogout={handleLogout}
            />
          ) : (
            <RoleAccessGate
              requiredRole="candidate"
              currentUser={currentUser}
              onOpenLogin={handleOpenLogin}
              onOpenRegister={handleOpenRegister}
              onQuickDemoLogin={handleQuickDemoLogin}
              onSwitchToUserWorkspace={(role) => setCurrentView(role)}
              onBypassSandbox={() => setSandboxBypassed(true)}
            />
          ))}

        {/* RECRUITER VIEW */}
        {currentView === 'recruiter' &&
          (currentUser?.role === 'recruiter' || sandboxBypassed ? (
            <RecruiterDashboard
              currentUser={currentUser}
              jobs={jobs}
              onAddJob={handleAddJob}
              onRefreshJobs={handleRefreshJobs}
              activeModule={recruiterActiveModule}
              activeSubPart={recruiterActivePart}
              onModuleChange={(mod) => {
                setRecruiterActiveModule(mod);
                const firstPart = (RECRUITER_MODULE_PARTS[mod] || [])[0]?.id || 'overview';
                setRecruiterActivePart(firstPart);
              }}
              onSubPartChange={(part) => setRecruiterActivePart(part)}
              onLogout={handleLogout}
            />
          ) : (
            <RoleAccessGate
              requiredRole="recruiter"
              currentUser={currentUser}
              onOpenLogin={handleOpenLogin}
              onOpenRegister={handleOpenRegister}
              onQuickDemoLogin={handleQuickDemoLogin}
              onSwitchToUserWorkspace={(role) => setCurrentView(role)}
              onBypassSandbox={() => setSandboxBypassed(true)}
            />
          ))}

        {/* ADMIN VIEW */}
        {currentView === 'admin' &&
          (currentUser?.role === 'admin' || sandboxBypassed ? (
            <AdminDashboard
              auditLogs={auditLogs}
              health={health}
              onOpenHealth={() => setHealthModalOpen(true)}
            />
          ) : (
            <RoleAccessGate
              requiredRole="admin"
              currentUser={currentUser}
              onOpenLogin={handleOpenLogin}
              onOpenRegister={handleOpenRegister}
              onQuickDemoLogin={handleQuickDemoLogin}
              onSwitchToUserWorkspace={(role) => setCurrentView(role)}
              onBypassSandbox={() => setSandboxBypassed(true)}
            />
          ))}

        {currentView === 'architecture' && <ArchitectureExplorer />}
      </main>

      {/* Global Footer (Rendered ONLY before login on public landing page) */}
      {!currentUser && currentView === 'landing' && (
        <Footer
          onNavigate={setCurrentView}
          onOpenHealth={() => setHealthModalOpen(true)}
        />
      )}

      {/* Backend Health Diagnostics Modal */}
      <HealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        initialHealth={health}
        onHealthUpdate={setHealth}
      />

      {/* Resume Document Upload Modal */}
      <ResumeUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleResumeUploaded}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        initialRole={activeLoginRole}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={(role) => {
          setLoginModalOpen(false);
          setActiveRegisterRole(role || 'candidate');
          setRegisterModalOpen(true);
        }}
        onPromptOtp={handlePromptOtp}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        initialRole={activeRegisterRole}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={(role) => {
          setRegisterModalOpen(false);
          setActiveLoginRole(role || 'candidate');
          setLoginModalOpen(true);
        }}
        onPromptOtp={handlePromptOtp}
      />

      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        email={otpEmail}
        demoHint={otpDemoHint}
        resendError={otpResendError}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
