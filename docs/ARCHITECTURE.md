# CareerSphere AI — System Architecture Document
**Milestone:** Phase 1 Foundation and Initial Implementation  
**Status:** Implemented & Verified  

---

## 1. Executive Overview

CareerSphere AI is an enterprise-grade, full-stack recruitment platform and candidate career copilot. The platform unites three primary user roles:
1. **Candidates & Students**: Discover positions matched by semantic AI algorithms, optimize resumes against target job descriptions, track applications across companies, and dispatch automated submissions to partner APIs.
2. **HR Recruiters & Hiring Managers**: Publish requisitions, review ranked talent pipelines, inspect AI-generated candidate match scores, and manage hiring stages.
3. **System Administrators**: Audit security logs, monitor infrastructure health, inspect moderation queues, and enforce platform governance.

---

## 2. Seven-Milestone Roadmap

CareerSphere AI is engineered according to a disciplined seven-milestone progression:

| Milestone | Phase Name | Focus & Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Project Foundation & Initial Implementation** | Monorepo layout, Django modular app architecture, models, settings, health checks, React UI, Docker orchestration, OpenAPI spec, tests. | **COMPLETED** |
| **Phase 2** | **Authentication & Role-Based Access Control** | Custom User model activation, email OTP verification, JWT session tokens, Candidate/HR/Admin permissions, rate-limiting. | Planned |
| **Phase 3** | **Jobs & Application Lifecycle Management** | Full CRUD for job postings, search & facet indexing, candidate application workflows, recruiter pipeline funnel. | Planned |
| **Phase 4** | **AI Resume Analysis & Resume Copilot** | Document parsing (PDF/DOCX), Google Gemini model integration, ATS scoring, skill-gap extraction, context-aware rewriting. | Planned |
| **Phase 5** | **Application Automation & Orchestration** | Verified partner ATS API dispatch (Greenhouse, Lever), candidate consent gating, idempotency, safe manual handoff links for unsupported portals. | Planned |
| **Phase 6** | **Administration, Quality Assurance & Audit** | Moderation consoles, comprehensive security log auditing, end-to-end load testing, rate limiting, and compliance verification. | Planned |
| **Phase 7** | **Production Deployment & Release Delivery** | Cloud Run / Kubernetes deployment manifests, production SSL, CDN caching, final release verification. | Planned |

---

## 3. High-Level System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion (Port 3000)          |
|  - Public Landing Page                                                            |
|  - Candidate Workspace (Resume Copilot Preview, Job Recommendations)              |
|  - HR Recruiter Workspace (Requisitions, Pipeline Funnel, Candidate Scoring)     |
|  - Admin Hub (System Health, Audit Logs, Moderation Queue)                        |
|  - Architecture & OpenAPI Live Inspector                                          |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / REST JSON (/api/v1/)
                                           v
+-----------------------------------------------------------------------------------+
|                            APPLICATION API GATEWAY                                |
|  Django REST Framework (Port 8000) / Full-Stack Proxy Router                      |
|  - Root Health Probe: /health/                                                    |
|  - Detailed Health & Dependencies: /api/v1/health/                                |
|  - System Metadata: /api/v1/system/config/                                        |
|  - API Docs (OpenAPI / Swagger / Redoc): /api/docs/                               |
|  - Exception Handling Envelope: { success, data, error, meta }                    |
+--------------------+---------------------+--------------------+-------------------+
                     |                     |                    |
                     v                     v                    v
+--------------------+----+  +-------------+------+  +----------+-------------------+
|   ACCOUNTS & RBAC       |  |  RECRUITMENT CORE  |  |    INTELLIGENCE & AUDIT      |
|  - apps.accounts        |  |  - apps.recruiters |  |  - apps.resumes (<=10MB docs)|
|  - apps.candidates      |  |  - apps.jobs       |  |  - apps.ai_copilot (Gemini)  |
|  - apps.notifications   |  |  - apps.apps       |  |  - apps.automation (Consent) |
|                         |  |                    |  |  - apps.audit (Immutable)    |
+--------------------+----+  +-------------+------+  +----------+-------------------+
                     |                     |                    |
                     +---------------------+--------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                             DATA & ASYNC TASK LAYER                               |
|  - PostgreSQL 16: Relational store with foreign keys, constraints & indexes       |
|  - Redis 7.2: Session cache and Celery distributed message broker                 |
|  - Celery Worker: Background task queue for document parsing & AI processing      |
+-----------------------------------------------------------------------------------+
```

---

## 4. Database Entity-Relationship Architecture

All entities use standardized primary keys, UUID references, created/updated timestamps, and strict relational integrity:

1. **User (accounts)**: Base identity supporting `candidate`, `recruiter`, and `admin` roles.
2. **CandidateProfile (candidates)**: One-to-one with User. Contains normalized skills, career goals, completeness score.
3. **Company (recruiters)**: Organization profile with verification status and industry classification.
4. **RecruiterProfile (recruiters)**: Links User to Company with role privileges.
5. **JobListing (jobs)**: Standardized job vacancy with required skills, workplace type (Remote/Hybrid/On-site), and salary ranges.
6. **JobApplication (applications)**: Links CandidateProfile to JobListing. Has a unique constraint on `(job, candidate)` to prevent duplicate submissions.
7. **ResumeDocument (resumes)**: Enforces 10MB limit and stores format (PDF/DOCX/TXT) and parsing status.
8. **ResumeAnalysisResult (ai_copilot)**: Holds ATS scores, matched vs missing skills, and improvement recommendations.
9. **AutomationTask (automation)**: Enforces candidate consent, idempotency key, and official API support verification.
10. **AuditLog (audit)**: Immutable log capturing actor, action, resource type, IP address, and payload metadata.

---

## 5. Security & Automation Safety Policy

CareerSphere AI enforces strict compliance rules:
- **No Mock Bypasses**: The platform will never attempt to bypass OTP, MFA, CAPTCHA, or third-party portal authentication.
- **Explicit Consent**: Applications will never be submitted automatically without positive candidate consent.
- **Official API Gateway**: Applications can only be programmatically submitted via verified partner APIs (e.g. Greenhouse Harvest, Lever Postings API).
- **Safe Fallback**: Any job vacancy on an unsupported external portal provides a verified manual handoff link.
- **Least-Privilege Secret Management**: Production settings refuse to start if default keys are detected.
