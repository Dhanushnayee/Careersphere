# CareerSphere AI — API Specification (Phase 1)
**Base URL:** `/api/v1/`  
**Root Health:** `/health/`  
**OpenAPI Docs:** `/api/docs/` (Swagger UI) & `/api/redoc/` (ReDoc)  

---

## Standard JSON Response Envelopes

### Success Envelope (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": { ... }
}
```

### Error Envelope (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_IDENTIFIER",
    "message": "Human-readable description of error.",
    "details": { ... }
  }
}
```

---

## Core Endpoints in Phase 1

### 1. Root Health Check
- **Endpoint:** `GET /health/`
- **Authentication:** None (Public)
- **Response:**
```json
{
  "success": true,
  "message": "CareerSphere AI service is active.",
  "data": {
    "status": "healthy",
    "service": "careersphere-ai-backend",
    "timestamp": 1742083200
  }
}
```

### 2. Versioned Detailed Health & Dependency Probe
- **Endpoint:** `GET /api/v1/health/`
- **Authentication:** None (Public)
- **Response:**
```json
{
  "success": true,
  "message": "Platform health check completed.",
  "data": {
    "platform": "CareerSphere AI",
    "phase": "Phase 1: Foundation & Initial Architecture",
    "environment": "development",
    "timestamp": 1742083200,
    "dependencies": {
      "database": {
        "status": "connected",
        "vendor": "postgresql"
      },
      "task_queue": {
        "status": "standby_configured",
        "broker": "localhost:6379/1"
      },
      "ai_engine": {
        "status": "configured_preview",
        "model": "gemini-2.5-flash"
      }
    }
  }
}
```

### 3. Public System Metadata & Capabilities
- **Endpoint:** `GET /api/v1/system/config/`
- **Authentication:** None (Public)
- **Response:**
```json
{
  "success": true,
  "message": "System configuration retrieved.",
  "data": {
    "name": "CareerSphere AI",
    "version": "1.0.0-phase1",
    "milestone": {
      "current": "Phase 1: Foundation and Initial Architecture",
      "next": "Phase 2: Authentication & Role-Based Access Control",
      "total_milestones": 7
    },
    "supported_roles": [
      {"id": "candidate", "label": "Candidate / Student", "active_in_phase": 1},
      {"id": "recruiter", "label": "HR Recruiter / Hiring Manager", "active_in_phase": 1},
      {"id": "admin", "label": "System Administrator", "active_in_phase": 1}
    ],
    "governance": {
      "max_resume_upload_mb": 10,
      "supported_formats": ["PDF", "DOCX", "TXT"],
      "security_model": "Role-Based Access Control (RBAC) + Audit Logging"
    }
  }
}
```

### 4. Sample Benchmark Job Listings
- **Endpoint:** `GET /api/v1/jobs/sample/`
- **Authentication:** None (Public Benchmark)
- **Response:** Array of job listings with skill tags, salary bands, and workplace types.

### 5. Resume Document Pre-Upload Validation
- **Endpoint:** `POST /api/v1/resumes/upload-preview/`
- **Payload:** `multipart/form-data` with `file` and optional `title`.
- **Validation Rules:**
  - File size must be `<= 10MB` (`10,485,760` bytes).
  - Format must be `PDF`, `DOCX`, or `TXT`.

### 6. Recent Platform Audit Events
- **Endpoint:** `GET /api/v1/audit/logs/`
- **Authentication:** None (Demo Administrator preview in Phase 1)
- **Response:** Array of immutable system and administrative audit records.
