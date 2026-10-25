-- ============================================================================
-- CareerSphere AI — Complete Candidate Portal PostgreSQL Relational Schema
-- Supports all 30 Candidate Portal Features with strict relational integrity,
-- foreign keys, check constraints, validation rules, and indexing.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. REGISTRATION, LOGIN & ACCOUNT SECURITY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32),
  name VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
  password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret VARCHAR(128),
  failed_login_attempts INT NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  locked_until TIMESTAMP WITH TIME ZONE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  device_type VARCHAR(64),
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_history (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  device_info VARCHAR(255),
  location VARCHAR(128),
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(32) NOT NULL CHECK (status IN ('success', 'failed_bad_password', 'failed_locked', 'otp_required')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2 & 3. CANDIDATE PROFILE & ONBOARDING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_profiles (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(128),
  headline VARCHAR(255) NOT NULL DEFAULT 'Software Engineer',
  phone VARCHAR(32),
  location VARCHAR(128) NOT NULL DEFAULT 'Remote',
  bio TEXT,
  target_role VARCHAR(128) NOT NULL DEFAULT 'Full Stack Developer',
  experience_years NUMERIC(4, 1) NOT NULL DEFAULT 0,
  desired_salary_min INT NOT NULL DEFAULT 60000,
  workplace_preference VARCHAR(32) NOT NULL DEFAULT 'Remote' CHECK (workplace_preference IN ('Remote', 'Hybrid', 'On-site')),
  portfolio_url VARCHAR(255),
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  preferred_language VARCHAR(32) NOT NULL DEFAULT 'en',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  hide_phone_from_public BOOLEAN NOT NULL DEFAULT TRUE,
  recruiter_discoverable BOOLEAN NOT NULL DEFAULT TRUE,
  onboarding_step INT NOT NULL DEFAULT 6,
  onboarding_completed BOOLEAN NOT NULL DEFAULT TRUE,
  profile_completion_pct INT NOT NULL DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_education (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(128) NOT NULL,
  field_of_study VARCHAR(128) NOT NULL,
  graduation_year VARCHAR(16) NOT NULL,
  gpa VARCHAR(16),
  coursework TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL CHECK (category IN ('Language', 'Framework', 'Database', 'Cloud & DevOps', 'AI & ML', 'Tools & Architecture', 'Soft Skills')),
  proficiency VARCHAR(32) NOT NULL CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  years_experience NUMERIC(3, 1),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_projects (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL,
  github_url VARCHAR(255),
  live_url VARCHAR(255),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_certifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  issuing_org VARCHAR(255) NOT NULL,
  issue_date VARCHAR(32),
  expiry_date VARCHAR(32),
  credential_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4, 5, 6. RESUME MANAGEMENT, AI RESUME BUILDER & ATS ANALYZER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INT NOT NULL,
  file_format VARCHAR(16) NOT NULL CHECK (file_format IN ('PDF', 'DOCX', 'TXT')),
  extracted_text TEXT,
  ats_score INT NOT NULL DEFAULT 85 CHECK (ats_score >= 0 AND ats_score <= 100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  parsing_status VARCHAR(32) NOT NULL DEFAULT 'PARSED',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_analyses (
  id VARCHAR(64) PRIMARY KEY,
  resume_id VARCHAR(64) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(64),
  overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  section_completeness INT NOT NULL CHECK (section_completeness >= 0 AND section_completeness <= 100),
  keyword_coverage INT NOT NULL CHECK (keyword_coverage >= 0 AND keyword_coverage <= 100),
  readability_score INT NOT NULL CHECK (readability_score >= 0 AND readability_score <= 100),
  matched_skills TEXT[] NOT NULL,
  missing_skills TEXT[] NOT NULL,
  formatting_warnings TEXT[],
  actionable_suggestions TEXT[] NOT NULL,
  before_after_improvements JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_generated_resumes (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_type VARCHAR(64) NOT NULL CHECK (template_type IN ('fresher', 'experienced', 'technical', 'data-analyst', 'python-fullstack', 'ai-ml')),
  target_job_description TEXT,
  objective_summary TEXT NOT NULL,
  tailored_skills TEXT[] NOT NULL,
  experience_bullets JSONB NOT NULL,
  project_bullets JSONB NOT NULL,
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  industry VARCHAR(128) NOT NULL,
  size_range VARCHAR(64) NOT NULL,
  headquarters VARCHAR(128) NOT NULL,
  website VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (verification_status IN ('draft', 'pending_review', 'verified', 'rejected', 'resubmission_required')),
  logo_url VARCHAR(512),
  business_email VARCHAR(255),
  work_culture TEXT,
  benefits TEXT[],
  registration_number VARCHAR(128),
  tax_id VARCHAR(128),
  proof_document_url VARCHAR(512),
  verification_notes TEXT,
  verification_submitted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_admin_id VARCHAR(64),
  rejection_reason TEXT,
  contact_phone VARCHAR(32),
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_memberships (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  title VARCHAR(128) NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE TABLE IF NOT EXISTS company_verification_submissions (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  submitted_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submitted_by_name VARCHAR(128) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  registration_number VARCHAR(128) NOT NULL,
  tax_id VARCHAR(128) NOT NULL,
  official_domain VARCHAR(255) NOT NULL,
  document_name VARCHAR(255),
  document_url VARCHAR(512),
  notes TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'verified', 'rejected', 'resubmission_required')),
  reviewed_by_admin_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(128) NOT NULL,
  phone VARCHAR(32),
  department VARCHAR(128),
  work_email VARCHAR(255) NOT NULL,
  is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS recruiter_activities (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  recruiter_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_name VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7, 8, 10, 20. JOBS, RECOMMENDATIONS, SAVED JOBS & SEARCH ALERTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  recruiter_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  job_ref VARCHAR(64),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(128),
  location VARCHAR(128) NOT NULL,
  city VARCHAR(64),
  state VARCHAR(64),
  country VARCHAR(64),
  workplace_type VARCHAR(32) NOT NULL CHECK (workplace_type IN ('Remote', 'Hybrid', 'On-site')),
  employment_type VARCHAR(32) NOT NULL CHECK (employment_type IN ('Full-time', 'Contract', 'Part-time', 'Internship')),
  openings_count INT NOT NULL DEFAULT 1,
  min_experience_years INT NOT NULL DEFAULT 0,
  max_experience_years INT,
  is_fresher_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  education_level VARCHAR(128),
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  preferred_qualifications TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  salary_min INT NOT NULL,
  salary_max INT NOT NULL,
  salary_currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  salary_range VARCHAR(64) NOT NULL,
  pay_frequency VARCHAR(32) NOT NULL DEFAULT 'annual' CHECK (pay_frequency IN ('annual', 'monthly', 'hourly')),
  is_salary_disclosed BOOLEAN NOT NULL DEFAULT TRUE,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  skills_required TEXT[] NOT NULL,
  preferred_skills TEXT[] NOT NULL DEFAULT '{}',
  opening_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  hiring_process_notes TEXT,
  portal VARCHAR(64) NOT NULL DEFAULT 'CareerSphere Gateway',
  direct_apply_url VARCHAR(512),
  partner_ats VARCHAR(64),
  is_verified_employer BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'closed', 'rejected', 'expired')),
  moderation_status VARCHAR(32) NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'flagged', 'rejected')),
  moderation_reason TEXT,
  rejection_reason TEXT,
  applicants_count INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  last_verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS screening_questions (
  id VARCHAR(64) PRIMARY KEY,
  job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  ideal_answer TEXT,
  question_type VARCHAR(32) NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'yes_no', 'number')),
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS job_activities (
  id VARCHAR(64) PRIMARY KEY,
  job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  action VARCHAR(64) NOT NULL,
  actor_name VARCHAR(128) NOT NULL,
  actor_email VARCHAR(255) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  collection_name VARCHAR(64) NOT NULL DEFAULT 'Saved Jobs',
  personal_notes TEXT,
  priority VARCHAR(16) NOT NULL DEFAULT 'Normal' CHECK (priority IN ('High', 'Normal', 'Low')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS job_alerts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(128) NOT NULL,
  keywords VARCHAR(255),
  location VARCHAR(128),
  min_salary INT,
  workplace_type VARCHAR(32),
  frequency VARCHAR(16) NOT NULL DEFAULT 'Daily' CHECK (frequency IN ('Instant', 'Daily', 'Weekly')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. JOB APPLICATIONS & LIFECYCLE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  resume_id VARCHAR(64) REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  screening_answers JSONB,
  stage VARCHAR(32) NOT NULL DEFAULT 'Submitted' CHECK (stage IN (
    'Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Hired', 'Rejected', 'Withdrawn'
  )),
  match_score INT NOT NULL DEFAULT 85,
  source VARCHAR(64) NOT NULL DEFAULT 'CareerSphere Gateway',
  personal_notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ----------------------------------------------------------------------------
-- 11 & 12. INTERVIEW PREPARATION, AI MOCK INTERVIEWS & CALENDAR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interview_schedules (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) REFERENCES applications(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  round_name VARCHAR(128) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  mode VARCHAR(32) NOT NULL DEFAULT 'Online' CHECK (mode IN ('Online', 'In-Person', 'Phone')),
  meeting_link VARCHAR(512),
  instructions TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled')),
  checklist JSONB,
  preparation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_mock_interviews (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role VARCHAR(128) NOT NULL,
  topic VARCHAR(64) NOT NULL CHECK (topic IN ('Technical', 'System Design', 'Behavioral STAR', 'DSA & Algorithms', 'HR Screening')),
  overall_score INT NOT NULL DEFAULT 0,
  clarity_score INT NOT NULL DEFAULT 0,
  technical_accuracy_score INT NOT NULL DEFAULT 0,
  feedback_summary TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13 & 14. CAREER ROADMAP, SKILL GAP & COURSES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role VARCHAR(128) NOT NULL,
  current_readiness_pct INT NOT NULL DEFAULT 70,
  missing_essential_skills TEXT[] NOT NULL,
  missing_optional_skills TEXT[] NOT NULL,
  milestones JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  skill_category VARCHAR(64) NOT NULL,
  provider VARCHAR(128) NOT NULL,
  url VARCHAR(512) NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  level VARCHAR(32) NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_hours INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16 & 17. NOTIFICATIONS & EMPLOYER MESSAGING
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL CHECK (type IN ('application_status', 'interview_invite', 'security_alert', 'job_match', 'ats_ready')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_messages (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type VARCHAR(16) NOT NULL CHECK (sender_type IN ('candidate', 'recruiter', 'system')),
  sender_name VARCHAR(128) NOT NULL,
  recipient_name VARCHAR(128) NOT NULL,
  job_id VARCHAR(64) REFERENCES jobs(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachment_url VARCHAR(512),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 24. STUDENT PLACEMENT & INTERNSHIP DRIVES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS placement_drives (
  id VARCHAR(64) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  role_title VARCHAR(255) NOT NULL,
  min_cgpa NUMERIC(3, 2) NOT NULL DEFAULT 6.5,
  allowed_branches TEXT[] NOT NULL,
  drive_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR(255) NOT NULL DEFAULT 'Virtual / Campus Hall',
  status VARCHAR(32) NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 25. ASSESSMENTS & PRACTICE TESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_title VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL CHECK (category IN ('Python Core', 'SQL & Databases', 'Data Structures', 'Logical Reasoning', 'Full Stack React')),
  score_pct INT NOT NULL CHECK (score_pct >= 0 AND score_pct <= 100),
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  weak_topics TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 27 & 29. SUPPORT TICKETS, FRAUD REPORTS & TRUST SAFETY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(64) NOT NULL CHECK (category IN ('Technical Problem', 'Fake Job Report', 'Suspicious Recruiter', 'Payment Demanded by Employer', 'Data Privacy', 'Feature Suggestion')),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  job_id VARCHAR(64),
  status VARCHAR(32) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS privacy_consents (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  analytics_consent BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  recruiter_discovery_consent BOOLEAN NOT NULL DEFAULT TRUE,
  data_export_requested_at TIMESTAMP WITH TIME ZONE,
  account_deletion_requested_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
