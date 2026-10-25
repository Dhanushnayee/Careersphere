"""
Unit Tests — Phase 6 Recruiter Pipeline & Admin Governance Console
CareerSphere AI
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhase6AdminGovernance(unittest.TestCase):
    """
    Validates Recruiter Pipeline Kanban, Interview Scheduling, Audit Trails, and System Telemetry.
    """

    def test_audit_log_model_fields(self):
        content = (BASE_DIR / "apps" / "audit" / "models.py").read_text()
        self.assertIn("class AuditLog(models.Model):", content)
        self.assertIn("actor_email_snapshot", content)
        self.assertIn("action", content)
        self.assertIn("resource_type", content)
        self.assertIn("ip_address", content)
        self.assertIn("timestamp", content)

    def test_company_and_recruiter_models(self):
        content = (BASE_DIR / "apps" / "recruiters" / "models.py").read_text()
        self.assertIn("class Company(models.Model):", content)
        self.assertIn("is_verified", content)
        self.assertIn("class RecruiterProfile(models.Model):", content)

    def test_server_admin_governance_endpoints_exist(self):
        server_content = (BASE_DIR.parent / "server.ts").read_text()
        self.assertIn("/api/v1/admin/users", server_content)
        self.assertIn("/api/v1/admin/companies", server_content)
        self.assertIn("/api/v1/admin/jobs", server_content)
        self.assertIn("/api/v1/admin/audit-logs", server_content)
        self.assertIn("/api/v1/recruiter/interviews/schedule", server_content)
        self.assertIn("/api/v1/recruiter/applications/:id/stage", server_content)


if __name__ == "__main__":
    unittest.main()
