/**
 * CareerSphere AI — Comprehensive Candidate Profile CRUD Application
 * Complete CRUD Engine for Candidate Data & Auto-Apply Vault:
 * - Personal Details, Identity & Professional Social Profiles
 * - Skills Inventory (Create, Read, Update proficiency, Delete)
 * - Work Experience (Create, Read, Inline Edit, Delete)
 * - Education (Create, Read, Inline Edit, Delete)
 * - Projects & Portfolio (Create, Read, Edit, Delete)
 * - Certifications (Create, Read, Edit, Delete)
 * - Auto-Apply Pre-fill Vault (Work authorization, visa status, notice period, target portals)
 */
import React, { useState, useEffect } from 'react';
import { CandidateProfile, EducationItem, ExperienceItem, ProjectItem, SkillItem, User as UserAccount } from '../../types';
import { apiClient } from '../../services/api';
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Clock,
  ExternalLink,
  Award,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Globe,
  Github,
  Linkedin,
  Edit2,
  X,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface CandidateProfileEditorProps {
  profile: CandidateProfile;
  currentUser?: UserAccount | null;
  onUpdateProfile: (updated: Partial<CandidateProfile>) => void;
  onUpdateUser?: (updated: Partial<UserAccount>) => void;
  initialSection?: string;
  onSectionChange?: (sec: string) => void;
}

