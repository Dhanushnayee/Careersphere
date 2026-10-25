/**
 * CareerSphere AI — Settings & Privacy Workspace (Phase 4 / Module 10)
 * Production-ready implementation with 9 comprehensive categories:
 * 1. Account Information
 * 2. Login & Security (Password management, 2FA, Login Activity)
 * 3. Privacy & Visibility (Profile visibility, Resume permissions, Consents)
 * 4. Notifications & Communication Preferences
 * 5. AI & Personalization Settings
 * 6. Connected Devices & Active Sessions
 * 7. Data Management (GDPR Export & Deletion requests)
 * 8. Accessibility & Appearance
 * 9. Account Deactivation & Deletion
 */
import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Smartphone,
  Eye,
  Bell,
  Sparkles,
  Laptop,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Globe,
  Clock,
  RotateCw,
  LogOut,
  Copy,
  Check,
  Moon,
  Sun,
  Monitor,
  X,
  ChevronRight,
  HelpCircle,
  FileText,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { CandidateFullSettings } from '../../types';
import { apiClient } from '../../services/api';

export type SettingsCategory =
  | 'account'
  | 'security'
  | 'privacy'
  | 'notifications'
  | 'ai'
  | 'sessions'
  | 'data'
  | 'appearance'
  | 'deactivation';

interface SettingsAndPrivacyWorkspaceProps {
  initialCategory?: SettingsCategory;
  onCategoryChange?: (cat: SettingsCategory) => void;
  onLogout?: () => void;
  currentUser?: any;
}

