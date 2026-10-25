/**
 * CareerSphere AI — Complete TypeScript Domain & API Definitions
 * Phases 1 through 6
 */

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PlatformHealth {
  platform: string;
  phase: string;
  environment: string;
  timestamp: number;
  dependencies: {
    database: {
      status: 'connected' | 'degraded' | 'unreachable';
      vendor: string;
      note?: string;
    };
    task_queue: {
      status: string;
      broker: string;
      note?: string;
    };
    ai_engine: {
      status: string;
      model: string;
      note?: string;
    };
  };
}

export interface SystemConfig {
  name: string;
  version: string;
  milestone: {
    current: string;
    active_phases: string[];
    total_milestones: number;
  };
  supported_roles: Array<{
    id: UserRole;
    label: string;
    active_in_phase: number;
  }>;
  governance: {
    max_resume_upload_mb: number;
    supported_formats: string[];
    security_model: string;
  };
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpa?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  technologies: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Language' | 'Framework' | 'Database' | 'Cloud & DevOps' | 'AI & ML' | 'Tools & Architecture';
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsExperience?: number;
}

export interface AutoApplySettings {
  enabled: boolean;
  minMatchScore: number;
  dailyApplicationLimit: number;
  workAuthorization: string;
  requiresVisaSponsorship: boolean;
  noticePeriod: string;
  preferredLocations: string[];
  targetPortals: string[];
  customCoverNote?: string;
  autoTailorEnabled: boolean;
}

