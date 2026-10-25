# CareerSphere AI — AI-Powered Job Application Platform

> **Production-Oriented Web Application with Full-Stack Architecture**  
> **Current Status: Phase 4 Complete** — AI Resume Analyzer, Resume Copilot Studio, Explainable Job Description Matching, Document Parsing & OCR Detection, and Draft Versioning.

---

## 1. Project Overview

CareerSphere AI is an intelligent full-stack career platform empowering candidates to evaluate and optimize resumes with AI, benchmark against real job requisitions, and apply through verified workflows. The platform provides dedicated role-based workspaces for:
- **Candidates**: Profile editor, PDF/DOCX resume management, AI ATS diagnostics, Job Description Matcher, Bullet Point Rewriter, Executive Summary Generator, and Draft Versioning.
- **Recruiters**: Company profiles, structured requisition publishing, pipeline Kanban stages, and Google Meet interview scheduling.
- **Administrators**: User directory & role management, company trust verification, job moderation queue, deep health probes, and SHA-256 immutable audit trails.

---

## 2. Phase 4 Implementation Details

### A. Secure Document Parsing & Scanned OCR Detection
- **Supported Formats**: `.pdf`, `.docx`, `.txt` validated by MIME type and file extension.
- **Governance**: Strict 10MB ceiling enforced per document; private candidate partition isolation.
- **Scanned OCR Detection**: Detects scanned or non-selectable image-only PDFs (`< 40` characters of extractable text) and gracefully reports `status: "NEEDS_OCR"` rather than faking extraction.
- **Sanitization**: Strips control characters, null bytes, embedded script tags, and prompt injection markers.

### B. AI Resume Analyzer
- **Section Completeness Audit**: Evaluates contact details, professional summary, work history, education, skills inventory, projects, and certifications.
- **Vague Phrasing Detector**: Flags generic duties (e.g. "Worked on...", "Helped with...") and suggests quantifiable impact statements.
- **Quantification Opportunities**: Pinpoints specific areas to add scale metrics, throughput numbers, and test coverage stats.
- **ATS & Relevance Scores**: Standardized scoring across ATS layout, structure, quantification, and role alignment.
- **Analysis History**: Persists audit logs for every analysis run.

### C. Explainable Job Description Matching Engine
- **Weighted Transparent Scoring**:
  - Required Skills Match: **40%**
  - Experience Level Alignment: **25%**
  - Academic Education: **15%**
  - Keywords & Responsibilities: **20%**
- **Actionable Gap Analysis**: Direct matched skills, missing requisitions, partial matches, and concrete recommendations.
- **Algorithmic Disclaimer**: Explicitly explains that the score is an estimate based on published criteria, not a guarantee of employer hiring decisions.

### D. AI Resume Copilot & Versioned Drafts
- **Bullet Rewriter**: Transforms bullet points into 3 variants (High-Impact Metrics, Architecture & Scale, Concise & Reliable) using power verbs.
- **Executive Summary Generator**: Generates concise, factual 3-sentence summaries based strictly on verified candidate profile credentials.
- **Job-Specific Drafts**: Create tailored resume drafts for target jobs, compare original master vs customized draft side-by-side, save revisions, and 1-click revert.

---

## 3. Configuration & Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server & Port Configuration
PORT=3000
NODE_ENV=development

