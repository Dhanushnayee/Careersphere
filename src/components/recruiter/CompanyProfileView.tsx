import React, { useState, useEffect } from 'react';
import { Company, CompanyMembership } from '../../types';
import { apiClient } from '../../services/api';
import {
  Building,
  Globe,
  Mail,
  MapPin,
  Users,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ExternalLink,
  Phone,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';

interface CompanyProfileViewProps {
  initialCompany: Company | null;
  onCompanyUpdated: (comp: Company) => void;
  onNavigateToVerification?: () => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  initialCompany,
  onCompanyUpdated,
  onNavigateToVerification,
}) => {
  const [company, setCompany] = useState<Company | null>(initialCompany);
  const [membership, setMembership] = useState<CompanyMembership | null>(null);
  const [isAuthorizedEditor, setIsAuthorizedEditor] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // Form State
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [sizeRange, setSizeRange] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [description, setDescription] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [workCulture, setWorkCulture] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiClient.getCompanyProfile();
        setCompany(data.company);
        if (data.membership) setMembership(data.membership);
        setIsAuthorizedEditor(data.isAuthorizedEditor);

        const c = data.company;
        setName(c.name || '');
        setWebsite(c.website || '');
        setIndustry(c.industry || '');
        setSizeRange(c.sizeRange || '50-200 employees');
        setHeadquarters(c.headquarters || '');
        setDescription(c.description || '');
        setBusinessEmail(c.businessEmail || '');
        setWorkCulture(c.workCulture || '');
        setContactPhone(c.contactPhone || '');
        setLinkedinUrl(c.linkedinUrl || '');
        setTwitterUrl(c.twitterUrl || '');
        setBenefits(c.benefits || []);
        if (c.logoUrl) setLogoPreview(c.logoUrl);
      } catch (err) {
        console.warn('Failed to load company profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorNotice(null);
    setSuccessNotice(null);

    // Whitelist check on client before sending
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      setErrorNotice('Invalid file format. Only PNG, JPEG, WebP, and SVG images are allowed.');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorNotice('Image size exceeds 2.5MB limit.');
      return;
    }

    setUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      try {
        const res = await apiClient.uploadCompanyLogo(base64, file.type);
        setSuccessNotice('Company brand logo uploaded safely and verified.');
        if (company) {
          const updated = { ...company, logoUrl: res.logoUrl };
          setCompany(updated);
          onCompanyUpdated(updated);
        }
      } catch (err: any) {
        setErrorNotice(err?.message || 'Failed to upload logo.');
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.onerror = () => {
      setErrorNotice('Failed to read file.');
      setUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setBenefits((prev) => [...prev, newBenefitInput.trim()]);
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedEditor) {
      setErrorNotice('You do not have administrative permissions to modify company profile details.');
      return;
    }

    setSaving(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const updated = await apiClient.updateCompanyProfile({
        name: name.trim(),
        website: website.trim(),
        industry: industry.trim(),
        sizeRange,
        headquarters: headquarters.trim(),
        description: description.trim(),
        businessEmail: businessEmail.trim(),
        workCulture: workCulture.trim(),
        benefits,
        contactPhone: contactPhone.trim(),
        linkedinUrl: linkedinUrl.trim(),
        twitterUrl: twitterUrl.trim(),
      });

      setCompany(updated);
      onCompanyUpdated(updated);
      setSuccessNotice('Company profile successfully updated and synchronized.');
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  const isVerified = company?.isVerified && company?.verificationStatus === 'verified';

  return (
    <div className="space-y-6 text-slate-100 text-left">
      
      {/* Header with Edit / Preview Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Employer Brand & Organization Governance
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {company?.name || 'Company Profile'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your public employer identity, work culture, perks, and official business details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Public Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isVerified
          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
          : company?.verificationStatus === 'pending_review'
          ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
          : 'bg-indigo-950/30 border-indigo-800/40 text-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
            isVerified ? 'bg-emerald-900/40 text-emerald-400' : 'bg-cyan-900/40 text-cyan-400'
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Status:</span>
              <span className={`capitalize font-mono px-2 py-0.5 rounded text-[11px] ${
                isVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {company?.verificationStatus || (company?.isVerified ? 'verified' : 'draft')}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {isVerified
                ? 'Your organization is Enterprise Verified. Active job posting and AI candidate matching are fully authorized.'
                : 'Compliance verification required to unlock public candidate applications and verified badges.'}
            </div>
          </div>
        </div>

        {!isVerified && onNavigateToVerification && (
          <button
            onClick={onNavigateToVerification}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all shrink-0 cursor-pointer shadow-sm shadow-cyan-600/30"
          >
            Review Verification Status
          </button>
        )}
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-3.5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Permission Warning if not editor */}
      {!isAuthorizedEditor && (
        <div className="p-3.5 rounded-xl border border-amber-900/50 bg-amber-950/20 text-xs text-amber-300 flex items-center gap-2.5">
          <Lock className="h-4 w-4 shrink-0 text-amber-400" />
          <span>You have Read-Only view of this company profile. Profile modifications require Company Owner or Administrator role.</span>
        </div>
      )}

      {/* VIEW MODE: EDIT */}
      {viewMode === 'edit' ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Brand Logo Upload Box */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Brand Logo & Visual Identity
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-24 w-24 rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-xl font-bold text-slate-500 font-mono">
                    {name ? name.substring(0, 2).toUpperCase() : 'CO'}
                  </div>
                )}
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <div className="text-xs font-semibold text-white">Upload High-Resolution Logo</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Allowed formats: PNG, JPEG, WebP, SVG (Max 2.5 MB). Validated securely on backend against executable code.
                </p>

                {isAuthorizedEditor && (
                  <div className="pt-1 flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors cursor-pointer border border-slate-700">
                      <Upload className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{uploadingLogo ? 'Verifying & Uploading...' : 'Select File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        disabled={uploadingLogo}
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Primary Business Info */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Primary Business Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Legal Name *</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    disabled={!isAuthorizedEditor}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Website *</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="url"
                    required
                    disabled={!isAuthorizedEditor}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.ai"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Industry Sector</label>
                <input
                  type="text"
                  disabled={!isAuthorizedEditor}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Generative AI & Autonomous Cloud"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Size</label>
                <select
                  disabled={!isAuthorizedEditor}
                  value={sizeRange}
                  onChange={(e) => setSizeRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                >
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-200 employees">51-200 employees</option>
                  <option value="201-500 employees">201-500 employees</option>
                  <option value="500-1000 employees">500-1000 employees</option>
                  <option value="1000-5000 employees">1000-5000 employees</option>
                  <option value="5000+ employees">5000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Headquarters Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    disabled={!isAuthorizedEditor}
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Business & Careers Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    disabled={!isAuthorizedEditor}
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="careers@company.ai"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Overview & Mission</label>
              <textarea
                rows={3}
                disabled={!isAuthorizedEditor}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pioneering frontier multi-agent collaboration workflows..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Culture & Benefits */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Work Culture & Employee Benefits
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Engineering & Team Culture</label>
              <textarea
                rows={2}
                disabled={!isAuthorizedEditor}
                value={workCulture}
                onChange={(e) => setWorkCulture(e.target.value)}
                placeholder="Autonomous squads, deep research focus, open source contribution Fridays..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Perks & Benefits</label>
              <div className="space-y-2 mb-3">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <span>{b}</span>
                    {isAuthorizedEditor && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isAuthorizedEditor && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    placeholder="e.g. $5,000 Annual Learning Budget, 100% Medical Coverage"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Public Contact & Socials */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Public Contact & Profiles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    disabled={!isAuthorizedEditor}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (415) 890-4321"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  disabled={!isAuthorizedEditor}
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/company/synthetix"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">X / Twitter URL</label>
                <input
                  type="url"
                  disabled={!isAuthorizedEditor}
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/synthetix"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {isAuthorizedEditor && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-600/30"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      ) : (
        /* VIEW MODE: PUBLIC PREVIEW */
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-800">
            <div className="h-20 w-20 rounded-2xl border border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {logoPreview ? (
                <img src={logoPreview} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-cyan-400 font-mono">{name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{name || 'Your Company Name'}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified Employer</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Building className="h-3.5 w-3.5" />
                  <span>{industry || 'Technology'}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{headquarters || 'Remote'}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>{sizeRange}</span>
                </span>
              </div>
            </div>

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
              >
                <span>Visit Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About the Company</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
              {description || 'No description provided yet.'}
            </p>
          </div>

          {workCulture && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Work Culture & Squad Dynamics</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {workCulture}
              </p>
            </div>
          )}

          {benefits.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Employee Benefits & Perks</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