export interface CandidateProfile {
  userId: string;
  fullName?: string;
  email?: string;
  headline: string;
  phone: string;
  location: string;
  bio: string;
  targetRole: string;
  experienceYears: number;
  desiredSalaryMin: number;
  workplacePreference: 'Remote' | 'Hybrid' | 'On-site';
  skills: string[];
  structuredSkills?: SkillItem[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  savedJobIds: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  autoApplySettings?: AutoApplySettings;
}

export type CompanyVerificationStatus =
  | 'draft'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'resubmission_required';

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  sizeRange: string;
  headquarters: string;
  website: string;
  description: string;
  isVerified: boolean;
  verificationStatus?: CompanyVerificationStatus;
  logoUrl?: string;
  businessEmail?: string;
  workCulture?: string;
  benefits?: string[];
  registrationNumber?: string;
  taxId?: string;
  proofDocumentUrl?: string;
  verificationNotes?: string;
  verificationSubmittedAt?: string;
  verifiedAt?: string;
  reviewedByAdminId?: string;
  rejectionReason?: string;
  contactPhone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyMembership {
  id: string;
  companyId: string;
  userId: string;
  role: 'owner' | 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'member';
  title: string;
  department?: string;
  status?: 'active' | 'suspended';
  permissions: string[];
  joinedAt: string;
}

export interface CompanyVerificationSubmission {
  id: string;
  companyId: string;
  submittedByUserId: string;
  submittedByName: string;
  submittedAt: string;
  registrationNumber: string;
  taxId: string;
  officialDomain: string;
  documentName?: string;
  documentUrl?: string;
  notes: string;
  status: CompanyVerificationStatus;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyId: string;
  title: string;
  phone: string;
  department: string;
  workEmail: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterActivity {
  id: string;
  companyId: string;
  recruiterId: string;
  recruiterName: string;
  action: string;
  targetType: string;
  targetId: string;
  description: string;
  timestamp: string;
}

export interface RecruiterDashboardStats {
  company: {
    id: string;
    name: string;
    isVerified: boolean;
    verificationStatus: CompanyVerificationStatus;
    logoUrl?: string;
  };
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlistedCandidates: number;
  upcomingInterviews: number;
  pendingActions: Array<{
    id: string;
    title: string;
    description: string;
    type: 'verification' | 'applicant' | 'interview' | 'job';
    priority: 'high' | 'medium' | 'low';
    targetTab: string;
    targetSubPart?: string;
  }>;
}

export type CompanyTeamRole = 'owner' | 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'member';

export interface TeamMemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: CompanyTeamRole;
  title: string;
  department?: string;
  status?: 'active' | 'suspended';
  permissions: string[];
  joinedAt: string;
}

export interface TeamInvitation {
  id: string;
  companyId: string;
  companyName: string;
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  email: string;
  role: CompanyTeamRole;
  title: string;
  department?: string;
  permissions: string[];
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface RecruiterAnalyticsData {
  summary: {
    totalJobs: number;
    activeJobs: number;
    draftJobs: number;
    pausedJobs: number;
    closedJobs: number;
    expiredJobs: number;
    totalApplications: number;
    newApplications7d: number;
    newApplications30d: number;
    shortlistedCandidates: number;
    interviewsScheduled: number;
    offersIssued: number;
    offersAccepted: number;
    hiresRecorded: number;
    avgTimeToHireDays: number | null;
    overallConversionRate: number;
  };
  funnel: {
    applied: number;
    underReview: number;
    shortlisted: number;
    interviewScheduled: number;
    offerExtended: number;
    hired: number;
    conversionRates: {
      appliedToReview: number;
      reviewToShortlist: number;
      shortlistToInterview: number;
      interviewToOffer: number;
      offerToHired: number;
      overall: number;
    };
  };
  stageDistribution: Record<string, number>;
  topJobs: Array<{
    id: string;
    title: string;
    department: string;
    status: string;
    applicationsCount: number;
    interviewsCount: number;
    hiresCount: number;
    conversionRate: number;
  }>;
  applicationTrends: Array<{
    date: string;
    count: number;
  }>;
  teamWorkload: Array<{
    userId: string;
    name: string;
    role: string;
    assignedJobsCount: number;
    pendingReviewsCount: number;
    scheduledInterviewsCount: number;
    offersHandledCount: number;
  }>;
  dateRange: {
    range: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface RecruiterAuditLogItem {
  id: string;
  action: string;
  resourceType: string;
  actor: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  summary: string;
  companyId?: string;
  metadata?: Record<string, any>;
}

export type JobPortal =
  | 'LinkedIn'
  | 'Indeed'
  | 'Glassdoor'
  | 'RemoteOK'
  | 'Wellfound'
  | 'Greenhouse'
  | 'Lever'
  | 'Google Careers'
  | 'Workday';

export type JobStatus =
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'paused'
  | 'closed'
  | 'rejected'
  | 'expired';

export type JobModerationStatus = 'approved' | 'pending' | 'flagged' | 'rejected';

export interface ScreeningQuestion {
  id: string;
  question: string;
  required: boolean;
  idealAnswer?: string;
  questionType?: 'text' | 'yes_no' | 'number';
}

export interface JobActivityRecord {
  id: string;
  jobId: string;
  action: string;
  actorName: string;
  actorEmail: string;
  timestamp: string;
  details?: string;
}

export interface JobAnalyticsSummary {
  jobId: string;
  jobTitle: string;
  totalApplications: number;
  stageBreakdown: Record<string, number>;
  activeCandidates: number;
  shortlisted: number;
  interviewsScheduled: number;
  hired: number;
  rejected: number;
  daysOpen: number;
  viewsCount?: number;
}

export interface AIAssistJobPayload {
  action:
    | 'generate'
    | 'improve'
    | 'suggest_skills'
    | 'suggest_responsibilities'
    | 'check_quality'
    | 'generate_summary'
    | 'suggest_screening_questions';
  title?: string;
  department?: string;
  workplaceType?: string;
  employmentType?: string;
  experienceYears?: number;
  skills?: string[];
  draftDescription?: string;
  location?: string;
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
}

export interface AIAssistJobResult {
  action: string;
  generatedText?: string;
  improvedDescription?: string;
  suggestedSkills?: { required: string[]; preferred: string[] };
  suggestedResponsibilities?: string[];
  qualityAnalysis?: {
    completenessScore: number;
    strengths: string[];
    suggestions: string[];
    missingItems: string[];
  };
  summary?: string;
  applicationInstructions?: string;
  suggestedQuestions?: Array<{ question: string; required: boolean; idealAnswer?: string }>;
}

export interface Job {
  id: string;
  companyId: string;
  company_name?: string;
  company_details?: Company;
  recruiterId: string;
  jobRef?: string;
  title: string;
  department: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
  openingsCount?: number;
  minExperienceYears: number;
  maxExperienceYears?: number;
  isFresherEligible?: boolean;
  educationLevel?: string;
  qualifications?: string[];
  preferredQualifications?: string[];
  responsibilities?: string[];
  salaryMin: number;
  salaryMax: number;
  salary_range?: string;
  salaryCurrency: string;
  payFrequency?: 'annual' | 'monthly' | 'hourly';
  isSalaryDisclosed?: boolean;
  benefits?: string[];
  description: string;
  requirements: string[];
  skillsRequired: string[];
  preferredSkills?: string[];
  openingDate?: string;
  deadline: string;
  screeningQuestions?: ScreeningQuestion[];
  hiringProcessNotes?: string;
  status: JobStatus;
  moderationStatus: JobModerationStatus;
  moderationReason?: string;
  rejectionReason?: string;
  portal?: JobPortal;
  directApplyUrl?: string;
  partnerAts?: string;
  applicantsCount: number;
  viewsCount?: number;
  matchScore?: number;
  match_score_demo?: number;
  calculatedScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  isDomainMatch?: boolean;
  isDomainMismatch?: boolean;
  isStrictlyExcluded?: boolean;
  exclusionReason?: string;
  fitLabel?: string;
  searchOverrideActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface ResumeDocument {
  id: string;
  candidateId?: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  fileFormat: string;
  extractedText?: string;
  atsScore?: number;
  atsScoreDemo?: number;
  parsingStatus?: string;
  isScanned?: boolean;
  ocrNotice?: string;
  isPrimary: boolean;
  createdAt?: string;
  uploadedAt?: string;
}

export type CandidateResume = ResumeDocument;
export type BenchmarkJob = Job;

export interface UploadResumeResult {
  resume: ResumeDocument;
  updatedProfile?: CandidateProfile;
  updatedUser?: Partial<User>;
  extractedSkills?: string[];
  detectedRole?: string;
}

export type ApplicationStage =
  | 'Submitted'
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Assessment'
  | 'Interview Scheduled'
  | 'Offer Extended'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn';

export interface RecruiterInternalNote {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  text: string;
  createdAt: string;
}

export interface CandidateMatchAnalysis {
  applicationId: string;
  overallScore: number;
  matchGrade: 'Excellent' | 'Good' | 'Moderate' | 'Low';
  requiredSkillsMatched: string[];
  requiredSkillsMissing: string[];
  preferredSkillsMatched: string[];
  experienceFit: {
    yearsRequired: number;
    yearsCandidate: number;
    verdict: 'Exceeds' | 'Meets' | 'Below';
    notes: string;
  };
  educationFit: {
    required: string;
    candidate: string;
    verdict: 'Meets' | 'Relevant' | 'Not Specified';
  };
  keyStrengths: string[];
  potentialGaps: string[];
  evidenceSnippets: string[];
  advisoryNotice: string;
  evaluatedAt: string;
}

export interface AIScreeningSummary {
  applicationId: string;
  executiveSummary: string;
  topAchievements: string[];
  suggestedInterviewQuestions: Array<{
    question: string;
    focusArea: string;
    expectedEvidence: string;
  }>;
  flaggedRisks?: string[];
  generatedAt: string;
}

export interface TalentPoolCandidate {
  id: string;
  companyId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateHeadline?: string;
  location?: string;
  skills: string[];
  experienceYears: number;
  primaryRole: string;
  notes: string;
  tags: string[];
  sourceApplicationId?: string;
  sourceJobTitle?: string;
  addedByRecruiterId: string;
  addedByRecruiterName: string;
  addedAt: string;
  lastContactedAt?: string;
}

export interface BulkApplicantActionPayload {
  applicationIds: string[];
  action: 'stage_change' | 'add_tag' | 'remove_tag' | 'add_note' | 'reject';
  stage?: ApplicationStage;
  tag?: string;
  note?: string;
  rejectionReason?: string;
}

export interface CandidateComparisonItem {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateHeadline: string;
  experienceYears: number;
  education: string;
  location: string;
  matchScore: number;
  stage: ApplicationStage;
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  screeningAnswersCount: number;
  topStrengths: string[];
}

export interface StatusTimelineEvent {
  stage: ApplicationStage;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface CandidateFollowUpTask {
  id: string;
  text: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface ResumeSnapshot {
  id: string;
  fileName: string;
  atsScore?: number;
  extractedSkills?: string[];
  summary?: string;
}

export interface ScreeningResponse {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  alertsEnabled: boolean;
  createdAt: string;
  matchCount?: number;
}

export interface SavedJobItem {
  id: string;
  jobId: string;
  collection: string;
  notes?: string;
  reminderDate?: string;
  savedAt: string;
}

export interface InterviewRescheduleRequest {
  id: string;
  interviewId: string;
  candidateReason: string;
  proposedTime: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: string;
}

export interface CandidateInterviewNote {
  id: string;
  interviewId: string;
  questionsToAsk: string[];
  topicsToRevise: string[];
  privateReflections?: string;
  confidenceRating?: number;
  updatedAt: string;
}

export interface PrepQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'System Design' | 'Situational' | 'HR';
  question: string;
  starStructure?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  sampleAnswer: string;
  keyConcepts: string[];
  bookmarked?: boolean;
}

export interface MockSessionAnswer {
  questionId: string;
  question: string;
  category: string;
  candidateAnswer: string;
  score: number;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
  modelAnswer: string;
  submittedAt: string;
}

export interface MockInterviewSession {
  id: string;
  jobId?: string;
  jobTitle?: string;
  roundType: 'Technical' | 'Behavioral' | 'System Design' | 'HR';
  difficulty: 'Entry' | 'Mid' | 'Senior';
  overallScore?: number;
  answers: MockSessionAnswer[];
  createdAt: string;
}

export interface Application {
  id: string;
  referenceNumber?: string;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  companyId?: string;
  location?: string;
  portal?: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateHeadline?: string;
  candidateLocation?: string;
  candidateExperienceYears?: number;
  candidateEducation?: string;
  candidateSkills?: string[];
  resumeId: string;
  resumeSnapshot?: ResumeSnapshot;
  coverLetter?: string;
  screeningResponses?: ScreeningResponse[];
  stage: ApplicationStage;
  matchScore: number;
  notes: string[];
  internalNotes?: RecruiterInternalNote[];
  tags?: string[];
  matchAnalysis?: CandidateMatchAnalysis;
  aiSummary?: AIScreeningSummary;
  rejectionReason?: string;
  isTalentPooled?: boolean;
  followUpTasks?: CandidateFollowUpTask[];
  statusTimeline?: StatusTimelineEvent[];
  appliedAt: string;
  updatedAt: string;
}

export interface RescheduleEvent {
  prevScheduledAt: string;
  newScheduledAt: string;
  actor: string;
  reason?: string;
  timestamp: string;
}

export interface InterviewerMember {
  id?: string;
  name: string;
  email: string;
  role?: string;
  userId?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateHeadline?: string;
  jobId: string;
  jobTitle?: string;
  companyId?: string;
  companyName?: string;
  location?: string;
  recruiterId: string;
  roundName: string;
  roundNumber?: number;
  scheduledAt: string;
  endAt?: string;
  durationMinutes: number;
  timeZone: string;
  interviewType: 'video' | 'phone' | 'in_person' | 'Technical Screen' | 'Hiring Manager' | 'System Design' | 'Executive';
  meetingUrl: string;
  interviewerName: string;
  interviewerRole?: string;
  interviewers?: InterviewerMember[];
  candidateInstructions?: string;
  internalNotes?: string;
  status: 'scheduled' | 'confirmed' | 'reschedule_requested' | 'completed' | 'cancelled';
  candidateConfirmed?: boolean;
  notes?: string;
  rescheduleHistory?: RescheduleEvent[];
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  rescheduleReason?: string;
  rescheduleRequestedDate?: string;
  feedbackStatus?: 'pending' | 'submitted';
  rescheduleRequest?: InterviewRescheduleRequest;
  preparationNotes?: CandidateInterviewNote;
}

export interface InterviewCriteriaRatings {
  technicalSkill: number; // 1-5
  problemSolving: number; // 1-5
  communication: number; // 1-5
  culturalRoleAlignment: number; // 1-5
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail: string;
  recommendation: 'strong_advance' | 'advance' | 'hold' | 'do_not_advance';
  criteriaRatings: InterviewCriteriaRatings;
  overallScore: number;
  strengths: string[];
  growthAreas: string[];
  privateNotes: string;
  submittedAt: string;
  isLocked: boolean;
}

export interface OfferVersion {
  version: number;
  baseSalary: number;
  startDate: string;
  expiryDate: string;
  revisedAt: string;
  revisedBy: string;
  revisionNotes?: string;
}

export interface JobOffer {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  department: string;
  employmentType: 'Full-time' | 'Contract' | 'Part-time';
  baseSalary: number;
  currency: string;
  payFrequency: 'annual' | 'monthly' | 'hourly';
  bonusOrEquity?: string;
  startDate: string;
  expiryDate: string;
  workLocation: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  benefits: string[];
  specialTerms?: string;
  status: 'draft' | 'pending_approval' | 'issued' | 'accepted' | 'declined' | 'expired' | 'withdrawn' | 'revised';
  version: number;
  versionHistory?: OfferVersion[];
  issuedAt?: string;
  withdrawnReason?: string;
  withdrawnAt?: string;
  candidateResponse?: {
    status: 'accepted' | 'declined';
    note?: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'candidate' | 'recruiter' | 'admin';
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  applicationId?: string;
  jobId?: string;
  jobTitle?: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  recruiterId: string;
  recruiterName: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCountCandidate: number;
  unreadCountRecruiter: number;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  action: string;
  resourceType: string;
  resource_type?: string;
  actor: string;
  ipAddress: string;
  ip_address?: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  summary: string;
}

export interface SectionCompletenessItem {
  status: 'complete' | 'weak' | 'missing';
  score: number;
  note: string;
}

export interface VagueBulletItem {
  original: string;
  issue: string;
  suggestion: string;
}

export interface AiResumeAnalysis {
  atsScore: number;
  structureScore: number;
  quantificationScore: number;
  relevanceScore: number;
  sectionCompleteness?: Record<string, SectionCompletenessItem>;
  vagueBullets?: VagueBulletItem[];
  quantificationOpportunities?: string[];
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  actionableRecommendations: string[];
  explainableSummary: string;
  provider: string;
  disclaimer: string;
}

export interface JobMatchResult {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  criteriaBreakdown: {
    requiredSkills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  partialMatches: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface ResumeDraft {
  id: string;
  resumeId: string;
  targetRole: string;
  targetJobId?: string;
  originalText: string;
  draftText: string;
  summary?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisHistoryItem {
  id: string;
  resumeId: string;
  resumeTitle: string;
  targetJobTitle: string;
  atsScore: number;
  analyzedAt: string;
}

export interface SummaryGenerationResult {
  professionalSummary: string;
  targetRole: string;
  highlightedSkills: string[];
}

export interface AiCopilotRewrite {
  improvedBullets: string[];
  powerVerbsUsed: string[];
  targetedSkillAlignment: string;
}

export interface MultiApplyResult {
  jobId: string;
  jobTitle: string;
  status: 'submitted' | 'manual_handoff' | 'skipped_duplicate';
  transactionId?: string;
  portal: string;
  message: string;
  manualUrl?: string;
}

export interface N8nPipelineLog {
  step: string;
  timestamp: string;
  status: 'ok' | 'info' | 'warn';
  detail: string;
}

export interface N8nExecutionRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobIds: string[];
  jobTitles: string[];
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  webhookUrl: string;
  isLiveWebhook: boolean;
  dispatchedAt: string;
  durationMs: number;
  pipelineLogs: N8nPipelineLog[];
  applicationsCreated: string[];
}

export interface N8nStatus {
  isConfigured: boolean;
  webhookUrl: string;
  totalExecutions: number;
  recentExecutions: N8nExecutionRecord[];
  recommendedWebhookEvent: string;
}

export interface ResendStatus {
  isConfigured: boolean;
  fromEmail: string;
  status: string;
}

// ----------------------------------------------------------------------------
// Candidate Portal 30 Modules Domain Definitions
// ----------------------------------------------------------------------------

export interface UserSession {
  id: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  isTrusted: boolean;
  lastActiveAt: string;
}

export interface LoginHistoryItem {
  id: string;
  ipAddress: string;
  deviceInfo: string;
  location: string;
  isSuspicious: boolean;
  status: 'success' | 'failed_bad_password' | 'failed_locked' | 'otp_required';
  createdAt: string;
}

export interface ResumeAnalysisReport {
  id: string;
  resumeId: string;
  jobId?: string;
  overallScore: number;
  sectionCompleteness: number;
  keywordCoverage: number;
  readabilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  formattingWarnings: string[];
  actionableSuggestions: string[];
  beforeAfterImprovements?: {
    original: string;
    improved: string;
    rationale: string;
  }[];
  createdAt: string;
}

export interface AiGeneratedResume {
  id: string;
  templateType: 'fresher' | 'experienced' | 'technical' | 'data-analyst' | 'python-fullstack' | 'ai-ml';
  targetJobDescription?: string;
  objectiveSummary: string;
  summary?: string;
  tailoredSkills: string[];
  experienceBullets: string[];
  projectBullets: string[];
  coverLetter?: string;
  createdAt: string;
}

export interface SavedJobItem {
  id: string;
  jobId: string;
  job: Job;
  collectionName: string;
  personalNotes?: string;
  priority: 'High' | 'Normal' | 'Low';
  savedAt: string;
}

export interface JobAlertConfig {
  id: string;
  title: string;
  keywords?: string;
  location?: string;
  minSalary?: number;
  workplaceType?: string;
  frequency: 'Instant' | 'Daily' | 'Weekly';
  isActive: boolean;
  createdAt: string;
}

export interface InterviewScheduleItem {
  id: string;
  applicationId?: string;
  jobTitle: string;
  companyName: string;
  roundName: string;
  scheduledTime: string;
  mode: 'Online' | 'In-Person' | 'Phone';
  meetingLink?: string;
  instructions?: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  checklist?: string[];
  preparationNotes?: string;
}

export interface AiMockInterviewTurn {
  id: string;
  role: 'interviewer' | 'candidate';
  message: string;
  feedback?: {
    strengths: string[];
    improvements: string[];
    starMethodAssessment?: string;
    score: number;
  };
}

export interface AiMockInterviewSession {
  id: string;
  targetRole: string;
  topic: 'Technical' | 'System Design' | 'Behavioral STAR' | 'DSA & Algorithms' | 'HR Screening';
  overallScore: number;
  clarityScore: number;
  technicalAccuracyScore: number;
  feedbackSummary: string;
  transcript: AiMockInterviewTurn[];
  status: 'in_progress' | 'completed';
  createdAt: string;
}

export interface LearningMilestone {
  week: number;
  title: string;
  description: string;
  skills: string[];
  completed: boolean;
}

export interface CareerRoadmap {
  id: string;
  targetRole: string;
  currentReadinessPct: number;
  missingEssentialSkills: string[];
  missingOptionalSkills: string[];
  milestones: LearningMilestone[];
  recommendedProjects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  createdAt: string;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  skillCategory: string;
  provider: string;
  url: string;
  isFree: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
}

export interface CandidateNotificationItem {
  id: string;
  type: 'application_status' | 'interview_invite' | 'security_alert' | 'job_match' | 'ats_ready';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CandidateMessageItem {
  id: string;
  senderType: 'candidate' | 'recruiter' | 'system';
  senderName: string;
  recipientName: string;
  jobId?: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentTitle: string;
  category: 'Python Core' | 'SQL & Databases' | 'Data Structures' | 'Logical Reasoning' | 'Full Stack React';
  scorePct: number;
  totalQuestions: number;
  correctCount: number;
  weakTopics: string[];
  createdAt: string;
}

export interface PlacementDriveItem {
  id: string;
  companyName: string;
  roleTitle: string;
  minCgpa: number;
  allowedBranches: string[];
  driveDate: string;
  venue: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface SupportTicketReply {
  id: string;
  author: string;
  isStaff: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  category: 'Technical Problem' | 'Fake Job Report' | 'Suspicious Recruiter' | 'Payment Demanded by Employer' | 'Data Privacy' | 'Feature Suggestion';
  subject: string;
  description: string;
  jobId?: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
  replies?: SupportTicketReply[];
}

export interface PrivacySettings {
  analyticsConsent: boolean;
  marketingConsent: boolean;
  recruiterDiscoveryConsent: boolean;
  hidePhoneFromPublic: boolean;
  hideEmailFromPublic: boolean;
  twoFactorEnabled: boolean;
}

export interface CandidateAccountSettings {
  email: string;
  isEmailVerified: boolean;
  name: string;
  phone: string;
  headline: string;
  timezone: string;
  accountType: string;
  accountStatus: 'Active' | 'Deactivated' | 'Pending Deletion';
  createdAt: string;
}

export interface CandidateSecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'authenticator' | 'email_otp';
  recoveryCodes: string[];
  lastPasswordChange: string;
  lastLogin: string;
}

export interface CandidatePrivacySettings {
  profileVisibility: 'public' | 'recruiters_only' | 'private';
  resumeVisibility: 'recruiters' | 'verified_only' | 'none';
  allowResumeDownload: boolean;
  aiPersonalizationConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  hidePhoneFromPublic: boolean;
  hideEmailFromPublic: boolean;
}

export interface CandidateNotificationSettings {
  emailJobAlerts: boolean;
  emailApplicationUpdates: boolean;
  emailInterviewReminders: boolean;
  emailRecruiterMessages: boolean;
  emailSecurityAlerts: boolean;
  emailWeeklyDigest: boolean;
  inAppInstantAlerts: boolean;
  inAppSound: boolean;
}

export interface CandidateAiPreferences {
  enablePersonalization: boolean;
  allowResumeContext: boolean;
  autoGenerateRoadmap: boolean;
  recommendationBias: 'skills' | 'salary' | 'remote' | 'balanced';
}

export interface CandidateAppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
  fontScale: 'compact' | 'normal' | 'comfortable';
}

export interface CandidateActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  createdAt: string;
  lastActive: string;
}

export interface CandidateDeviceItem {
  id: string;
  deviceName: string;
  deviceType: string;
  trusted: boolean;
  approvalStatus: 'Approved' | 'Pending Admin Review';
  lastUsed: string;
}

export interface CandidateSecurityAuditEvent {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface CandidateFullSettings {
  account: CandidateAccountSettings;
  security: CandidateSecuritySettings;
  privacy: CandidatePrivacySettings;
  notifications: CandidateNotificationSettings;
  aiPreferences: CandidateAiPreferences;
  appearance: CandidateAppearanceSettings;
  sessions: CandidateActiveSession[];
  devices: CandidateDeviceItem[];
  auditLogs: CandidateSecurityAuditEvent[];
}

// ============================================================================
// AI CANDIDATE MATCHER (RECRUITER PORTAL)
// ============================================================================

export interface AiMatcherJobSummary {
  id: string;
  jobRef?: string;
  title: string;
  department: string;
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  employmentType: string;
  minExperienceYears: number;
  maxExperienceYears?: number;
  skillsRequired: string[];
  preferredSkills?: string[];
  educationLevel?: string;
  status: string;
  applicantsCount: number;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  updatedAt?: string;
  createdAt: string;
}

export interface AiMatcherScoreBreakdown {
  requiredSkillsScore: number;     // 0-100
  requiredSkillsWeight: number;    // default 50
  experienceScore: number;         // 0-100
  experienceWeight: number;        // default 25
  preferredSkillsScore: number;    // 0-100
  preferredSkillsWeight: number;   // default 15
  educationWorkplaceScore: number; // 0-100
  educationWorkplaceWeight: number;// default 10
}

export interface AiMatcherCandidate {
  candidateId: string;
  applicationId?: string;
  applicationStage?: string;
  candidateName: string;
  candidateEmail?: string;
  headline: string;
  location: string;
  experienceYears: number;
  workplacePreference?: string;
  education?: string;
  institution?: string;
  skills: string[];
  resumeId?: string;
  resumeFileName?: string;
  hasResume: boolean;
  isApplied: boolean;
  
  // Deterministic & Explainable Scoring
  overallScore: number;
  matchGrade: 'Excellent' | 'Good' | 'Moderate' | 'Low';
  scoreBreakdown: AiMatcherScoreBreakdown;
  
  // Criteria Breakdown
  requiredSkillsMatched: string[];
  requiredSkillsMissing: string[];
  preferredSkillsMatched: string[];
  relatedSkills: string[];
  experienceAlignment: {
    yearsCandidate: number;
    yearsRequired: number;
    verdict: 'Exceeds' | 'Meets' | 'Below';
    details: string;
  };
  missingOrUnverifiedInfo: string[];
  nonEvaluatedCriteria: string[];
  
  // AI Deep Analysis
  isAiAnalyzed: boolean;
  aiEngine?: string;
  keyStrengths: string[];
  potentialGaps: string[];
  evidenceSnippets: string[];
  tailoredInterviewQuestions: string[];
  advisoryNotice: string;
  lastEvaluatedAt: string;
}

export interface AiMatcherFilterParams {
  jobId: string;
  search?: string;
  minExperience?: number;
  skills?: string;
  education?: string;
  location?: string;
  status?: 'all' | 'applied' | 'talent_pool';
  sortBy?: 'score_desc' | 'score_asc' | 'exp_desc' | 'exp_asc' | 'name_asc';
  page?: number;
  limit?: number;
}

export interface AiMatcherCandidatesResponse {
  job: AiMatcherJobSummary;
  candidates: AiMatcherCandidate[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  cachedCount: number;
  scoringWeights: {
    requiredSkills: number;
    experience: number;
    preferredSkills: number;
    educationWorkplace: number;
  };
}

export interface AiMatcherComparisonResult {
  job: AiMatcherJobSummary;
  candidates: Array<AiMatcherCandidate & {
    skillsCoveragePercentage: number;
    pros: string[];
    cons: string[];
  }>;
  matrix: {
    skills: Array<{
      skillName: string;
      isRequired: boolean;
      candidateMap: Record<string, boolean>;
    }>;
  };
}

// ============================================================================
// RECRUITER NOTIFICATIONS CENTER
// ============================================================================

export type RecruiterNotificationCategory =
  | 'all'
  | 'unread'
  | 'applications'
  | 'interviews'
  | 'jobs'
  | 'company'
  | 'system';

export type RecruiterNotificationType =
  // Applications
  | 'new_application'
  | 'application_status_changed'
  | 'candidate_shortlisted'
  | 'candidate_withdrawn'
  // Interviews
  | 'interview_scheduled'
  | 'interview_rescheduled'
  | 'interview_cancelled'
  | 'interview_reschedule_requested'
  | 'interview_feedback_submitted'
  // Jobs
  | 'job_approved'
  | 'job_rejected'
  | 'job_status_changed'
  | 'job_moderation_required'
  // Offers
  | 'offer_accepted'
  | 'offer_declined'
  | 'offer_responded'
  | 'offer_expired'
  // Company & Team
  | 'company_verification_approved'
  | 'company_verification_rejected'
  | 'company_verification_info_required'
  | 'team_invitation_sent'
  | 'team_invitation_accepted'
  | 'team_member_role_changed'
  | 'team_member_status_changed'
  // System
  | 'system_announcement'
  | 'integration_alert'
  | 'compliance_alert';

export type RecruiterNotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface RecruiterNotification {
  id: string;
  userId: string;
  companyId: string;
  type: RecruiterNotificationType;
  category: 'applications' | 'interviews' | 'jobs' | 'company' | 'system';
  title: string;
  message: string;
  priority: RecruiterNotificationPriority;
  isRead: boolean;
  readAt?: string;
  targetModule?: 'dashboard' | 'company' | 'jobs' | 'applicants' | 'matcher' | 'interviews' | 'offers' | 'messages' | 'analytics' | 'team' | 'settings' | 'audit';
  targetSubPart?: string;
  targetId?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RecruiterNotificationsResponse {
  notifications: RecruiterNotification[];
  totalCount: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
  categoryCounts: Record<string, number>;
}

export interface RecruiterNotificationFilterParams {
  category?: RecruiterNotificationCategory;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'priority';
}

// ============================================================================
// RECRUITER SETTINGS & ACCOUNT PREFERENCES (Module 13)
// ============================================================================

export interface RecruiterPersonalProfileSettings {
  name: string;
  title: string;
  phone: string;
  department: string;
  location?: string;
  bio?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  workEmail: string;
  isEmailVerified: boolean;
}

export interface RecruiterSecuritySettings {
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'authenticator' | 'email_otp';
  lastLogin: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChar: boolean;
  };
}

export interface RecruiterNotificationSettings {
  // In-App Channels
  inAppApplications: boolean;
  inAppInterviews: boolean;
  inAppOffers: boolean;
  inAppJobs: boolean;
  inAppTeam: boolean;
  inAppSystem: boolean; // Mandatory Security & System alerts (always true)
  // Email Channels
  emailNewApplications: boolean;
  emailInterviewReminders: boolean;
  emailOfferUpdates: boolean;
  emailWeeklyDigest: boolean;
  emailSecurityAlerts: boolean; // Mandatory Security alerts (always true)
}

export interface RecruiterCompanyMembershipView {
  company: Company;
  membership: CompanyMembership;
  isAuthorizedEditor: boolean;
  canManageTeam: boolean;
  verificationGuidance: {
    status: CompanyVerificationStatus;
    badgeText: string;
    description: string;
    actionableNotice: string;
    actionRoute?: string;
  };
}

export interface RecruiterPrivacySettings {
  profileVisibility: 'company_directory' | 'all_candidates' | 'private';
  showDirectEmailToCandidates: boolean;
  showPhoneToCandidates: boolean;
  analyticsTelemetryConsent: boolean;
  complianceDataRetentionNotice: string;
}

export interface RecruiterAppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  defaultLandingModule: 'dashboard' | 'jobs' | 'applicants' | 'matcher' | 'interviews' | 'notifications';
  compactDensity: boolean;
}

export interface RecruiterActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  createdAt: string;
  lastActive: string;
}

export interface RecruiterFullSettings {
  profile: RecruiterPersonalProfileSettings;
  security: RecruiterSecuritySettings;
  notifications: RecruiterNotificationSettings;
  companyView: RecruiterCompanyMembershipView;
  privacy: RecruiterPrivacySettings;
  appearance: RecruiterAppearanceSettings;
  sessions: RecruiterActiveSession[];
  accountStatus: 'Active' | 'Deactivated' | 'Pending Deletion';
}