# Google Gemini API Configuration (Phase 4)
# Used server-side via @google/genai TypeScript SDK
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Backend & Database Configuration
DATABASE_URL=postgres://careersphere:password@localhost:5432/careersphere_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=django-insecure-careersphere-ai-secret-key-phase4
```

> **Note on AI Resilience**: If `GEMINI_API_KEY` is not present or an API call times out, CareerSphere AI automatically falls back to its deterministic heuristic engine with identical schemas, ensuring zero disruption.

---

## 4. API Endpoints Reference (`/api/v1`)

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/v1/ai/analyze-resume` | Deep ATS diagnostics, completeness audit & vague bullets detection | Candidate / Admin |
| `POST` | `/api/v1/ai/match-job` | Explainable weighted job description matching | Candidate / Admin |
| `POST` | `/api/v1/ai/copilot-rewrite` | Experience bullet rewriter with power verbs | Candidate / Admin |
| `POST` | `/api/v1/ai/generate-summary` | Executive summary generator from verified profile | Candidate / Admin |
| `GET` | `/api/v1/ai/job-keywords/:jobId` | Extract high-value keywords and responsibilities | All |
| `GET` | `/api/v1/ai/analysis-history` | Past resume analysis audit history | Candidate |
| `GET` | `/api/v1/candidate/resumes/:id/drafts` | List tailored draft versions for a resume | Candidate |
| `POST` | `/api/v1/candidate/resumes/:id/drafts` | Create a new tailored resume draft version | Candidate |
| `PUT` | `/api/v1/candidate/resumes/:id/drafts/:draftId` | Save updates to a tailored resume draft | Candidate |
| `POST` | `/api/v1/candidate/resumes/:id/drafts/:draftId/revert`| Revert draft back to master resume content | Candidate |
| `POST` | `/api/v1/resumes/parse-file` | File parsing, size validation, and scanned OCR detection | Candidate |
| `GET` | `/api/v1/jobs` | Paginated faceted job discovery | All |
| `POST` | `/api/v1/applications/multi-apply` | Ethical multi-job batch application with consent gate | Candidate |
| `GET` | `/api/v1/admin/users` | User & recruiter directory | Admin |
| `PUT` | `/api/v1/admin/users/:id/role` | Instant RBAC role assignment | Admin |
| `PUT` | `/api/v1/admin/companies/:id/verify` | Enterprise company verification toggle | Admin |
| `PUT` | `/api/v1/admin/jobs/:id/moderation` | Job moderation status update | Admin |
| `GET` | `/api/v1/admin/audit-logs` | SHA-256 traceable immutable audit logs | All |
| `GET` | `/api/v1/common/health/deep/` | Deep infrastructure health probes | All |

---

## 5. Verification & Testing Commands

Execute the automated test suites from the project root:

```bash
# 1. Run full Python backend test suite (42 tests across all apps)
python3 backend/tests/runner.py

# 2. Run TypeScript linting across all frontend components
npm run lint

# 3. Compile and build the production bundle
npm run build

# 4. Start the full-stack development server
npm run dev
```

---

## 2. Seven-Milestone Development Roadmap

1. **Phase 1: Project Foundation & Initial Implementation** *(Current Phase - Fully Complete)*
   - Monorepo directory structure (`frontend/`, `backend/`, `docs/`, `docker-compose.yml`)
   - 10 modular Django applications (`accounts`, `candidates`, `recruiters`, `jobs`, `applications`, `resumes`, `ai_copilot`, `automation`, `notifications`, `audit`)
   - PostgreSQL & Redis configuration, Celery worker integration points, Docker Compose
   - Standardized API response envelopes, centralized exception handling, versioned `/api/v1/` routes
   - Polished SaaS React UI in Navy/Violet/Cyan design system:
     - Public Landing Page
     - Candidate Workspace (Resume upload & AI Copilot preview)
     - Recruiter Workspace (Pipeline metrics, job postings)
     - Administrator Hub (Health diagnostics, audit trail)
     - Interactive Architecture & OpenAPI Explorer
   - Unit test suite, automated syntax verification, and ZIP release packaging.

2. **Phase 2: Authentication & Role-Based Access Control** *(Next Milestone)*
   - Email OTP verification, JWT token sessions, candidate/recruiter/admin permission guards.

3. **Phase 3: Jobs & Applications Lifecycle Management**
   - Full CRUD job requisition portal, faceted search, candidate application tracking.

4. **Phase 4: AI Resume Analysis & Resume Copilot**
   - Full PDF/DOCX parsing, Google Gemini LLM scoring, keyword extraction, bullet rewrites.

5. **Phase 5: Job Application Automation & Safe Orchestration**
   - Official partner ATS API submissions (Greenhouse, Lever), consent enforcement, idempotency, and safe manual handoffs.

6. **Phase 6: Administration, Quality Assurance & Security Audit**
   - Moderation consoles, rate limiting, vulnerability scanning, end-to-end tests.

7. **Phase 7: Production Deployment & Release Packaging**
   - Cloud Run / Kubernetes deployment, CDN edge caching, final ZIP archive delivery.

---

## 3. Monorepo Structure

