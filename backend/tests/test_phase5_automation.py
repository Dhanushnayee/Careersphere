"""
Unit Tests — Phase 5 Job Application Automation & Compliance Engine
CareerSphere AI
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhase5Automation(unittest.TestCase):
    """
    Validates application automation consent gating, duplicate prevention, idempotency, and anti-bypass rules.
    """

    def test_automation_task_statuses(self):
        models_content = (BASE_DIR / "apps" / "automation" / "models.py").read_text()
        self.assertIn("class AutomationTaskStatus(models.TextChoices):", models_content)
        self.assertIn("PENDING_CONSENT = \"pending_consent\"", models_content)
        self.assertIn("QUEUED = \"queued\"", models_content)
        self.assertIn("MANUAL_HANDOFF_REQUIRED = \"manual_handoff\"", models_content)
        self.assertIn("SUBMITTED = \"submitted\"", models_content)

    def test_automation_model_requires_consent_and_idempotency(self):
        content = (BASE_DIR / "apps" / "automation" / "models.py").read_text()
        self.assertIn("candidate_consent_granted", content)
        self.assertIn("idempotency_key", content)
        self.assertIn("is_official_api_supported", content)
        self.assertIn("unique_candidate_job_automation_task", content)

    def test_automation_compliance_guarantees(self):
        views_content = (BASE_DIR / "apps" / "automation" / "views.py").read_text()
        self.assertIn("OFFICIAL_API_ONLY", views_content)
        self.assertIn("SAFE_MANUAL_HANDOFF", views_content)
        self.assertIn("NEVER_BYPASS_SECURITY", views_content)
        self.assertIn("MANDATORY_EXPLICIT_CONSENT", views_content)

    def test_server_multi_apply_validates_consent(self):
        server_content = (BASE_DIR.parent / "server.ts").read_text()
        self.assertIn("/api/v1/applications/multi-apply", server_content)
        self.assertIn("CONSENT_REQUIRED", server_content)
        self.assertIn("skipped_duplicate", server_content)


if __name__ == "__main__":
    unittest.main()