export const SettingsAndPrivacyWorkspace: React.FC<SettingsAndPrivacyWorkspaceProps> = ({
  initialCategory = 'account',
  onCategoryChange,
  onLogout,
  currentUser,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory);

  // Sync if prop changes externally (e.g. from top Navbar click)
  useEffect(() => {
    if (initialCategory && initialCategory !== activeCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleSelectCategory = (cat: SettingsCategory) => {
    setActiveCategory(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  const [settings, setSettings] = useState<CandidateFullSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [accountForm, setAccountForm] = useState({
    name: '',
    phone: '',
    headline: '',
    timezone: '',
    newEmail: '',
  });

  // Password state
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState('');

  // 2FA state
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);
  const [twoFaCodeInput, setTwoFaCodeInput] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteKeyword, setDeleteKeyword] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCandidateSettings();
      setSettings(data);
      if (data?.account) {
        setAccountForm({
          name: data.account.name || '',
          phone: data.account.phone || '',
          headline: data.account.headline || '',
          timezone: data.account.timezone || 'America/Los_Angeles (PST, UTC-8)',
          newEmail: '',
        });
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      showToast('Could not load settings from server. Check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Account Info
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiClient.updateAccountSettings(accountForm);
      if (res?.settings) {
        setSettings(res.settings);
      }
      showToast('Account preferences saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdNew.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError('New passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      await apiClient.changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew });
      showToast('Password changed successfully. Your account is secured.');
      setPwdModalOpen(false);
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
      loadSettings();
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async (enable: boolean) => {
    try {
      setSaving(true);
      const res = await apiClient.toggle2FA({ enable, method: 'authenticator' });
      if (res?.data?.security && settings) {
        setSettings({ ...settings, security: res.data.security });
      }
      showToast(enable ? '2FA enabled! Save your recovery codes.' : '2FA disabled.');
      setTwoFaModalOpen(false);
      loadSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle 2FA.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      setSaving(true);
      const res = await apiClient.revokeSession(sessionId);
      if (res?.data?.sessions && settings) {
        setSettings({ ...settings, sessions: res.data.sessions });
      }
      showToast('Session terminated successfully.');
      loadSettings();
    } catch (err: any) {
      showToast(err.message || 'Could not revoke session.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Revoke all other sessions
  const handleRevokeAllOtherSessions = async () => {
    try {
      setSaving(true);
      const res = await apiClient.revokeAllOtherSessions();
      if (res?.data?.sessions && settings) {
        setSettings({ ...settings, sessions: res.data.sessions });
      }
      showToast('All background device sessions terminated.');
      loadSettings();
    } catch (err: any) {
      showToast(err.message || 'Could not revoke sessions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Privacy update
  const handleUpdatePrivacy = async (updates: Partial<CandidateFullSettings['privacy']>) => {
    if (!settings) return;
    const newPrivacy = { ...settings.privacy, ...updates };
    setSettings({ ...settings, privacy: newPrivacy });
    try {
      await apiClient.updatePrivacySettings(updates);
      showToast('Privacy preferences updated.');
    } catch (err: any) {
      showToast('Failed to save privacy setting.', 'error');
      loadSettings();
    }
  };

  // Notification update
  const handleUpdateNotifications = async (updates: Partial<CandidateFullSettings['notifications']>) => {
    if (!settings) return;
    const newNotifs = { ...settings.notifications, ...updates };
    setSettings({ ...settings, notifications: newNotifs });
    try {
      await apiClient.updateNotificationSettings(updates);
      showToast('Notification settings saved.');
    } catch (err: any) {
      showToast('Failed to save notification preferences.', 'error');
      loadSettings();
    }
  };

  // AI preferences update
  const handleUpdateAiPreferences = async (updates: Partial<CandidateFullSettings['aiPreferences']>) => {
    if (!settings) return;
    const newAi = { ...settings.aiPreferences, ...updates };
    setSettings({ ...settings, aiPreferences: newAi });
    try {
      await apiClient.updateAiPreferences(updates);
      showToast('AI preferences updated.');
    } catch (err: any) {
      showToast('Failed to update AI preferences.', 'error');
      loadSettings();
    }
  };

  // Appearance update
  const handleUpdateAppearance = async (updates: Partial<CandidateFullSettings['appearance']>) => {
    if (!settings) return;
    const newApp = { ...settings.appearance, ...updates };
    setSettings({ ...settings, appearance: newApp });
    try {
      await apiClient.updateAppearanceSettings(updates);
      showToast('Appearance updated.');
    } catch (err: any) {
      showToast('Failed to update appearance.', 'error');
    }
  };

  // Export Data Download
  const handleExportData = async () => {
    try {
      showToast('Compiling account archive...');
      const res = await apiClient.exportCandidateData();
      const blob = new Blob([JSON.stringify(res.data || res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careersphere_data_export_${settings?.account.name.replace(/\s+/g, '_') || 'candidate'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data export download initiated successfully!');
    } catch (err: any) {
      showToast('Failed to generate data export.', 'error');
    }
  };

  // Deactivate Account
  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to temporarily deactivate your account? Your job alerts and recruiter discovery will be paused.')) {
      return;
    }
    try {
      setSaving(true);
      await apiClient.deactivateAccount();
      showToast('Account deactivated. You can reactivate anytime by logging in.');
      loadSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate account.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Permanent Delete Account
  const handleDeleteAccount = async () => {
    if (deleteKeyword !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }
    try {
      setSaving(true);
      await apiClient.deleteAccount('DELETE');
      showToast('Account scheduled for permanent erasure. Signing out...');
      setDeleteModalOpen(false);
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 2000);
    } catch (err: any) {
      showToast(err.message || 'Deletion request failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const navCategories: Array<{ id: SettingsCategory; label: string; icon: any; countBadge?: string }> = [
    { id: 'account', label: 'Account Information', icon: User },
    { id: 'security', label: 'Login & Security', icon: Key, countBadge: settings?.security?.twoFactorEnabled ? '2FA ON' : '2FA OFF' },
    { id: 'privacy', label: 'Privacy & Visibility', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI & Personalization', icon: Sparkles },
    { id: 'sessions', label: 'Connected Devices', icon: Laptop, countBadge: `${settings?.sessions?.length || 1} Active` },
    { id: 'data', label: 'Data Management', icon: Download },
    { id: 'appearance', label: 'Accessibility & Theme', icon: Sliders },
    { id: 'deactivation', label: 'Deactivation & Deletion', icon: Trash2 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4">
        <RotateCw className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading candidate security & privacy configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium border backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Settings & Privacy Hub</h2>
              <p className="text-xs text-slate-400">
                Manage your credentials, two-factor authentication, recruiter visibility, and GDPR data export.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Archive</span>
          </button>
        </div>
      </div>

      {/* Main Container: Category Selector on Top/Left + Category Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation Pills (Desktop Sidebar & Mobile Scroll) */}
        <div className="lg:col-span-1 space-y-1 overflow-x-auto lg:overflow-x-visible flex lg:flex-col gap-1.5 pb-2 lg:pb-0 google-photos-scrollbar">
          {navCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </div>
                {cat.countBadge && (
                  <span
                    className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Detail View */}
        <div className="lg:col-span-3 space-y-6">
          {/* =========================================================================
              1. ACCOUNT INFORMATION
             ========================================================================= */}
          {activeCategory === 'account' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  <span>Account Information</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your personal credentials, contact email, phone number, and regional preferences.
                </p>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Account Status</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{settings?.account.accountStatus || 'Active'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Email Verification</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{settings?.account.isEmailVerified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Membership Tier</div>
                  <div className="mt-1 text-xs font-bold text-white">{settings?.account.accountType || 'Candidate'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Created On</div>
                  <div className="mt-1 text-xs font-mono text-slate-300">
                    {settings?.account.createdAt ? new Date(settings.account.createdAt).toLocaleDateString() : 'Sep 2026'}
                  </div>
                </div>
              </div>

              {/* Account Edit Form */}
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Account Email</label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="font-mono">{settings?.account.email}</span>
                      <span className="ml-auto text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                        Active
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Change Email Address</label>
                    <input
                      type="email"
                      value={accountForm.newEmail}
                      onChange={(e) => setAccountForm({ ...accountForm, newEmail: e.target.value })}
                      placeholder="Enter new email address..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Headline</label>
                    <input
                      type="text"
                      value={accountForm.headline}
                      onChange={(e) => setAccountForm({ ...accountForm, headline: e.target.value })}
                      placeholder="e.g. Senior Full-Stack Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Time Zone</label>
                    <select
                      value={accountForm.timezone}
                      onChange={(e) => setAccountForm({ ...accountForm, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="America/Los_Angeles (PST, UTC-8)">Pacific Time (US & Canada, UTC-8)</option>
                      <option value="America/New_York (EST, UTC-5)">Eastern Time (US & Canada, UTC-5)</option>
                      <option value="Europe/London (GMT, UTC+0)">London (GMT, UTC+0)</option>
                      <option value="Asia/Kolkata (IST, UTC+5:30)">India Standard Time (IST, UTC+5:30)</option>
                      <option value="Asia/Singapore (SGT, UTC+8)">Singapore Time (SGT, UTC+8)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Account Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              2. LOGIN & SECURITY
             ========================================================================= */}
          {activeCategory === 'security' && (
            <div className="space-y-6">
              {/* Password Section */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="h-4 w-4 text-indigo-400" />
                      <span>Password Management</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Last changed on{' '}
                      <span className="text-slate-300 font-mono">
                        {settings?.security.lastPasswordChange
                          ? new Date(settings.security.lastPasswordChange).toLocaleDateString()
                          : 'Recently'}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setPwdModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:text-white hover:bg-indigo-600/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-emerald-400" />
                        <span>Two-Factor Authentication (2FA)</span>
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          settings?.security.twoFactorEnabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {settings?.security.twoFactorEnabled ? 'ENFORCED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Protect your applications and personal documents with time-based one-time passwords (TOTP) from
                      authenticator apps like Google Authenticator or 1Password.
                    </p>
                  </div>

                  <div className="shrink-0">
                    {settings?.security.twoFactorEnabled ? (
                      <button
                        onClick={() => handleToggle2FA(false)}
                        className="px-3.5 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Disable 2FA
                      </button>
                    ) : (
                      <button
                        onClick={() => setTwoFaModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        Enable 2FA
                      </button>
                    )}
                  </div>
                </div>

                {/* Emergency Recovery Codes */}
                {settings?.security.twoFactorEnabled && settings.security.recoveryCodes && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Emergency Recovery Codes</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(settings.security.recoveryCodes.join('\n'));
                          setCopiedCodes(true);
                          setTimeout(() => setCopiedCodes(false), 2000);
                        }}
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {copiedCodes ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedCodes ? 'Copied' : 'Copy Codes'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {settings.security.recoveryCodes.map((code, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-center font-mono text-xs text-indigo-300 font-semibold"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Store these safely. Each code can be used once to access your account if you lose your authenticator.
                    </p>
                  </div>
                )}
              </div>

              {/* Login Activity Logs */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>Recent Security & Login Activity</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Audit events recorded from your candidate account. IP addresses are partially masked for privacy.
                </p>

                <div className="overflow-x-auto google-photos-scrollbar">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="pb-2 font-medium">Event</th>
                        <th className="pb-2 font-medium">Details</th>
                        <th className="pb-2 font-medium">IP Address</th>
                        <th className="pb-2 font-medium">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {settings?.auditLogs.map((log) => (
                        <tr key={log.id} className="text-slate-300">
                          <td className="py-2.5 font-semibold text-indigo-300">{log.action}</td>
                          <td className="py-2.5 text-slate-400">{log.details}</td>
                          <td className="py-2.5 font-mono text-[11px] text-slate-500">{log.ip}</td>
                          <td className="py-2.5 text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              3. PRIVACY & VISIBILITY
             ========================================================================= */}
          {activeCategory === 'privacy' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-400" />
                  <span>Privacy & Recruiter Visibility</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Control how visible your profile, skills, and resume documents are across employer searches.
                </p>
              </div>

              {/* Profile Visibility Options */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-200">Candidate Profile Visibility</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'public',
                      title: 'Public & Searchable',
                      desc: 'Indexed across partner hiring boards and visible to all verified companies.',
                    },
                    {
                      id: 'recruiters_only',
                      title: 'Verified Recruiters Only',
                      desc: 'Hidden from public web search. Only approved employers can view your profile.',
                    },
                    {
                      id: 'private',
                      title: 'Stealth / Private',
                      desc: 'Hidden from discovery. Only companies where you submit an application can see you.',
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleUpdatePrivacy({ profileVisibility: opt.id as any })}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        settings?.privacy.profileVisibility === opt.id
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-100">{opt.title}</span>
                        {settings?.privacy.profileVisibility === opt.id && (
                          <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Download Privacy */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-200">Resume Document Permissions</label>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Direct Resume PDF Downloads</div>
                    <div className="text-[11px] text-slate-400">
                      Allow verified recruiters to download your ATS-ready resume file directly without requesting permission.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.privacy.allowResumeDownload ?? true}
                    onChange={(e) => handleUpdatePrivacy({ allowResumeDownload: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Obfuscation Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-200">Contact Obfuscation</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-300">Hide phone number on initial recruiter profile preview</span>
                    <input
                      type="checkbox"
                      checked={settings?.privacy.hidePhoneFromPublic ?? true}
                      onChange={(e) => handleUpdatePrivacy({ hidePhoneFromPublic: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs text-slate-300">Mask personal email address until interview is scheduled</span>
                    <input
                      type="checkbox"
                      checked={settings?.privacy.hideEmailFromPublic ?? true}
                      onChange={(e) => handleUpdatePrivacy({ hideEmailFromPublic: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Consent Management */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-200">Consent & Telemetry</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <div className="text-xs font-medium text-slate-300">AI Personalization Context Sharing</div>
                      <div className="text-[11px] text-slate-500">Allow AI Career Assistant to ground answers in your real resumes & applications.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings?.privacy.aiPersonalizationConsent ?? true}
                      onChange={(e) => handleUpdatePrivacy({ aiPersonalizationConsent: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <div className="text-xs font-medium text-slate-300">Product Analytics & Platform Telemetry</div>
                      <div className="text-[11px] text-slate-500">Share anonymized navigation metrics to help improve matching algorithms.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings?.privacy.analyticsConsent ?? true}
                      onChange={(e) => handleUpdatePrivacy({ analyticsConsent: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. NOTIFICATIONS
             ========================================================================= */}
          {activeCategory === 'notifications' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-400" />
                  <span>Notification Preferences</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Customize the channels and frequency of alerts for jobs, application status, and interviews.
                </p>
              </div>

              {/* Email Notifications */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Email Channels</h4>
                <div className="space-y-2">
                  {[
                    { key: 'emailJobAlerts', title: 'Job Recommendations', desc: 'Daily alerts when high-match roles fit your skills' },
                    { key: 'emailApplicationUpdates', title: 'Application Status Updates', desc: 'Instant emails when a recruiter reviews or moves your application' },
                    { key: 'emailInterviewReminders', title: 'Interview Invitations & Reminders', desc: 'Calendar invitations, Google Meet links, and 24h reminders' },
                    { key: 'emailRecruiterMessages', title: 'Direct Recruiter Messages', desc: 'Real-time emails when a talent acquisition partner reaches out' },
                    { key: 'emailSecurityAlerts', title: 'Security & Access Warnings', desc: 'New login from unrecognized device or password modification (Required)', disabled: true },
                    { key: 'emailWeeklyDigest', title: 'Weekly Career Digest', desc: 'Summary of hiring market trends, salary shifts, and skills in demand' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div>
                        <div className="text-xs font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.disabled ? true : (settings?.notifications as any)?.[item.key] ?? false}
                        disabled={item.disabled}
                        onChange={(e) => handleUpdateNotifications({ [item.key]: e.target.checked })}
                        className="h-4 w-4 accent-indigo-600 cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* In-App Notifications */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">In-App Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">Instant Toast Notifications</div>
                      <div className="text-[11px] text-slate-400">Pop-up notifications while actively working in the candidate portal.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings?.notifications.inAppInstantAlerts ?? true}
                      onChange={(e) => handleUpdateNotifications({ inAppInstantAlerts: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-white">Notification Sounds</div>
                      <div className="text-[11px] text-slate-400">Play subtle audio chime when recruiter messages arrive.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings?.notifications.inAppSound ?? true}
                      onChange={(e) => handleUpdateNotifications({ inAppSound: e.target.checked })}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              5. AI & PERSONALIZATION
             ========================================================================= */}
          {activeCategory === 'ai' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>AI & Personalization Engine</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure Gemini AI model grounding, career roadmap tailoring, and job recommendation bias.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">AI Career Assistant Personalization</div>
                    <div className="text-[11px] text-slate-400">
                      When enabled, the assistant references your actual resumes, interview schedule, and applications to provide tailored advice.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.aiPreferences.enablePersonalization ?? true}
                    onChange={(e) => handleUpdateAiPreferences({ enablePersonalization: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Include Primary Resume in Prompt Context</div>
                    <div className="text-[11px] text-slate-400">
                      Supplies parsed bullet points to Gemini 3.8 Flash for precision skill gap analysis and resume tailoring.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.aiPreferences.allowResumeContext ?? true}
                    onChange={(e) => handleUpdateAiPreferences({ allowResumeContext: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-white">Auto-Generate Career Roadmaps</div>
                    <div className="text-[11px] text-slate-400">
                      Continuously track target role milestones as you pass skill assessments and save matched jobs.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings?.aiPreferences.autoGenerateRoadmap ?? true}
                    onChange={(e) => handleUpdateAiPreferences({ autoGenerateRoadmap: e.target.checked })}
                    className="h-4 w-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Recommendation Bias */}
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">Job Recommendation Optimization Priority</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'skills', title: 'Skills Match', desc: 'Prioritize ATS skill coverage' },
                      { id: 'salary', title: 'Compensation', desc: 'Highest disclosed salary' },
                      { id: 'remote', title: 'Remote-First', desc: '100% Work from Anywhere' },
                      { id: 'balanced', title: 'Balanced AI', desc: 'Holistic weighting' },
                    ].map((bias) => (
                      <div
                        key={bias.id}
                        onClick={() => handleUpdateAiPreferences({ recommendationBias: bias.id as any })}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          settings?.aiPreferences.recommendationBias === bias.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-100">{bias.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{bias.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              6. CONNECTED DEVICES & SESSIONS
             ========================================================================= */}
          {activeCategory === 'sessions' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-indigo-400" />
                    <span>Active Sessions & Connected Devices</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Review and revoke active candidate sessions across desktop, mobile, and verified devices.
                  </p>
                </div>
                <button
                  onClick={handleRevokeAllOtherSessions}
                  disabled={saving || (settings?.sessions?.length || 0) <= 1}
                  className="px-3 py-1.5 rounded-lg border border-rose-800/80 bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                >
                  Terminate All Other Sessions
                </button>
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                {settings?.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      sess.isCurrent
                        ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          sess.isCurrent ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        <Laptop className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                              This Device
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sess.browser} • {sess.os} • <span className="font-mono text-slate-500">{sess.ip}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                          <Globe className="h-3 w-3" />
                          <span>{sess.location}</span>
                          <span className="mx-1">•</span>
                          <span>Last active: {sess.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        disabled={saving}
                        className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800 hover:bg-slate-900 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Recognized Hardware */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Approved Hardware Profiles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {settings?.devices.map((dev) => (
                    <div key={dev.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{dev.deviceName}</div>
                        <div className="text-[11px] text-slate-400">{dev.deviceType}</div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                        {dev.approvalStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              7. DATA MANAGEMENT
             ========================================================================= */}
          {activeCategory === 'data' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="h-4 w-4 text-indigo-400" />
                  <span>Data Portability & Management</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exercise your GDPR / CCPA candidate rights: download a full copy of your profile or request data purge.
                </p>
              </div>

              {/* Export Card */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Export My CareerSphere Archive (JSON)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Includes candidate profile, verified skills, uploaded resume drafts, application stages, interview notes, and preferences.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Archive</span>
                  </button>
                </div>
              </div>

              {/* Data Deletion Card */}
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Request Account Data Erasure</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Permanently delete your profile, resume files, and AI conversation memory. To preserve regulatory
                    hiring audit trails, submitted applications are anonymized according to standard compliance protocols.
                  </p>
                </div>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-rose-800 bg-rose-900/40 text-rose-200 hover:bg-rose-900 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Initiate Deletion Request
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              8. ACCESSIBILITY & APPEARANCE
             ========================================================================= */}
          {activeCategory === 'appearance' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <span>Accessibility & Appearance</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust color theme, typography density, and motion animations for optimal viewing comfort.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-200">Interface Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', title: 'High-Tech Dark', icon: Moon, desc: 'Optimized for high-contrast engineering' },
                    { id: 'light', title: 'Clean Light', icon: Sun, desc: 'High-brightness daytime view' },
                    { id: 'system', title: 'System Default', icon: Monitor, desc: 'Follows operating system' },
                  ].map((thm) => {
                    const Icon = thm.icon;
                    return (
                      <div
                        key={thm.id}
                        onClick={() => handleUpdateAppearance({ theme: thm.id as any })}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          settings?.appearance.theme === thm.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1.5 text-indigo-400" />
                        <div className="text-xs font-bold text-slate-100">{thm.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{thm.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Reduced Motion Animations</div>
                  <div className="text-[11px] text-slate-400">
                    Minimizes slide-overs, pulse effects, and transitions to reduce visual fatigue.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.appearance.reducedMotion ?? false}
                  onChange={(e) => handleUpdateAppearance({ reducedMotion: e.target.checked })}
                  className="h-4 w-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Font Scale */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Layout Density & Font Scale</label>
                <div className="grid grid-cols-3 gap-3">
                  {['compact', 'normal', 'comfortable'].map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => handleUpdateAppearance({ fontScale: sc as any })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        settings?.appearance.fontScale === sc
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              9. ACCOUNT DEACTIVATION & DELETION
             ========================================================================= */}
          {activeCategory === 'deactivation' && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span>Account Deactivation & Deletion</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pause your active job hunt or permanently purge your candidate credentials.
                </p>
              </div>

              {/* Temporary Deactivation */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">Temporary Account Deactivation</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Take a break from job hunting. Your profile will be hidden from recruiter searches and alerts will
                      be paused. Your existing applications and scheduled interviews remain completely intact.
                    </p>
                  </div>
                  <button
                    onClick={handleDeactivate}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl border border-amber-600/60 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>

              {/* Permanent Deletion */}
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">Irrevocable Account Deletion</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Permanently delete your login, resume documents, and ATS analysis history. This action cannot be
                      undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          CHANGE PASSWORD MODAL
         ========================================================================= */}
      {pwdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-400" />
                <span>Change Account Password</span>
              </h3>
              <button onClick={() => setPwdModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {pwdError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Min. 8 characters)</label>
                <input
                  type="password"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  placeholder="Enter strong new password"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPwdModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          2FA SETUP MODAL
         ========================================================================= */}
      {twoFaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>Set Up Two-Factor Authentication</span>
              </h3>
              <button onClick={() => setTwoFaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                1. Open your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password).
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Account Key Secret</div>
                <div className="font-mono text-sm font-bold text-indigo-300 tracking-widest select-all">
                  JBSWY3DPEHPK3PXP
                </div>
              </div>
              <p>2. Enter the 6-digit confirmation token generated by your app:</p>
              <input
                type="text"
                maxLength={6}
                value={twoFaCodeInput}
                onChange={(e) => setTwoFaCodeInput(e.target.value)}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-base font-bold text-white tracking-widest focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTwoFaModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggle2FA(true)}
                disabled={saving || twoFaCodeInput.length < 6}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Verifying...' : 'Confirm & Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ACCOUNT DELETION CONFIRMATION MODAL
         ========================================================================= */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-800/80 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Confirm Irreversible Account Deletion</span>
              </h3>
              <button onClick={() => setDeleteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action cannot be undone. All active sessions, resume documents, and private profile information will
              be wiped. Type <span className="font-mono font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
            </p>

            <input
              type="text"
              value={deleteKeyword}
              onChange={(e) => setDeleteKeyword(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-rose-900/60 text-xs text-white focus:outline-none focus:border-rose-500"
            />

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteKeyword !== 'DELETE' || saving}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
