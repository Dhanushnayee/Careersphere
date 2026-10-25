/**
 * CareerSphere AI — Recruiter Portal Settings & Account Preferences (Module 13)
 * Full-stack implementation supporting:
 * A. Personal Profile (Name, Title, Phone, Department, Bio, Location, Avatar, Locked Corporate Email)
 * B. Account & Security (Current password validation, PBKDF2 hashing, Password policy, Sessions & Device Revocation)
 * C. Notification Preferences (In-App & Email channels with mandatory security locks & Live Event Test Trigger)
 * D. Company & Team (Role permissions, Owner/Admin gating, Verification Status & Actionable Guidance, Team link)
 * E. Privacy & Data (Directory visibility, Candidate contact info, GDPR/CCPA Certified Export, Safe Deactivation/Deletion)
 * F. Appearance & Display (Theme, World Timezones, Date Formats, Default Landing Module, Table Density)
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Smartphone,
  Bell,
  Building,
  Eye,
  EyeOff,
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
  Sliders,
  ShieldCheck,
  Camera,
  Calendar,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import {
  RecruiterFullSettings,
  Company,
  CompanyMembership,
  RecruiterPersonalProfileSettings,
  RecruiterNotificationSettings,
  RecruiterPrivacySettings,
  RecruiterAppearanceSettings,
  RecruiterActiveSession,
} from '../../types';
import { apiClient } from '../../services/api';

export type RecruiterSettingsTab =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'company'
  | 'privacy'
  | 'appearance';

interface RecruiterSettingsWorkspaceProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  onNavigateModule?: (module: string, subPart?: string) => void;
  onLogout?: () => void;
  onCompanyUpdated?: (company: Company) => void;
}

export const RecruiterSettingsWorkspace: React.FC<RecruiterSettingsWorkspaceProps> = ({
  initialTab = 'profile',
  onTabChange,
  onNavigateModule,
  onLogout,
  onCompanyUpdated,
}) => {
  // Normalize initialTab
  const normalizedInitialTab = useMemo<RecruiterSettingsTab>(() => {
    const validTabs: RecruiterSettingsTab[] = ['profile', 'security', 'notifications', 'company', 'privacy', 'appearance'];
    if (validTabs.includes(initialTab as RecruiterSettingsTab)) {
      return initialTab as RecruiterSettingsTab;
    }
    return 'profile';
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<RecruiterSettingsTab>(normalizedInitialTab);
  const [settings, setSettings] = useState<RecruiterFullSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Sync tab with external prop
  useEffect(() => {
    if (normalizedInitialTab && normalizedInitialTab !== activeTab) {
      setActiveTab(normalizedInitialTab);
    }
  }, [normalizedInitialTab]);

  const handleSelectTab = (tab: RecruiterSettingsTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // Tab A: Personal Profile Form State
  // --------------------------------------------------------------------------
  const [profileForm, setProfileForm] = useState<RecruiterPersonalProfileSettings>({
    name: '',
    title: '',
    phone: '',
    department: '',
    location: '',
    bio: '',
    linkedinUrl: '',
    avatarUrl: '',
    workEmail: '',
    isEmailVerified: true,
  });
  const [profileFormDirty, setProfileFormDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------------------
  // Tab B: Password & Security State
  // --------------------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Session Revoke State
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [revokingAllOthers, setRevokingAllOthers] = useState(false);

  // --------------------------------------------------------------------------
  // Tab C: Notification Preferences State
  // --------------------------------------------------------------------------
  const [notificationsForm, setNotificationsForm] = useState<RecruiterNotificationSettings>({
    inAppApplications: true,
    inAppInterviews: true,
    inAppOffers: true,
    inAppJobs: true,
    inAppTeam: true,
    inAppSystem: true,
    emailNewApplications: true,
    emailInterviewReminders: true,
    emailOfferUpdates: true,
    emailWeeklyDigest: false,
    emailSecurityAlerts: true,
  });
  const [testNotificationTriggering, setTestNotificationTriggering] = useState(false);

  // --------------------------------------------------------------------------
  // Tab D: Company & Team State
  // --------------------------------------------------------------------------
  const [companyForm, setCompanyForm] = useState<{
    name: string;
    industry: string;
    headquarters: string;
    website: string;
    sizeRange: string;
    description: string;
    businessEmail: string;
    contactPhone: string;
  }>({
    name: '',
    industry: '',
    headquarters: '',
    website: '',
    sizeRange: '',
    description: '',
    businessEmail: '',
    contactPhone: '',
  });
  const [savingCompany, setSavingCompany] = useState(false);

  // --------------------------------------------------------------------------
  // Tab E: Privacy & Data State
  // --------------------------------------------------------------------------
  const [privacyForm, setPrivacyForm] = useState<RecruiterPrivacySettings>({
    profileVisibility: 'company_directory',
    showDirectEmailToCandidates: false,
    showPhoneToCandidates: false,
    analyticsTelemetryConsent: true,
    complianceDataRetentionNotice: '',
  });
  const [exportingData, setExportingData] = useState(false);

  // Deactivate & Deletion Modals
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // --------------------------------------------------------------------------
  // Tab F: Appearance State
  // --------------------------------------------------------------------------
  const [appearanceForm, setAppearanceForm] = useState<RecruiterAppearanceSettings>({
    theme: 'dark',
    timezone: 'America/Los_Angeles (PST, UTC-8)',
    dateFormat: 'MM/DD/YYYY',
    defaultLandingModule: 'dashboard',
    compactDensity: false,
  });

  // Load Settings from Backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRecruiterSettings();
      setSettings(data);

      if (data.profile) {
        setProfileForm({
          name: data.profile.name || '',
          title: data.profile.title || '',
          phone: data.profile.phone || '',
          department: data.profile.department || '',
          location: data.profile.location || '',
          bio: data.profile.bio || '',
          linkedinUrl: data.profile.linkedinUrl || '',
          avatarUrl: data.profile.avatarUrl || '',
          workEmail: data.profile.workEmail || '',
          isEmailVerified: data.profile.isEmailVerified ?? true,
        });
      }

      if (data.notifications) {
        setNotificationsForm({ ...data.notifications, inAppSystem: true, emailSecurityAlerts: true });
      }

      if (data.companyView?.company) {
        const c = data.companyView.company;
        setCompanyForm({
          name: c.name || '',
          industry: c.industry || '',
          headquarters: c.headquarters || '',
          website: c.website || '',
          sizeRange: c.sizeRange || '',
          description: c.description || '',
          businessEmail: c.businessEmail || '',
          contactPhone: c.contactPhone || '',
        });
      }

      if (data.privacy) {
        setPrivacyForm({ ...data.privacy });
      }

      if (data.appearance) {
        setAppearanceForm({ ...data.appearance });
      }
    } catch (err: any) {
      console.error('Error fetching recruiter settings:', err);
      showToast(err.message || 'Failed to load recruiter settings. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // --------------------------------------------------------------------------
  // HANDLERS: Tab A (Personal Profile)
  // --------------------------------------------------------------------------
  const handleProfileFieldChange = (field: keyof RecruiterPersonalProfileSettings, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    setProfileFormDirty(true);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      showToast('Only PNG, JPEG, WebP, or SVG images are supported.', 'error');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      showToast('Image size exceeds the 2.5MB maximum limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfileForm((prev) => ({ ...prev, avatarUrl: result }));
      setProfileFormDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      showToast('Full name must be at least 2 characters.', 'error');
      return;
    }
    if (!profileForm.title.trim() || profileForm.title.trim().length < 2) {
      showToast('Job title must be at least 2 characters.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient.updateRecruiterProfileSettings(profileForm);
      if (res.settings) {
        setSettings(res.settings);
      }
      setProfileFormDirty(false);
      showToast('Personal profile updated successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: Tab B (Account & Security)
  // --------------------------------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasUpper || !hasLower || !hasNumber) {
      setPasswordError('Password must contain uppercase, lowercase, and numeric digits.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await apiClient.changeRecruiterPassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message || 'Password changed successfully. Active sessions updated.');
      fetchSettings();
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingSessionId(sessionId);
      const res = await apiClient.revokeRecruiterSession(sessionId);
      if (settings) {
        setSettings({ ...settings, sessions: res.sessions });
      }
      showToast(res.message || 'Device session revoked.');
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke session.', 'error');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      setRevokingAllOthers(true);
      const res = await apiClient.revokeOtherRecruiterSessions();
      if (settings) {
        setSettings({ ...settings, sessions: res.sessions });
      }
      showToast(res.message || 'All other active sessions revoked.');
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke other sessions.', 'error');
    } finally {
      setRevokingAllOthers(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: Tab C (Notification Preferences)
  // --------------------------------------------------------------------------
  const handleToggleNotification = (channel: keyof RecruiterNotificationSettings) => {
    // Mandatory channels cannot be toggled off
    if (channel === 'inAppSystem' || channel === 'emailSecurityAlerts') {
      showToast('Mandatory security & governance notifications cannot be disabled.', 'error');
      return;
    }
    setNotificationsForm((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const res = await apiClient.updateRecruiterNotificationSettings(notificationsForm);
      if (res.settings) {
        setSettings(res.settings);
      }
      showToast('Notification preferences saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save notification settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestInAppNotification = async () => {
    try {
      setTestNotificationTriggering(true);
      const res = await apiClient.triggerTestRecruiterNotification('new_application');
      if (res.success) {
        showToast('Test notification dispatched. Check the Notifications Center!');
        window.dispatchEvent(new CustomEvent('careersphere:recruiter_event'));
      }
    } catch (err: any) {
      showToast(err.message || 'Could not send test event.', 'error');
    } finally {
      setTestNotificationTriggering(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: Tab D (Company & Team)
  // --------------------------------------------------------------------------
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.companyView?.isAuthorizedEditor) {
      showToast('Only company owners or administrators can edit company details.', 'error');
      return;
    }
    try {
      setSavingCompany(true);
      const updated = await apiClient.updateCompanyProfile(companyForm);
      if (updated) {
        onCompanyUpdated?.(updated);
        showToast('Company details updated successfully.');
      }
      fetchSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to update company.', 'error');
    } finally {
      setSavingCompany(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: Tab E (Privacy & Data Export / Lifecycle)
  // --------------------------------------------------------------------------
  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      const res = await apiClient.updateRecruiterPrivacySettings(privacyForm);
      if (res.settings) {
        setSettings(res.settings);
      }
      showToast('Privacy preferences updated.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save privacy settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      const data = await apiClient.exportRecruiterData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careersphere_recruiter_archive_${settings?.profile.name.replace(/\s+/g, '_') || 'data'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Recruiter data archive downloaded successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to export data archive.', 'error');
    } finally {
      setExportingData(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (deactivateConfirmText !== 'DEACTIVATE') {
      showToast('Please type DEACTIVATE to confirm.', 'error');
      return;
    }
    if (!deactivatePassword) {
      showToast('Password is required to deactivate account.', 'error');
      return;
    }
    try {
      setDeactivating(true);
      const res = await apiClient.deactivateRecruiterAccount({
        currentPassword: deactivatePassword,
        confirmKeyword: deactivateConfirmText,
      });
      showToast(res.message);
      setDeactivateModalOpen(false);
      setDeactivatePassword('');
      setDeactivateConfirmText('');
      fetchSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate account.', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm.', 'error');
      return;
    }
    if (!deletePassword) {
      showToast('Password is required to delete account.', 'error');
      return;
    }
    try {
      setDeleting(true);
      const res = await apiClient.deleteRecruiterAccount({
        currentPassword: deletePassword,
        confirmKeyword: deleteConfirmText,
      });
      showToast(res.message);
      setDeleteModalOpen(false);
      setDeletePassword('');
      setDeleteConfirmText('');
      fetchSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------------------------------
  // HANDLERS: Tab F (Appearance & Locale Preferences)
  // --------------------------------------------------------------------------
  const handleSaveAppearance = async () => {
    try {
      setSaving(true);
      const res = await apiClient.updateRecruiterAppearanceSettings(appearanceForm);
      if (res.settings) {
        setSettings(res.settings);
      }
      showToast('Appearance and workspace preferences saved.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save appearance settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Loading Skeleton
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900/60 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-64 bg-slate-900/40 rounded-2xl border border-slate-800" />
          <div className="h-96 md:col-span-3 bg-slate-900/40 rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = settings?.companyView?.isAuthorizedEditor ?? false;
  const canManageTeam = settings?.companyView?.canManageTeam ?? false;
  const company = settings?.companyView?.company;
  const membership = settings?.companyView?.membership;
  const guidance = settings?.companyView?.verificationGuidance;

  return (
    <div className="w-full space-y-6 text-left">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-600/70 shadow-emerald-950/50'
              : 'bg-rose-950/95 text-rose-200 border-rose-600/70 shadow-rose-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            {profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt={profileForm.name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-950/40"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-cyan-950/40">
                {profileForm.name
                  ? profileForm.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'RC'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              title="Upload profile photo"
            >
              <Camera className="h-3.5 w-3.5 text-cyan-400" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {profileForm.name || 'Recruiter Admin'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                {membership?.role ? membership.role.toUpperCase() : 'RECRUITER'}
              </span>
              {settings?.accountStatus === 'Active' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-700/50">
                  {settings?.accountStatus}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{profileForm.title || 'Technical Recruiter'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-medium">{company?.name || 'Synthetix Dynamics'}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-400">{profileForm.workEmail}</span>
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportData}
            disabled={exportingData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>{exportingData ? 'Generating...' : 'Export Data'}</span>
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {profileFormDirty && activeTab === 'profile' && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>You have unsaved changes in your Personal Profile.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (settings?.profile) {
                  setProfileForm({ ...settings.profile });
                  setProfileFormDirty(false);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Workspace Body: Tabs & Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs Column */}
        <div className="lg:col-span-3 space-y-2">
          <div className="p-2 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Settings Categories
            </div>

            <button
              type="button"
              onClick={() => handleSelectTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserIcon className="h-4 w-4 shrink-0 text-cyan-400" />
                <span>Personal Profile</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('security')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Account & Security</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('notifications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4 shrink-0 text-sky-400" />
                <span>Notification Preferences</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('company')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'company'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Company & Team</span>
              </div>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                company?.isVerified
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950 text-amber-300 border-amber-700/50'
              }`}>
                {company?.isVerified ? 'Verified' : 'Draft'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('privacy')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 shrink-0 text-purple-400" />
                <span>Privacy & Data</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('appearance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>Appearance & Display</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          {/* Quick Info Card */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/70 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Enterprise RBAC</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Role permissions and company data partitions are cryptographically enforced on every backend request.
            </p>
          </div>
        </div>

        {/* Content Panel Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* =========================================================================
              TAB A: PERSONAL PROFILE
             ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-cyan-400" />
                  Personal Profile & Contact
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your recruiter identity, corporate contact information, and public talent acquisition presence.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Profile Image & Avatar Customization */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {profileForm.avatarUrl ? (
                      <img
                        src={profileForm.avatarUrl}
                        alt="Avatar preview"
                        className="h-14 w-14 rounded-xl object-cover border border-cyan-500/40"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center font-bold text-sm text-cyan-300">
                        {profileForm.name ? profileForm.name[0] : 'R'}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold text-white">Profile Photo</div>
                      <div className="text-[11px] text-slate-400">PNG, JPEG, WebP, or SVG up to 2.5MB.</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                    >
                      Change Photo
                    </button>
                    {profileForm.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileForm((prev) => ({ ...prev, avatarUrl: '' }));
                          setProfileFormDirty(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Recruiting Job Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.title}
                      onChange={(e) => handleProfileFieldChange('title', e.target.value)}
                      placeholder="e.g. Head of Technical Talent Acquisition"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Corporate Work Email <span className="text-xs text-emerald-400 font-mono">(Verified Identity)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={profileForm.workEmail}
                        className="w-full pl-3.5 pr-24 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs cursor-not-allowed font-mono"
                      />
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                        <Lock className="h-3 w-3" />
                        <span>Protected</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Corporate domain locked (@{profileForm.workEmail.split('@')[1] || 'domain.com'}). Domain re-verification required for email migration.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Direct Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                      placeholder="+1 (415) 890-4321"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Department / Function
                    </label>
                    <input
                      type="text"
                      value={profileForm.department}
                      onChange={(e) => handleProfileFieldChange('department', e.target.value)}
                      placeholder="e.g. Talent Acquisition & People Operations"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Office / Primary Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => handleProfileFieldChange('location', e.target.value)}
                      placeholder="e.g. San Francisco HQ (Hybrid)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.linkedinUrl}
                    onChange={(e) => handleProfileFieldChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/recruiter-profile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Professional Recruiter Bio & Candidate Note
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                    placeholder="Briefly describe your hiring focus, team mission, and what candidates can expect during outreach."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={saving || !profileFormDirty}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                  >
                    {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              TAB B: ACCOUNT & SECURITY
             ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-amber-400" />
                    Change Account Password
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Update your recruiter login password. Current password validation and PBKDF2 hashing are enforced.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Current Password <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        New Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 chars, uppercase, number"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Confirm New Password <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                    <div className="font-semibold text-slate-300">Security Policy Requirements:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                        <span>At least 8 chars</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                        <span>Lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                        <span>Numeric digit</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                        <span>Passwords match</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={changingPassword || !currentPassword || !newPassword}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all shadow-md shadow-amber-600/20 cursor-pointer"
                    >
                      {changingPassword ? 'Updating Password...' : 'Update Password & Invalidate Other Sessions'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Sessions & Devices Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Laptop className="h-5 w-5 text-cyan-400" />
                      Active Devices & Sessions
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage active recruiter authentication sessions. Revoking a session will immediately log out that device.
                    </p>
                  </div>

                  {settings?.sessions && settings.sessions.filter((s) => !s.isCurrent).length > 0 && (
                    <button
                      type="button"
                      onClick={handleRevokeOtherSessions}
                      disabled={revokingAllOthers}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-900/50 transition-colors shrink-0"
                    >
                      {revokingAllOthers ? 'Revoking...' : 'Terminate All Other Devices'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {settings?.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                          {sess.os.toLowerCase().includes('ios') || sess.os.toLowerCase().includes('android') ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Laptop className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{sess.device}</span>
                            {sess.isCurrent ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                                This Device (Active Now)
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">ID: {sess.id}</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span>{sess.browser}</span>
                            <span>•</span>
                            <span>{sess.location}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">IP: {sess.ip}</span>
                            <span>•</span>
                            <span className="text-slate-400">{sess.lastActive}</span>
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(sess.id)}
                          disabled={revokingSessionId === sess.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-900/40 transition-colors self-end sm:self-center cursor-pointer"
                        >
                          {revokingSessionId === sess.id ? 'Revoking...' : 'Revoke Session'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB C: NOTIFICATION PREFERENCES
             ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-sky-400" />
                    Notification & Alert Preferences
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Control which recruitment alerts you receive across in-app activity feeds and email delivery.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestInAppNotification}
                  disabled={testNotificationTriggering}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/50 text-sky-300 border border-sky-700/60 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  <span>{testNotificationTriggering ? 'Dispatched...' : 'Trigger Test In-App Alert'}</span>
                </button>
              </div>

              {/* Section 1: In-App Activity Feed Alerts */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-cyan-400" />
                  <span>In-App Dashboard Alerts</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">New Candidate Applications</div>
                      <div className="text-[11px] text-slate-400">Receive alerts when candidates apply to active job requisitions.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.inAppApplications}
                      onChange={() => handleToggleNotification('inAppApplications')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Interview Schedules & Reschedule Requests</div>
                      <div className="text-[11px] text-slate-400">Alerts when rounds are confirmed, rescheduled, or feedback submitted.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.inAppInterviews}
                      onChange={() => handleToggleNotification('inAppInterviews')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Offer Letter Updates</div>
                      <div className="text-[11px] text-slate-400">Real-time alerts when candidate accepts, signs, or declines an offer.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.inAppOffers}
                      onChange={() => handleToggleNotification('inAppOffers')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Job Requisitions Lifecycle</div>
                      <div className="text-[11px] text-slate-400">Notifies on moderation approval, pause, or expiration of job postings.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.inAppJobs}
                      onChange={() => handleToggleNotification('inAppJobs')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Colleague & Team Invitations</div>
                      <div className="text-[11px] text-slate-400">Updates when new recruiters or hiring managers accept invitations.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.inAppTeam}
                      onChange={() => handleToggleNotification('inAppTeam')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Mandatory System Alerts */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-900/40 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Mandatory Security & Compliance Alerts</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                          LOCKED (ALWAYS ACTIVE)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">Critical system announcements, password resets, and audit compliance notices.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-4 w-4 rounded text-cyan-600 opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Email Notifications */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <span>Email Notification Delivery (Resend API)</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Direct Email for High ATS Applicant Fits</div>
                      <div className="text-[11px] text-slate-400">Sends instant email when candidate with match score &gt; 85% applies.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.emailNewApplications}
                      onChange={() => handleToggleNotification('emailNewApplications')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Interview Calendar Reminders</div>
                      <div className="text-[11px] text-slate-400">Sends 24h and 1h reminders prior to scheduled candidate interview rounds.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.emailInterviewReminders}
                      onChange={() => handleToggleNotification('emailInterviewReminders')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Offer Acceptance Email Alerts</div>
                      <div className="text-[11px] text-slate-400">Immediate email notifications when candidate signs employment offer.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.emailOfferUpdates}
                      onChange={() => handleToggleNotification('emailOfferUpdates')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Weekly Recruitment Analytics Digest</div>
                      <div className="text-[11px] text-slate-400">Weekly email summary of pipeline conversions, active postings, and applicant velocity.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationsForm.emailWeeklyDigest}
                      onChange={() => handleToggleNotification('emailWeeklyDigest')}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-900/40 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Mandatory Security Alerts via Email</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                          MANDATORY
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">Urgent notifications regarding suspicious logins, password modifications, or 2FA resets.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="h-4 w-4 rounded text-cyan-600 opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  {saving ? 'Saving Preferences...' : 'Save Notification Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB D: COMPANY & TEAM
             ========================================================================= */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              {/* Verification & Compliance Guidance Card */}
              <div className={`p-5 rounded-2xl border ${
                company?.isVerified
                  ? 'bg-emerald-950/30 border-emerald-800/60'
                  : 'bg-amber-950/30 border-amber-800/60'
              } space-y-3`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      company?.isVerified
                        ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/60'
                        : 'bg-amber-900/40 text-amber-400 border-amber-700/60'
                    }`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{guidance?.badgeText || 'Employer Verification Status'}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          company?.isVerified
                            ? 'bg-emerald-900/80 text-emerald-300'
                            : 'bg-amber-900/80 text-amber-300'
                        }`}>
                          {company?.verificationStatus || (company?.isVerified ? 'verified' : 'draft')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{guidance?.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateModule?.('company', 'verification')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                      company?.isVerified
                        ? 'bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-700/60'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                    }`}
                  >
                    {company?.isVerified ? 'View Compliance Certificate' : 'Submit Verification Evidence'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-300">Actionable Notice:</span>
                  <span>{guidance?.actionableNotice}</span>
                </div>
              </div>

              {/* Recruiter Membership Status Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    Your Organization Membership & Permissions
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Assigned Role</div>
                    <div className="text-sm font-bold text-white mt-1 capitalize">{membership?.role || 'Recruiter'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Company Access</div>
                    <div className="text-sm font-bold text-white mt-1">{company?.name || 'Synthetix Dynamics'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Team Governance</div>
                    <div className="text-sm font-bold text-cyan-400 mt-1">
                      {isOwnerOrAdmin ? 'Full Admin Rights' : 'Standard Recruiter'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-300 mb-2">Granted RBAC Permissions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {membership?.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-950 border border-slate-800 text-cyan-300"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Team Management Link */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {canManageTeam
                      ? 'You have permission to invite colleagues and assign hiring roles.'
                      : 'Team directory modifications require Owner or Admin permissions.'}
                  </div>
                  {canManageTeam ? (
                    <button
                      type="button"
                      onClick={() => onNavigateModule?.('team', 'members')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Manage Team Directory</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">Read-Only Access</span>
                  )}
                </div>
              </div>

              {/* Organization Profile Details Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building className="h-4 w-4 text-emerald-400" />
                      Company Details
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isOwnerOrAdmin
                        ? 'You have authorization to edit official organization attributes.'
                        : 'Read-only: Modifying company records requires Owner or Admin permissions.'}
                    </p>
                  </div>
                  {!isOwnerOrAdmin && (
                    <div className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] flex items-center gap-1.5">
                      <Lock className="h-3 w-3" />
                      <span>Editing Restricted</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveCompany} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Company Name
                      </label>
                      <input
                        type="text"
                        disabled={!isOwnerOrAdmin}
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-colors ${
                          isOwnerOrAdmin
                            ? 'bg-slate-950 border border-slate-800 text-white focus:border-cyan-500'
                            : 'bg-slate-950/70 border border-slate-800/60 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Industry Vertical
                      </label>
                      <input
                        type="text"
                        disabled={!isOwnerOrAdmin}
                        value={companyForm.industry}
                        onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-colors ${
                          isOwnerOrAdmin
                            ? 'bg-slate-950 border border-slate-800 text-white focus:border-cyan-500'
                            : 'bg-slate-950/70 border border-slate-800/60 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Headquarters Location
                      </label>
                      <input
                        type="text"
                        disabled={!isOwnerOrAdmin}
                        value={companyForm.headquarters}
                        onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-colors ${
                          isOwnerOrAdmin
                            ? 'bg-slate-950 border border-slate-800 text-white focus:border-cyan-500'
                            : 'bg-slate-950/70 border border-slate-800/60 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Official Website
                      </label>
                      <input
                        type="url"
                        disabled={!isOwnerOrAdmin}
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none transition-colors ${
                          isOwnerOrAdmin
                            ? 'bg-slate-950 border border-slate-800 text-white focus:border-cyan-500'
                            : 'bg-slate-950/70 border border-slate-800/60 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Company Overview & Mission
                    </label>
                    <textarea
                      rows={3}
                      disabled={!isOwnerOrAdmin}
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-colors ${
                        isOwnerOrAdmin
                          ? 'bg-slate-950 border border-slate-800 text-white focus:border-cyan-500'
                          : 'bg-slate-950/70 border border-slate-800/60 text-slate-400 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {isOwnerOrAdmin && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingCompany}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        {savingCompany ? 'Saving...' : 'Save Organization Profile'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB E: PRIVACY & DATA
             ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Privacy & Data Governance
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure recruiter visibility in candidate talent directories, telemetry preferences, and account retention controls.
                </p>
              </div>

              {/* Privacy Toggles */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Directory Visibility & Outreach Settings
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Profile Directory Visibility</div>
                      <div className="text-[11px] text-slate-400">Controls who can discover your recruiter profile in company directories.</div>
                    </div>
                    <select
                      value={privacyForm.profileVisibility}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, profileVisibility: e.target.value as any })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    >
                      <option value="company_directory">Company Team Directory Only</option>
                      <option value="all_candidates">All Verified Candidates</option>
                      <option value="private">Private (Only Admin Visible)</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Display Direct Email on Job Postings</div>
                      <div className="text-[11px] text-slate-400">Show your corporate email address to applied candidates.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.showDirectEmailToCandidates}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, showDirectEmailToCandidates: e.target.checked })}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Display Direct Phone to Shortlisted Candidates</div>
                      <div className="text-[11px] text-slate-400">Share your direct phone with candidates once an interview round is scheduled.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.showPhoneToCandidates}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, showPhoneToCandidates: e.target.checked })}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-white">Anonymous Usage Telemetry & Error Reporting</div>
                      <div className="text-[11px] text-slate-400">Share anonymized metrics to improve AI candidate matcher precision.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyForm.analyticsTelemetryConsent}
                      onChange={(e) => setPrivacyForm({ ...privacyForm, analyticsTelemetryConsent: e.target.checked })}
                      className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePrivacy}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Privacy Preferences'}
                  </button>
                </div>
              </div>

              {/* GDPR Compliance & Data Portability */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Download className="h-4 w-4 text-cyan-400" />
                      GDPR & CCPA Certified Recruiter Data Archive
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Export all personal data, authored job requisitions, candidate evaluations, and audit logs.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={exportingData}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 transition-colors"
                  >
                    {exportingData ? 'Generating Archive...' : 'Download JSON Archive'}
                  </button>
                </div>
              </div>

              {/* Sensitive Account Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Sensitive Account Actions
                </div>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white">Temporary Account Deactivation</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Temporarily suspend recruiter access and sign out all active sessions. Company job postings remain preserved.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeactivateModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/50 hover:bg-amber-950/80 text-amber-300 border border-amber-800/60 transition-colors shrink-0 cursor-pointer"
                    >
                      Deactivate Account
                    </button>
                  </div>

                  <div className="pt-3 border-t border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-rose-300">Permanent GDPR Erasure Request</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Permanently anonymize personal credentials. Employer audit trail and candidate evaluations are legally retained.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-700/60 transition-colors shrink-0 cursor-pointer"
                    >
                      Request Deletion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB F: APPEARANCE & PREFERENCES
             ========================================================================= */}
          {activeTab === 'appearance' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  Appearance, Localization & Workspace Preferences
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize your recruiter portal interface, global timezones, date formats, and default landing views.
                </p>
              </div>

              <div className="space-y-4">
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-2">
                    Interface Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, theme: 'dark' })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        appearanceForm.theme === 'dark'
                          ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-950/30 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Moon className="h-4 w-4 mb-2 text-cyan-400" />
                      <div className="text-xs font-bold">Dark Slate</div>
                      <div className="text-[10px] text-slate-500">Default high contrast</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, theme: 'light' })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        appearanceForm.theme === 'light'
                          ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-950/30 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Sun className="h-4 w-4 mb-2 text-amber-400" />
                      <div className="text-xs font-bold">Light Contrast</div>
                      <div className="text-[10px] text-slate-500">Soft daylight palette</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppearanceForm({ ...appearanceForm, theme: 'system' })}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        appearanceForm.theme === 'system'
                          ? 'bg-slate-950 border-cyan-500 shadow-md shadow-cyan-950/30 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Monitor className="h-4 w-4 mb-2 text-purple-400" />
                      <div className="text-xs font-bold">System Default</div>
                      <div className="text-[10px] text-slate-500">Sync with OS mode</div>
                    </button>
                  </div>
                </div>

                {/* Timezone & Date Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Recruiter Timezone (for Interview Scheduling)
                    </label>
                    <select
                      value={appearanceForm.timezone}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    >
                      <option value="America/Los_Angeles (PST, UTC-8)">America/Los_Angeles (PST, UTC-8)</option>
                      <option value="America/Denver (MST, UTC-7)">America/Denver (MST, UTC-7)</option>
                      <option value="America/Chicago (CST, UTC-6)">America/Chicago (CST, UTC-6)</option>
                      <option value="America/New_York (EST, UTC-5)">America/New_York (EST, UTC-5)</option>
                      <option value="Europe/London (GMT/BST, UTC+0)">Europe/London (GMT/BST, UTC+0)</option>
                      <option value="Europe/Berlin (CET, UTC+1)">Europe/Berlin (CET, UTC+1)</option>
                      <option value="Asia/Singapore (SGT, UTC+8)">Asia/Singapore (SGT, UTC+8)</option>
                      <option value="Asia/Tokyo (JST, UTC+9)">Asia/Tokyo (JST, UTC+9)</option>
                      <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Standard Date Display Format
                    </label>
                    <select
                      value={appearanceForm.dateFormat}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, dateFormat: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/24/2026)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/10/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    </select>
                  </div>
                </div>

                {/* Default Landing Module & Table Density */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Default Landing View upon Login
                    </label>
                    <select
                      value={appearanceForm.defaultLandingModule}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, defaultLandingModule: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    >
                      <option value="dashboard">1. Command Dashboard</option>
                      <option value="jobs">3. My Jobs & Requisitions</option>
                      <option value="applicants">4. Applicants Pipeline Kanban</option>
                      <option value="matcher">5. AI Candidate Matcher</option>
                      <option value="interviews">6. Interview Calendar</option>
                      <option value="notifications">9. Notifications Center</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white">Compact Table Density</div>
                        <div className="text-[11px] text-slate-400">High-density rows for managing large candidate pipelines.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearanceForm.compactDensity}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, compactDensity: e.target.checked })}
                        className="h-4 w-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAppearance}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Workspace Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: ACCOUNT DEACTIVATION
         ========================================================================= */}
      {deactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-amber-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Confirm Account Deactivation</span>
              </div>
              <button
                type="button"
                onClick={() => setDeactivateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Deactivating your recruiter account will revoke your session credentials and pause active outbound candidate messaging. Your company’s job postings and team memberships remain preserved.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Type <span className="font-mono text-amber-400">DEACTIVATE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deactivateConfirmText}
                  onChange={(e) => setDeactivateConfirmText(e.target.value)}
                  placeholder="DEACTIVATE"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Enter Account Password:
                </label>
                <input
                  type="password"
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeactivateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivateAccount}
                disabled={deactivating || deactivateConfirmText !== 'DEACTIVATE' || !deactivatePassword}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white transition-colors"
              >
                {deactivating ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PERMANENT DELETION
         ========================================================================= */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Trash2 className="h-4 w-4" />
                <span>Permanent Erasure Request (GDPR)</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-200 leading-relaxed">
              <strong>Compliance Retention Standard:</strong> Under employment law and EEOC recordkeeping obligations, job listings created and candidate interview notes you submitted cannot be deleted from company records. Your personal profile and credentials will be anonymized.
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Type <span className="font-mono text-rose-400">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Enter Account Password:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE' || !deletePassword}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-colors"
              >
                {deleting ? 'Scheduling Erasure...' : 'Permanently Schedule Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