export const CandidateProfileEditor: React.FC<CandidateProfileEditorProps> = ({
  profile,
  currentUser,
  onUpdateProfile,
  onUpdateUser,
  initialSection = 'personal',
  onSectionChange,
}) => {
  const [activeSection, setActiveSection] = useState<
    'personal' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications' | 'autoapply'
  >((initialSection as any) || 'personal');

  useEffect(() => {
    if (initialSection && ['personal', 'skills', 'experience', 'education', 'projects', 'certifications', 'autoapply'].includes(initialSection)) {
      setActiveSection(initialSection as any);
    }
  }, [initialSection]);

  // Identity & Contact
  const [name, setName] = useState(currentUser?.name || profile.headline?.split('·')[0]?.trim() || 'Alex Chen');
  const [email, setEmail] = useState(currentUser?.email || 'candidate@careersphere.ai');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [targetRole, setTargetRole] = useState(profile.targetRole || '');
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears?.toString() || '6');
  const [desiredSalaryMin, setDesiredSalaryMin] = useState(profile.desiredSalaryMin?.toString() || '165000');
  const [workplacePreference, setWorkplacePreference] = useState<'Remote' | 'Hybrid' | 'On-site'>(
    profile.workplacePreference || 'Remote'
  );
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl || 'https://alexchen.dev');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || 'https://github.com/alexchen');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || 'https://linkedin.com/in/alexchen-eng');

  // Collections State
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [structuredSkills, setStructuredSkills] = useState<SkillItem[]>(
    profile.structuredSkills || [
      { id: 'sk_01', name: 'Python', category: 'Language', proficiency: 'Expert', yearsExperience: 6 },
      { id: 'sk_02', name: 'Django REST Framework', category: 'Framework', proficiency: 'Expert', yearsExperience: 5 },
      { id: 'sk_03', name: 'FastAPI', category: 'Framework', proficiency: 'Advanced', yearsExperience: 4 },
      { id: 'sk_04', name: 'TypeScript', category: 'Language', proficiency: 'Advanced', yearsExperience: 4 },
      { id: 'sk_05', name: 'React 19', category: 'Framework', proficiency: 'Advanced', yearsExperience: 4 },
      { id: 'sk_06', name: 'PostgreSQL', category: 'Database', proficiency: 'Expert', yearsExperience: 5 },
      { id: 'sk_07', name: 'Redis', category: 'Database', proficiency: 'Advanced', yearsExperience: 4 },
      { id: 'sk_08', name: 'Celery', category: 'Tools & Architecture', proficiency: 'Expert', yearsExperience: 5 },
      { id: 'sk_09', name: 'Docker', category: 'Cloud & DevOps', proficiency: 'Advanced', yearsExperience: 5 },
      { id: 'sk_10', name: 'Kubernetes', category: 'Cloud & DevOps', proficiency: 'Intermediate', yearsExperience: 3 },
      { id: 'sk_11', name: 'Vector Databases', category: 'AI & ML', proficiency: 'Advanced', yearsExperience: 3 },
      { id: 'sk_12', name: 'PyTorch', category: 'AI & ML', proficiency: 'Intermediate', yearsExperience: 2 },
    ]
  );
  const [experience, setExperience] = useState<ExperienceItem[]>(profile.experience || []);
  const [education, setEducation] = useState<EducationItem[]>(profile.education || []);
  const [projects, setProjects] = useState<ProjectItem[]>(profile.projects || []);
  const [certifications, setCertifications] = useState<string[]>(profile.certifications || []);

  // Auto-Apply Pre-fill Vault
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(profile.autoApplySettings?.enabled ?? true);
  const [minMatchScore, setMinMatchScore] = useState(profile.autoApplySettings?.minMatchScore || 75);
  const [dailyLimit, setDailyLimit] = useState(profile.autoApplySettings?.dailyApplicationLimit || 15);
  const [workAuthorization, setWorkAuthorization] = useState(
    profile.autoApplySettings?.workAuthorization || 'Authorized to work in country of residence without sponsorship'
  );
  const [requiresVisaSponsorship, setRequiresVisaSponsorship] = useState(
    profile.autoApplySettings?.requiresVisaSponsorship ?? false
  );
  const [noticePeriod, setNoticePeriod] = useState(profile.autoApplySettings?.noticePeriod || '2 Weeks');
  const [customCoverNote, setCustomCoverNote] = useState(
    profile.autoApplySettings?.customCoverNote ||
      'I am excited about this opportunity. With hands-on experience scaling production backends, modern web frameworks, and AI workflows, I look forward to contributing immediately.'
  );
  const [targetPortals, setTargetPortals] = useState<string[]>(
    profile.autoApplySettings?.targetPortals || [
      'LinkedIn',
      'Indeed',
      'Glassdoor',
      'RemoteOK',
      'Wellfound',
      'Greenhouse',
      'Lever',
    ]
  );

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modals & Drafts for Creating & Editing
  // Skill Add / Edit
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [skillDraftName, setSkillDraftName] = useState('');
  const [skillDraftCategory, setSkillDraftCategory] = useState<SkillItem['category']>('Language');
  const [skillDraftProficiency, setSkillDraftProficiency] = useState<SkillItem['proficiency']>('Advanced');
  const [skillDraftYears, setSkillDraftYears] = useState('3');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Experience Add / Edit
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expDraftCompany, setExpDraftCompany] = useState('');
  const [expDraftPosition, setExpDraftPosition] = useState('');
  const [expDraftStartDate, setExpDraftStartDate] = useState('');
  const [expDraftEndDate, setExpDraftEndDate] = useState('Present');
  const [expDraftIsCurrent, setExpDraftIsCurrent] = useState(true);
  const [expDraftDesc, setExpDraftDesc] = useState('');
  const [expDraftBullet, setExpDraftBullet] = useState('');

  // Education Add / Edit
  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduDraftInstitution, setEduDraftInstitution] = useState('');
  const [eduDraftDegree, setEduDraftDegree] = useState('');
  const [eduDraftField, setEduDraftField] = useState('');
  const [eduDraftYear, setEduDraftYear] = useState('2024');
  const [eduDraftGpa, setEduDraftGpa] = useState('3.8');

  // Projects Add / Edit
  const [showProjModal, setShowProjModal] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projDraftTitle, setProjDraftTitle] = useState('');
  const [projDraftDesc, setProjDraftDesc] = useState('');
  const [projDraftLink, setProjDraftLink] = useState('');
  const [projDraftTech, setProjDraftTech] = useState('');

  // Certifications Add / Edit
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
  const [certDraftName, setCertDraftName] = useState('');

  // Sync state if external profile updates
  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setTargetRole(profile.targetRole || '');
      setExperienceYears(profile.experienceYears?.toString() || '6');
      setDesiredSalaryMin(profile.desiredSalaryMin?.toString() || '165000');
      setWorkplacePreference(profile.workplacePreference || 'Remote');
      if (profile.skills) setSkills(profile.skills);
      if (profile.structuredSkills && profile.structuredSkills.length > 0) {
        setStructuredSkills(profile.structuredSkills);
      }
      if (profile.experience) setExperience(profile.experience);
      if (profile.education) setEducation(profile.education);
      if (profile.projects) setProjects(profile.projects);
      if (profile.certifications) setCertifications(profile.certifications);
      if (profile.portfolioUrl) setPortfolioUrl(profile.portfolioUrl);
      if (profile.githubUrl) setGithubUrl(profile.githubUrl);
      if (profile.linkedinUrl) setLinkedinUrl(profile.linkedinUrl);
      if (profile.autoApplySettings) {
        setAutoApplyEnabled(profile.autoApplySettings.enabled);
        setMinMatchScore(profile.autoApplySettings.minMatchScore);
        setDailyLimit(profile.autoApplySettings.dailyApplicationLimit);
        setWorkAuthorization(profile.autoApplySettings.workAuthorization);
        setRequiresVisaSponsorship(profile.autoApplySettings.requiresVisaSponsorship);
        setNoticePeriod(profile.autoApplySettings.noticePeriod);
        setCustomCoverNote(profile.autoApplySettings.customCoverNote || '');
        setTargetPortals(profile.autoApplySettings.targetPortals);
      }
    }
  }, [profile]);

  // Dynamic Profile Readiness Calculation
  const calculateReadiness = () => {
    let score = 0;
    if (name.trim().length > 2) score += 10;
    if (headline.trim().length > 5) score += 10;
    if (bio.trim().length > 20) score += 15;
    if (phone.trim().length > 5 && location.trim().length > 3) score += 10;
    if (skills.length >= 5) score += 20;
    else if (skills.length >= 1) score += 10;
    if (experience.length >= 1) score += 15;
    if (education.length >= 1) score += 10;
    if (projects.length >= 1) score += 10;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadiness();

  // Save full profile and auto-apply vault to backend
  const handleSaveAll = async () => {
    setSaving(true);
    const updatedPayload: Partial<CandidateProfile> & { name?: string } = {
      name,
      headline,
      phone,
      location,
      bio,
      targetRole,
      experienceYears: Number(experienceYears) || 0,
      desiredSalaryMin: Number(desiredSalaryMin) || 0,
      workplacePreference,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      skills,
      structuredSkills,
      experience,
      education,
      projects,
      certifications,
      autoApplySettings: {
        enabled: autoApplyEnabled,
        minMatchScore,
        dailyApplicationLimit: dailyLimit,
        workAuthorization,
        requiresVisaSponsorship,
        noticePeriod,
        preferredLocations: [location || 'Remote'],
        targetPortals,
        customCoverNote,
        autoTailorEnabled: true,
      },
    };

    try {
      const saved = await apiClient.updateCandidateProfile(updatedPayload);
      onUpdateProfile(saved);
      if (onUpdateUser && currentUser) {
        onUpdateUser({ name });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save candidate profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // SKILLS CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddSkill = () => {
    setEditingSkillId(null);
    setSkillDraftName('');
    setSkillDraftCategory('Language');
    setSkillDraftProficiency('Advanced');
    setSkillDraftYears('3');
    setShowAddSkillModal(true);
  };

  const handleOpenEditSkill = (item: SkillItem) => {
    setEditingSkillId(item.id);
    setSkillDraftName(item.name);
    setSkillDraftCategory(item.category);
    setSkillDraftProficiency(item.proficiency);
    setSkillDraftYears(item.yearsExperience?.toString() || '3');
    setShowAddSkillModal(true);
  };

  const handleSaveSkill = () => {
    if (!skillDraftName.trim()) return;
    const trimmed = skillDraftName.trim();

    if (editingSkillId) {
      // Update
      const updated = structuredSkills.map((s) =>
        s.id === editingSkillId
          ? {
              ...s,
              name: trimmed,
              category: skillDraftCategory,
              proficiency: skillDraftProficiency,
              yearsExperience: Number(skillDraftYears) || 3,
            }
          : s
      );
      setStructuredSkills(updated);
      setSkills(Array.from(new Set(updated.map((s) => s.name))));
    } else {
      // Create
      const newSkill: SkillItem = {
        id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        category: skillDraftCategory,
        proficiency: skillDraftProficiency,
        yearsExperience: Number(skillDraftYears) || 3,
      };
      const updated = [...structuredSkills, newSkill];
      setStructuredSkills(updated);
      if (!skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
    }
    setShowAddSkillModal(false);
  };

  const handleDeleteSkill = (skillId: string, skillName: string) => {
    setStructuredSkills((prev) => prev.filter((s) => s.id !== skillId));
    setSkills((prev) => prev.filter((s) => s.toLowerCase() !== skillName.toLowerCase()));
  };

  // --------------------------------------------------------------------------
  // EXPERIENCE CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddExp = () => {
    setEditingExpId(null);
    setExpDraftCompany('');
    setExpDraftPosition('');
    setExpDraftStartDate('');
    setExpDraftEndDate('Present');
    setExpDraftIsCurrent(true);
    setExpDraftDesc('');
    setExpDraftBullet('');
    setShowExpModal(true);
  };

  const handleOpenEditExp = (exp: ExperienceItem) => {
    setEditingExpId(exp.id);
    setExpDraftCompany(exp.company);
    setExpDraftPosition(exp.position);
    setExpDraftStartDate(exp.startDate);
    setExpDraftEndDate(exp.endDate);
    setExpDraftIsCurrent(exp.isCurrent);
    setExpDraftDesc(exp.description);
    setExpDraftBullet(exp.bullets?.[0] || '');
    setShowExpModal(true);
  };

  const handleSaveExp = () => {
    if (!expDraftCompany.trim() || !expDraftPosition.trim()) return;

    if (editingExpId) {
      // Update
      setExperience((prev) =>
        prev.map((item) =>
          item.id === editingExpId
            ? {
                ...item,
                company: expDraftCompany.trim(),
                position: expDraftPosition.trim(),
                startDate: expDraftStartDate.trim() || '2023-01',
                endDate: expDraftEndDate.trim() || 'Present',
                isCurrent: expDraftIsCurrent,
                description: expDraftDesc.trim(),
                bullets: expDraftBullet.trim() ? [expDraftBullet.trim()] : item.bullets,
              }
            : item
        )
      );
    } else {
      // Create
      const newExp: ExperienceItem = {
        id: `exp_${Date.now()}`,
        company: expDraftCompany.trim(),
        position: expDraftPosition.trim(),
        startDate: expDraftStartDate.trim() || '2023-01',
        endDate: expDraftEndDate.trim() || 'Present',
        isCurrent: expDraftIsCurrent,
        description: expDraftDesc.trim() || `${expDraftPosition} at ${expDraftCompany}`,
        bullets: expDraftBullet.trim() ? [expDraftBullet.trim()] : [],
      };
      setExperience([newExp, ...experience]);
    }
    setShowExpModal(false);
  };

  const handleDeleteExp = (expId: string) => {
    setExperience((prev) => prev.filter((e) => e.id !== expId));
  };

  // --------------------------------------------------------------------------
  // EDUCATION CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddEdu = () => {
    setEditingEduId(null);
    setEduDraftInstitution('');
    setEduDraftDegree('');
    setEduDraftField('');
    setEduDraftYear('2024');
    setEduDraftGpa('3.8');
    setShowEduModal(true);
  };

  const handleOpenEditEdu = (edu: EducationItem) => {
    setEditingEduId(edu.id);
    setEduDraftInstitution(edu.institution);
    setEduDraftDegree(edu.degree);
    setEduDraftField(edu.fieldOfStudy);
    setEduDraftYear(edu.graduationYear);
    setEduDraftGpa(edu.gpa || '');
    setShowEduModal(true);
  };

  const handleSaveEdu = () => {
    if (!eduDraftInstitution.trim() || !eduDraftDegree.trim()) return;

    if (editingEduId) {
      setEducation((prev) =>
        prev.map((item) =>
          item.id === editingEduId
            ? {
                ...item,
                institution: eduDraftInstitution.trim(),
                degree: eduDraftDegree.trim(),
                fieldOfStudy: eduDraftField.trim() || 'Computer Science',
                graduationYear: eduDraftYear.trim() || '2024',
                gpa: eduDraftGpa.trim(),
              }
            : item
        )
      );
    } else {
      const newEdu: EducationItem = {
        id: `edu_${Date.now()}`,
        institution: eduDraftInstitution.trim(),
        degree: eduDraftDegree.trim(),
        fieldOfStudy: eduDraftField.trim() || 'Computer Science',
        graduationYear: eduDraftYear.trim() || '2024',
        gpa: eduDraftGpa.trim(),
      };
      setEducation([newEdu, ...education]);
    }
    setShowEduModal(false);
  };

  const handleDeleteEdu = (eduId: string) => {
    setEducation((prev) => prev.filter((e) => e.id !== eduId));
  };

  // --------------------------------------------------------------------------
  // PROJECTS CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddProj = () => {
    setEditingProjId(null);
    setProjDraftTitle('');
    setProjDraftDesc('');
    setProjDraftLink('');
    setProjDraftTech('');
    setShowProjModal(true);
  };

  const handleOpenEditProj = (proj: ProjectItem) => {
    setEditingProjId(proj.id);
    setProjDraftTitle(proj.title);
    setProjDraftDesc(proj.description);
    setProjDraftLink(proj.link || '');
    setProjDraftTech(proj.technologies?.join(', ') || '');
    setShowProjModal(true);
  };

  const handleSaveProj = () => {
    if (!projDraftTitle.trim()) return;
    const techs = projDraftTech
      ? projDraftTech
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : ['Python', 'FastAPI'];

    if (editingProjId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjId
            ? {
                ...p,
                title: projDraftTitle.trim(),
                description: projDraftDesc.trim(),
                link: projDraftLink.trim() || undefined,
                technologies: techs,
              }
            : p
        )
      );
    } else {
      const newProj: ProjectItem = {
        id: `proj_${Date.now()}`,
        title: projDraftTitle.trim(),
        description: projDraftDesc.trim() || 'Production systems project.',
        link: projDraftLink.trim() || undefined,
        technologies: techs,
      };
      setProjects([newProj, ...projects]);
    }
    setShowProjModal(false);
  };

  const handleDeleteProj = (projId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projId));
  };

  // --------------------------------------------------------------------------
  // CERTIFICATIONS CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddCert = () => {
    setEditingCertIndex(null);
    setCertDraftName('');
    setShowCertModal(true);
  };

  const handleOpenEditCert = (index: number, certName: string) => {
    setEditingCertIndex(index);
    setCertDraftName(certName);
    setShowCertModal(true);
  };

  const handleSaveCert = () => {
    if (!certDraftName.trim()) return;
    const trimmed = certDraftName.trim();
    if (editingCertIndex !== null) {
      setCertifications((prev) => prev.map((c, idx) => (idx === editingCertIndex ? trimmed : c)));
    } else {
      if (!certifications.includes(trimmed)) {
        setCertifications([...certifications, trimmed]);
      }
    }
    setShowCertModal(false);
  };

  const handleDeleteCert = (certName: string) => {
    setCertifications((prev) => prev.filter((c) => c !== certName));
  };

  // Toggle portal for auto apply
  const togglePortal = (portalName: string) => {
    setTargetPortals((prev) =>
      prev.includes(portalName) ? prev.filter((p) => p !== portalName) : [...prev, portalName]
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header with Readiness Meter */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Candidate Profile & Automation Vault
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Candidate Profile Management (Full CRUD)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Create, update, and manage all your candidate details. Stored data directly fuels job recommendations, the AI Resume Copilot, and the n8n autonomous multi-apply engine.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5 w-52">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Profile Readiness</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">{readinessScore}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {readinessScore >= 90 ? 'Optimized for 1-Click Auto-Apply' : 'Complete details to maximize match rate'}
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">
            Candidate profile & Auto-Apply Vault successfully updated and synced to database!
          </span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => { setActiveSection('personal'); onSectionChange?.('personal'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'personal' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Personal Details & Identity</span>
        </button>
        <button
          onClick={() => { setActiveSection('skills'); onSectionChange?.('skills'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'skills' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Skills Inventory ({structuredSkills.length})</span>
        </button>
        <button
          onClick={() => { setActiveSection('experience'); onSectionChange?.('experience'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'experience' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Work Experience ({experience.length})</span>
        </button>
        <button
          onClick={() => { setActiveSection('education'); onSectionChange?.('education'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'education' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Education ({education.length})</span>
        </button>
        <button
          onClick={() => { setActiveSection('projects'); onSectionChange?.('projects'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'projects' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Projects & Portfolio ({projects.length})</span>
        </button>
        <button
          onClick={() => { setActiveSection('certifications'); onSectionChange?.('certifications'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'certifications' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Certifications ({certifications.length})</span>
        </button>
        <button
          onClick={() => { setActiveSection('autoapply'); onSectionChange?.('autoapply'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'autoapply' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          <span>Auto-Apply Vault</span>
        </button>
      </div>

      {/* =========================================================================
          SECTION 1: PERSONAL & PREFERENCES (CRUD)
         ========================================================================= */}
      {activeSection === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Personal Identity & Bio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Full Candidate Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Primary Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@careersphere.ai"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Professional Headline *</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full-Stack & Python AI Systems Architect"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Primary Role *</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Python & AI Systems Architect"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-medium text-indigo-300"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                The recommendation engine uses this to strictly match Python roles and filter out unwanted domains (like Java).
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Professional Bio & Career Summary</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your background, core tech stack, and achievements..."
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>Location, Compensation & Links</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Years of Experience</label>
                <input
                  type="number"
                  step="0.5"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Current Location & Mobility</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA (Remote Eligible)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Desired Minimum Salary (USD)</label>
                <input
                  type="number"
                  value={desiredSalaryMin}
                  onChange={(e) => setDesiredSalaryMin(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Workplace Preference</label>
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

            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="font-semibold text-slate-300">Social Profiles & Portfolio Links:</div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  placeholder="Portfolio: https://alexchen.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  placeholder="GitHub: https://github.com/alexchen"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  placeholder="LinkedIn: https://linkedin.com/in/alexchen"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: SKILLS CRUD
         ========================================================================= */}
      {activeSection === 'skills' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Candidate Skills Inventory</h3>
              <p className="text-xs text-slate-400">
                Create, update, and manage your technical skills. Jobs are recommended based on these exact skills!
              </p>
            </div>
            <button
              onClick={handleOpenAddSkill}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {structuredSkills.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        item.proficiency === 'Expert'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : item.proficiency === 'Advanced'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.proficiency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.category} · {item.yearsExperience || 3} yrs exp
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditSkill(item)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Skill"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(item.id, item.name)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Skill"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: WORK EXPERIENCE CRUD
         ========================================================================= */}
      {activeSection === 'experience' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Work History & Professional Positions</h3>
              <p className="text-xs text-slate-400">
                Full CRUD support: add new positions, edit existing records in-place, or delete outdated entries.
              </p>
            </div>
            <button
              onClick={handleOpenAddExp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-3">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{exp.position}</h4>
                    <div className="text-xs text-indigo-400 font-medium">
                      {exp.company} ·{' '}
                      <span className="text-slate-400 font-mono text-[11px]">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditExp(exp)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Position"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExp(exp.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Position"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{exp.description}</p>

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pt-1">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: EDUCATION CRUD
         ========================================================================= */}
      {activeSection === 'education' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Education & Academic Degrees</h3>
              <p className="text-xs text-slate-400">
                Manage your universities, degrees, and graduation milestones.
              </p>
            </div>
            <button
              onClick={handleOpenAddEdu}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{edu.degree}</h4>
                  <div className="text-xs text-indigo-400">{edu.institution}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Field: {edu.fieldOfStudy} · Class of {edu.graduationYear}
                    {edu.gpa && <span> · GPA: {edu.gpa}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditEdu(edu)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Education"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEdu(edu.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Education"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: PROJECTS CRUD
         ========================================================================= */}
      {activeSection === 'projects' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Highlighted Projects & Codebases</h3>
              <p className="text-xs text-slate-400">
                Showcase applications, systems, and open source repositories.
              </p>
            </div>
            <button
              onClick={handleOpenAddProj}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-white">{proj.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditProj(proj)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProj(proj.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed mt-1">{proj.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies?.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <span>View Live Codebase</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 6: CERTIFICATIONS CRUD
         ========================================================================= */}
      {activeSection === 'certifications' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Professional Licenses & Certifications</h3>
              <p className="text-xs text-slate-400">
                Add verified certifications from AWS, Google Cloud, CNCF, and industry bodies.
              </p>
            </div>
            <button
              onClick={handleOpenAddCert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Certification</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white text-xs">{cert}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditCert(index, cert)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Certification"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCert(cert)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Certification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 7: AUTO-APPLY PRE-FILL VAULT (CRUD & Automation Engine)
         ========================================================================= */}
      {activeSection === 'autoapply' && (
        <div className="space-y-6 text-xs">
          <div className="p-5 rounded-2xl border border-indigo-900/60 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span className="font-bold text-white text-sm">Autonomous Auto-Apply Answers Vault</span>
            </div>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Every job portal (LinkedIn Easy Apply, Indeed Quick Apply, Greenhouse, Lever) asks candidate compliance questions. Storing them here allows n8n to autonomously fill forms and auto-apply without human delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Apply Rules */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>Automation Rules & Match Filter</span>
              </h4>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-semibold text-white">Auto-Apply Engine Active</div>
                  <div className="text-[11px] text-slate-400">Permit n8n autonomous applications</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoApplyEnabled}
                  onChange={(e) => setAutoApplyEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">Minimum Fit Threshold</label>
                  <span className="font-mono font-bold text-emerald-400">{minMatchScore}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Only jobs meeting or exceeding this match score will be auto-applied. Mismatched stacks (like Java) are excluded.
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Daily Max Applications Limit</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Enabled Target Portals</label>
                <div className="flex flex-wrap gap-2">
                  {['LinkedIn', 'Indeed', 'Glassdoor', 'RemoteOK', 'Wellfound', 'Greenhouse', 'Lever'].map((portal) => {
                    const active = targetPortals.includes(portal);
                    return (
                      <button
                        key={portal}
                        type="button"
                        onClick={() => togglePortal(portal)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {portal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Standard Compliance Answers */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Job Application Answers Vault</span>
              </h4>

              <div>
                <label className="block text-slate-400 mb-1">Work Authorization Status</label>
                <input
                  type="text"
                  value={workAuthorization}
                  onChange={(e) => setWorkAuthorization(e.target.value)}
                  placeholder="e.g. Authorized to work without visa sponsorship"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-semibold text-white">Require Visa Sponsorship in the Future?</div>
                  <div className="text-[11px] text-slate-400">e.g. H-1B, OPT, or EU work permit transfer</div>
                </div>
                <input
                  type="checkbox"
                  checked={requiresVisaSponsorship}
                  onChange={(e) => setRequiresVisaSponsorship(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notice Period / Earliest Availability</label>
                <select
                  value={noticePeriod}
                  onChange={(e) => setNoticePeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Immediate">Immediate (Ready to start)</option>
                  <option value="2 Weeks">2 Weeks standard notice</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Custom Application Note / Pitch Template</label>
                <textarea
                  rows={4}
                  value={customCoverNote}
                  onChange={(e) => setCustomCoverNote(e.target.value)}
                  placeholder="Auto-injected into employer cover notes and application forms..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS FOR ADD / EDIT (SKILL, EXPERIENCE, EDUCATION, PROJECT, CERT)
         ========================================================================= */}

      {/* Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingSkillId ? 'Edit Skill Record' : 'Add New Skill'}
              </h3>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Skill Name *</label>
              <input
                type="text"
                placeholder="e.g. Python, FastAPI, PyTorch, Docker..."
                value={skillDraftName}
                onChange={(e) => setSkillDraftName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={skillDraftCategory}
                  onChange={(e) => setSkillDraftCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Language">Language</option>
                  <option value="Framework">Framework</option>
                  <option value="Database">Database</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Tools & Architecture">Tools & Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Proficiency Level</label>
                <select
                  value={skillDraftProficiency}
                  onChange={(e) => setSkillDraftProficiency(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Years of Practical Experience</label>
              <input
                type="number"
                min="1"
                max="30"
                value={skillDraftYears}
                onChange={(e) => setSkillDraftYears(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkill}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              >
                {editingSkillId ? 'Update Skill' : 'Save Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingExpId ? 'Edit Professional Position' : 'Add Professional Experience'}
              </h3>
              <button onClick={() => setShowExpModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Aether Cloud Systems"
                  value={expDraftCompany}
                  onChange={(e) => setExpDraftCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Position / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Full-Stack Systems Engineer"
                  value={expDraftPosition}
                  onChange={(e) => setExpDraftPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Start Date</label>
                <input
                  type="text"
                  placeholder="2022-03"
                  value={expDraftStartDate}
                  onChange={(e) => setExpDraftStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">End Date</label>
                <input
                  type="text"
                  placeholder="Present"
                  value={expDraftEndDate}
                  onChange={(e) => setExpDraftEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Role Summary</label>
              <textarea
                rows={3}
                placeholder="Architected high-throughput microservices using Django REST and React..."
                value={expDraftDesc}
                onChange={(e) => setExpDraftDesc(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Key Quantified Achievement Bullet</label>
              <input
                type="text"
                placeholder="e.g. Reduced API p99 latency by 38% across 1.2M monthly requests."
                value={expDraftBullet}
                onChange={(e) => setExpDraftBullet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowExpModal(false)} className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSaveExp}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              >
                {editingExpId ? 'Update Experience' : 'Save Experience'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingEduId ? 'Edit Academic Record' : 'Add Education Record'}
              </h3>
              <button onClick={() => setShowEduModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Institution / University *</label>
              <input
                type="text"
                placeholder="e.g. University of California, Berkeley"
                value={eduDraftInstitution}
                onChange={(e) => setEduDraftInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Degree *</label>
              <input
                type="text"
                placeholder="e.g. B.S. in Computer Science"
                value={eduDraftDegree}
                onChange={(e) => setEduDraftDegree(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Field of Study</label>
                <input
                  type="text"
                  placeholder="Distributed Systems"
                  value={eduDraftField}
                  onChange={(e) => setEduDraftField(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Graduation Year</label>
                <input
                  type="text"
                  placeholder="2020"
                  value={eduDraftYear}
                  onChange={(e) => setEduDraftYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowEduModal(false)} className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSaveEdu}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              >
                {editingEduId ? 'Update Education' : 'Save Education'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingProjId ? 'Edit Project Record' : 'Add Project Showcase'}
              </h3>
              <button onClick={() => setShowProjModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Project Title *</label>
              <input
                type="text"
                placeholder="e.g. CareerSphere AI Platform"
                value={projDraftTitle}
                onChange={(e) => setProjDraftTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Project Description</label>
              <textarea
                rows={3}
                placeholder="Describe features, metrics, and architecture..."
                value={projDraftDesc}
                onChange={(e) => setProjDraftDesc(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Repository or Demo URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={projDraftLink}
                onChange={(e) => setProjDraftLink(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Technologies Used (comma separated)</label>
              <input
                type="text"
                placeholder="Python, Django, React, TypeScript, Docker"
                value={projDraftTech}
                onChange={(e) => setProjDraftTech(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowProjModal(false)} className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSaveProj}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              >
                {editingProjId ? 'Update Project' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingCertIndex !== null ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Certification Name *</label>
              <input
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect"
                value={certDraftName}
                onChange={(e) => setCertDraftName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowCertModal(false)} className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleSaveCert}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
              >
                {editingCertIndex !== null ? 'Update Certificate' : 'Save Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
