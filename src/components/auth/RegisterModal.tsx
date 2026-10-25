/**
 * CareerSphere AI — Dedicated User Registration Modal
 * Tailored registration paths for Candidates and HR Recruiters with Resend Email OTP.
 */
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiClient } from '../../services/api';
import { UserRole } from '../../types';
import { User, Briefcase, Shield, Mail, Lock, AlertTriangle, Loader2, Building, Target, CheckCircle2 } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptOtp: (email: string, hint?: string, error?: string) => void;
  onSwitchToLogin: (role?: UserRole) => void;
  initialRole?: UserRole;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onPromptOtp,
  onSwitchToLogin,
  initialRole = 'candidate',
}) => {
  const [role, setRole] = useState<'candidate' | 'recruiter'>(initialRole === 'recruiter' ? 'recruiter' : 'candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Candidate specific
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [headline, setHeadline] = useState('Senior Full-Stack Engineer');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState('4');
  const [desiredSalaryMin, setDesiredSalaryMin] = useState('135000');
  const [workplacePreference, setWorkplacePreference] = useState<'Remote' | 'Hybrid' | 'On-site'>('Remote');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, Python, Node.js, PostgreSQL');
  const [bio, setBio] = useState('Passionate engineer building high-impact products.');
  // Recruiter specific
  const [companyName, setCompanyName] = useState('TechVentures AI');
  const [department, setDepartment] = useState('Engineering & Product');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ isConfigured: boolean; fromEmail: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole === 'recruiter' ? 'recruiter' : 'candidate');
      setError(null);
      apiClient.getResendStatus().then(setResendStatus).catch(() => null);
    }
  }, [isOpen, initialRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('All core fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
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

      onClose();
      onPromptOtp(email.trim(), data.demoOtpHint, data.resendError);
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role === 'candidate' ? 'Create Candidate Account' : 'Create HR Recruiter Account'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Role Selector Tabs */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Your Workspace Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setRole('candidate');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                role === 'candidate'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="h-4 w-4 text-indigo-400" />
              <span>Candidate / Job Seeker</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('recruiter');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                role === 'recruiter'
                  ? 'bg-cyan-950/60 border-cyan-500 text-white font-semibold shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="h-4 w-4 text-cyan-400" />
              <span>HR Recruiter / Employer</span>
            </button>
          </div>
        </div>

        {/* Resend Email Delivery Status Banner */}
        <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/70 text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>Email OTP Delivery:</span>
            {resendStatus?.isConfigured ? (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Resend API Active
              </span>
            ) : (
              <span className="text-amber-400 font-medium">Ready for RESEND_API_KEY</span>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-400">15m Expiration</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-900/40 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              {role === 'recruiter' ? 'Recruiter Full Name' : 'Candidate Full Name'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              {role === 'recruiter' ? 'Company Work Email' : 'Candidate Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder={role === 'recruiter' ? 'recruiter@company.com' : 'you@domain.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Password (Min. 8 characters)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Candidate-specific fields */}
          {role === 'candidate' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Target Job Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack AI Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Workplace</label>
                  <select
                    value={workplacePreference}
                    onChange={(e) => setWorkplacePreference(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Primary Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Python, Node.js"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Recruiter-specific fields */}
          {role === 'recruiter' && (
            <>
              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Company / Organization Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthetix Dynamics"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering & Product Talent"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-xs font-semibold text-white ${
            role === 'recruiter' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500'
          } disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer`}
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>{loading ? 'Dispatching OTP...' : `Register & Send Verification Code`}</span>
        </button>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between">
          <span>Already registered?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin(role);
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Sign In to {role === 'recruiter' ? 'Recruiter' : 'Candidate'} Portal
          </button>
        </div>
      </form>
    </Modal>
  );
};
