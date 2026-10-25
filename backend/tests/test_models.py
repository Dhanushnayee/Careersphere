"""
Unit Tests — Domain Model Architecture
Phase 1 Foundation
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestModelArchitecture(unittest.TestCase):
    """
    Validates model declarations, foreign keys, and indexes across all domain apps.
    """

    def test_accounts_user_model(self):
        content = (BASE_DIR / "apps" / "accounts" / "models.py").read_text()
        self.assertIn("class User(AbstractUser):", content)
        self.assertIn("UserRole", content)
        self.assertIn("is_email_verified", content)
        self.assertIn("USERNAME_FIELD = \"email\"", content)

    def test_candidates_model(self):
        content = (BASE_DIR / "apps" / "candidates" / "models.py").read_text()
        self.assertIn("class CandidateProfile(models.Model):", content)
        self.assertIn("skills", content)
        self.assertIn("profile_completeness_pct", content)

    def test_recruiters_and_company_models(self):
        content = (BASE_DIR / "apps" / "recruiters" / "models.py").read_text()
        self.assertIn("class Company(models.Model):", content)
        self.assertIn("class RecruiterProfile(models.Model):", content)

    def test_jobs_model(self):
        content = (BASE_DIR / "apps" / "jobs" / "models.py").read_text()
        self.assertIn("class JobListing(models.Model):", content)
        self.assertIn("skills_required", content)
        self.assertIn("WorkplaceType", content)

    def test_applications_model(self):
        content = (BASE_DIR / "apps" / "applications" / "models.py").read_text()
        self.assertIn("class JobApplication(models.Model):", content)
        self.assertIn("unique_candidate_job_application", content)

    def test_resumes_model(self):
        content = (BASE_DIR / "apps" / "resumes" / "models.py").read_text()
        self.assertIn("class ResumeDocument(models.Model):", content)
        self.assertIn("file_size_bytes", content)
        self.assertIn("ResumeParsingStatus", content)

    def test_ai_copilot_model(self):
        content = (BASE_DIR / "apps" / "ai_copilot" / "models.py").read_text()
        self.assertIn("class ResumeAnalysisResult(models.Model):", content)
        self.assertIn("ats_score", content)

    def test_automation_model_compliance(self):
        content = (BASE_DIR / "apps" / "automation" / "models.py").read_text()
        self.assertIn("class AutomationTask(models.Model):", content)
        self.assertIn("candidate_consent_granted", content)
        self.assertIn("is_official_api_supported", content)
        self.assertIn("idempotency_key", content)

    def test_audit_model(self):
        content = (BASE_DIR / "apps" / "audit" / "models.py").read_text()
        self.assertIn("class AuditLog(models.Model):", content)
        self.assertIn("action", content)
        self.assertIn("timestamp", content)


if __name__ == "__main__":
    unittest.main()