```
careersphere-ai/
├── .env.example                  # Comprehensive environment variables template
├── .dockerignore                 # Docker build ignore rules
├── .gitignore                    # Git version control exclusions
├── docker-compose.yml            # Multi-container orchestration (DB, Redis, Backend, Frontend)
├── README.md                     # Complete developer and setup guide
├── package.json                  # Node.js dependencies and scripts
├── vite.config.ts                # Vite configuration with Tailwind CSS
├── tsconfig.json                 # TypeScript compiler configuration
├── server.ts                     # Full-stack API & dev proxy server
│
├── docs/
│   ├── ARCHITECTURE.md           # System architecture blueprint & entity diagrams
│   └── API_SPEC.md               # OpenAPI specification for /api/v1/ routes
│
├── backend/                      # Python Django REST Framework Service
│   ├── Dockerfile                # Backend container image definition
│   ├── manage.py                 # Django management CLI
│   ├── requirements.txt          # Pinned Python package dependencies
│   ├── careersphere_ai/          # Core Django project configuration
│   │   ├── settings/
│   │   │   ├── base.py           # Shared settings, apps, logging, upload limits
│   │   │   ├── development.py    # Local settings (SQLite/PostgreSQL fallback, debug)
│   │   │   └── production.py     # Production settings (SSL, HSTS, secrets enforcement)
│   │   ├── asgi.py               # Asynchronous server entry point
│   │   ├── wsgi.py               # WSGI server entry point
│   │   ├── celery.py             # Celery distributed task queue configuration
│   │   └── urls.py               # Root URL router & OpenAPI documentation
│   ├── apps/
│   │   ├── common/               # Response envelopes, exception handler, health views
│   │   ├── accounts/             # Custom User model, UserRole enum
│   │   ├── candidates/           # CandidateProfile model, skills, target role
│   │   ├── recruiters/           # Company, RecruiterProfile models
│   │   ├── jobs/                 # JobListing, workplace & employment types
│   │   ├── applications/         # JobApplication tracking model
│   │   ├── resumes/              # ResumeDocument storage and 10MB upload limits
│   │   ├── ai_copilot/           # ResumeAnalysisResult model & schema contract
│   │   ├── automation/           # AutomationTask, consent rules, idempotency
│   │   ├── notifications/        # NotificationEvent model
│   │   └── audit/                # Immutable AuditLog model
│   └── tests/
│       ├── runner.py             # Autonomous test runner & Python syntax auditor
│       ├── test_health.py        # Health probe tests
│       ├── test_settings_security.py # Security header and settings tests
│       ├── test_models.py        # Domain model integrity tests
│       └── test_api_responses.py # API envelope contract tests
│
└── src/                          # Modern React 19 Frontend Client
    ├── main.tsx                  # React DOM mount point
    ├── App.tsx                   # App controller, role switcher, route coordinator
    ├── index.css                 # Tailwind CSS 4 setup & typography
    ├── types/                    # TypeScript interfaces for API & Domain models
    ├── services/                 # Typed API client with fallback resilience
    └── components/
        ├── common/               # Top bar, footer, buttons, cards, modals
        ├── landing/              # Hero, features, workflow, milestone tracker
        ├── dashboards/           # Candidate, Recruiter, and Admin dashboards
        └── architecture/         # Interactive system & schema inspector
```

---

## 4. Quickstart Guide

### Prerequisites
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: 18.x or 20.x+
- **Docker & Docker Compose** (optional for containerized run)
- **PostgreSQL 16+** & **Redis 7+** (or use Docker Compose)

---

### Option A: Local Development Setup (Manual)

#### 1. Configure Environment
Copy the `.env.example` template to `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS (Bash):**
```bash
cp .env.example .env
```

#### 2. Backend Setup (Django)

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Linux / macOS (Bash):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

#### 3. Frontend Setup (React & Vite)
In a separate terminal:

**Windows & Linux/macOS:**
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Option B: Docker Compose Setup (One-Command Launch)

To start the full stack including PostgreSQL, Redis, Django, Celery Worker, and React:

```bash
docker-compose up --build
```

Services launched:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
- **API Documentation**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

To stop services:
```bash
docker-compose down
```

---

## 5. Verification & Automated Testing

### 1. Run Backend Tests & Syntax Audit
Run the autonomous Python test suite:
```bash
python3 backend/tests/runner.py
```
*Executes all 17 unit tests and audits all 82 Python files for syntax errors.*

### 2. Run Frontend Checks & Production Build
```bash
npm run lint     # TypeScript type-checking
npm run build    # Production asset compilation
```

---

## 6. Troubleshooting

- **Database Connection Refused**:
  - In local development without PostgreSQL, the development settings automatically fall back to SQLite (`dev_careersphere.sqlite3`).
  - To connect to PostgreSQL, ensure Docker is running `docker-compose up postgres` or update `DB_HOST` in `.env`.
- **Port 3000 or 8000 in use**:
  - Check active processes:
    - On Linux/macOS: `lsof -i :3000` or `lsof -i :8000`
    - On Windows: `netstat -ano | findstr :3000`
- **CORS Errors**:
  - Verify that `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend origin (e.g., `http://localhost:3000`).

---

## 7. License & Credits

Built as part of CareerSphere AI Platform Architecture.  
All code licensed under the Apache 2.0 License.
