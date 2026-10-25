/**
 * CareerSphere AI — Dedicated Full-Page Role Authentication
 * Separate entry points for Candidates, HR Recruiters, and Administrators.
 * Enforces role isolation, Resend email OTP verification, and clear capability matching.
 */
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { apiClient } from '../../services/api';
import {
  UserCheck,
  Briefcase,
  Shield,
  Mail,
  Lock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building,
  Target,
  FileText,
  Zap,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';
import { ForgotPasswordModal } from '../recruiter/ForgotPasswordModal';

interface DedicatedAuthPageProps {
  role: UserRole;
  mode?: 'login' | 'register';
  onSuccess: (user: User) => void;
  onPromptOtp: (email: string, hint?: string, error?: string) => void;
  onNavigateHome: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const DedicatedAuthPage: React.FC<DedicatedAuthPageProps> = ({
  role,
  mode = 'login',
  onSuccess,
  onPromptOtp,
  onNavigateHome,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    role === 'admin' ? 'login' : mode
  );

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Candidate fields
  const [targetRole, setTargetRole] = useState('Full-Stack Engineer');
  const [headline, setHeadline] = useState('Full-Stack Engineer & AI Builder');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState('4');
  const [desiredSalaryMin, setDesiredSalaryMin] = useState('135000');
  const [workplacePreference, setWorkplacePreference] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, Node.js, Python, PostgreSQL');
  const [bio, setBio] = useState('Product-oriented engineer passionate about high-impact AI systems.');

  // Recruiter fields
  const [companyName, setCompanyName] = useState('TechVentures AI');
  const [department, setDepartment] = useState('Engineering & Product');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Set default demo email if empty on role switch
  React.useEffect(() => {
    setError(null);
    if (activeTab === 'login') {
      if (role === 'candidate') {
        setEmail('candidate@careersphere.ai');
        setPassword('Password123!');
      } else if (role === 'recruiter') {
        setEmail('recruiter@synthetix.com');
        setPassword('Password123!');
      } else {
        setEmail('admin@careersphere.ai');
        setPassword('Password123!');
      }
    } else {
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [role, activeTab]);

  const handleLoginSubmit = async (e: React.FormEvent, isQuickDemo = false) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.login(email.trim(), password, isQuickDemo);
      if (data.requiresOtp) {
        onPromptOtp(email.trim(), data.demoOtpHint, data.resendError);
      } else if (data.token && data.user) {
        onSuccess(data.user);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (role === 'recruiter' && !companyName.trim()) {
      setError('Company name is required for recruiter registration.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const data = await apiClient.register({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        phone: role === 'candidate' ? phone.trim() : undefined,
        location: role === 'candidate' ? location.trim() : undefined,
        companyName: role === 'recruiter' ? companyName.trim() : undefined,
        department: role === 'recruiter' ? department.trim() : undefined,
        targetRole: role === 'candidate' ? targetRole.trim() : undefined,
        headline: role === 'candidate' ? headline.trim() : undefined,
        experienceYears: role === 'candidate' ? Number(experienceYears) || 3 : undefined,
        desiredSalaryMin: role === 'candidate' ? Number(desiredSalaryMin) || 120000 : undefined,
        workplacePreference: role === 'candidate' ? workplacePreference : undefined,
        skills: role === 'candidate' ? skills : undefined,
        bio: role === 'candidate' ? bio.trim() : undefined,
      });

      onPromptOtp(email.trim(), data.demoOtpHint, data.resendError);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const portalConfig = {
    candidate: {
      title: 'Candidate Career Portal',
      subtitle: 'Analyze resumes with Gemini Flash, match jobs, and trigger autonomous n8n multi-apply.',
      badge: 'Job Seeker & Student Workspace',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
      accentColor: 'indigo',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
      icon: <UserCheck className="h-6 w-6 text-indigo-400" />,
      features: [
        'AI ATS Resume Analyzer with semantic score',
        'Resume Copilot Studio with side-by-side diff editor',
        'Browse verified job openings & 1-Click apply',
        'Autonomous n8n multi-job apply toggle engine',
        'Application pipeline status tracker',
      ],
    },
    recruiter: {
      title: 'HR & Recruiter Portal',
      subtitle: 'Post open positions, review candidate match scores, and coordinate hiring pipelines.',
      badge: 'Employer & Talent Acquisition',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
      accentColor: 'cyan',
      btnPrimary: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30',
      icon: <Briefcase className="h-6 w-6 text-cyan-400" />,
      features: [
        'Job Posting Studio with draft & publish controls',
        'Applicant review Kanban with match ratings',
        'Candidate profile evaluation & resume inspector',
        'Interview coordination and status transitions',
        'Company verification badge with admin audit trail',
      ],
    },
    admin: {
      title: 'System Administrator Enclave',
      subtitle: 'Enterprise governance, live database metrics, recruiter verification, and security audit logs.',
      badge: 'System Governance & Security Hub',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      accentColor: 'emerald',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
      icon: <Shield className="h-6 w-6 text-emerald-400" />,
      features: [
        'Live database metrics (Users, Jobs, Applications)',
        'Recruiter organization verification & moderation',
        'Job post moderation (Approve, Reject, Archive)',
        'User management with superuser safeguards',
        'Zero-trust security audit logs & n8n engine diagnostics',
      ],
    },
  }[role];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-slate-950">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Portal Overview & Matched Capabilities */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-6 text-left">
          <div className="space-y-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Platform Dashboard</span>
            </button>

            <div className="flex items-center gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                {portalConfig.icon}
              </div>
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${portalConfig.badgeColor}`}>
                  {portalConfig.badge}
                </span>
                <h1 className="text-xl font-bold text-white tracking-tight mt-1">
                  {portalConfig.title}
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {portalConfig.subtitle}
            </p>

            {/* Matched Options List ("evaru ememi cheyyalo adi matrame") */}
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Matched Role Capabilities:
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {portalConfig.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Portal Switcher */}
          <div className="pt-6 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="text-[11px] text-slate-400">Switch Workspace:</div>
            <div className="flex flex-wrap gap-2">
              {role !== 'candidate' && (
                <button
                  type="button"
                  onClick={() => onSwitchRole('candidate')}
                  className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/70 text-indigo-400 hover:text-white hover:border-indigo-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  <span>Candidate</span>
                </button>
              )}
              {role !== 'recruiter' && (
                <button
                  type="button"
                  onClick={() => onSwitchRole('recruiter')}
                  className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/70 text-cyan-400 hover:text-white hover:border-cyan-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Briefcase className="h-3 w-3" />
                  <span>HR Recruiter</span>
                </button>
              )}
              {role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => onSwitchRole('admin')}
                  className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/70 text-emerald-400 hover:text-white hover:border-emerald-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  <span>Admin Hub</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col justify-between text-left">
          <div>
            {/* Mode Tabs (Sign In vs Register) */}
            {role !== 'admin' ? (
              <div className="flex items-center border-b border-slate-800 pb-3 mb-6 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                  }}
                  className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                    activeTab === 'login'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In to Workspace
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setError(null);
                  }}
                  className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                    activeTab === 'register'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create {role === 'candidate' ? 'Candidate' : 'Recruiter'} Account
                </button>
              </div>
            ) : (
              <div className="border-b border-slate-800 pb-3 mb-6">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Administrator Authentication</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Superuser access requires verified credentials and 2FA email verification.
                </p>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' ? (
              <form onSubmit={(e) => handleLoginSubmit(e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {role === 'recruiter' ? 'Business Email Address' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder={
                        role === 'candidate'
                          ? 'candidate@careersphere.ai'
                          : role === 'recruiter'
                          ? 'recruiter@synthetix.com'
                          : 'admin@careersphere.ai'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Send className="h-3 w-3 text-indigo-400" />
                    <span>Email OTP Security Policy:</span>
                  </div>
                  <p className="leading-relaxed">
                    Upon submitting credentials, a secure 6-digit OTP code is dispatched via Resend API to verify account ownership.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md disabled:opacity-50 ${portalConfig.btnPrimary}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send OTP & Sign In</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleLoginSubmit(e, true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                    title="Bypass OTP for quick development evaluation"
                  >
                    1-Click Demo
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Chen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {role === 'recruiter' ? 'Work Email' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Password (min 8 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {role === 'candidate' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Target Job Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Backend Engineer"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Professional Headline</label>
                        <input
                          type="text"
                          placeholder="e.g. Full-Stack Engineer & AI Builder"
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                        <input
                          type="text"
                          placeholder="+1 (555) 019-2834"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Location / Residence</label>
                        <input
                          type="text"
                          placeholder="San Francisco, CA or Remote"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Experience (Years)</label>
                        <input
                          type="number"
                          min={0}
                          max={40}
                          placeholder="4"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Min Salary (USD/yr)</label>
                        <input
                          type="number"
                          step={5000}
                          placeholder="135000"
                          value={desiredSalaryMin}
                          onChange={(e) => setDesiredSalaryMin(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Workplace Preference</label>
                        <select
                          value={workplacePreference}
                          onChange={(e) => setWorkplacePreference(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="On-site">On-site</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Core Skills (comma separated)</label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Python, Node.js, PostgreSQL"
                        value={skillsStr}
                        onChange={(e) => setSkillsStr(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Professional Bio / Elevator Pitch</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary of your expertise and what you build..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Hiring Organization / Company</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Synthetix Dynamics"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                        <input
                          type="text"
                          placeholder="e.g. Talent Acquisition"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-md disabled:opacity-50 ${portalConfig.btnPrimary}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Account & Dispatching OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account & Verify Email</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>CareerSphere AI Zero-Trust RBAC</span>
            <span>Resend API Email Delivery Guard</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
