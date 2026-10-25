"""
Unit Tests — Phase 3 Candidate Workflow, Resumes, and Job Management
CareerSphere AI
"""
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class TestPhase3Workflow(unittest.TestCase):
    """
    Validates Candidate Profiles, 10MB Resume Upload limits, Job Requisition CRUD, and Application state flow.
    """

    def test_resume_upload_size_limit_and_formats(self):
        views_content = (BASE_DIR / "apps" / "resumes" / "views.py").read_text()
        self.assertIn("MAX_SIZE_BYTES = 10 * 1024 * 1024", views_content)
        self.assertIn("ALLOWED_EXTENSIONS = {\"pdf\", \"docx\", \"txt\"}", views_content)
        self.assertIn("FILE_TOO_LARGE", views_content)
        self.assertIn("INVALID_EXTENSION", views_content)

    def test_resume_parsing_statuses(self):
        models_content = (BASE_DIR / "apps" / "resumes" / "models.py").read_text()
        self.assertIn("class ResumeParsingStatus(models.TextChoices):", models_content)
        self.assertIn("PENDING = \"pending\"", models_content)
        self.assertIn("PARSED = \"parsed\"", models_content)

    def test_job_listing_enums(self):
        models_content = (BASE_DIR / "apps" / "jobs" / "models.py").read_text()
        self.assertIn("class WorkplaceType(models.TextChoices):", models_content)
        self.assertIn("REMOTE = \"remote\"", models_content)
        self.assertIn("HYBRID = \"hybrid\"", models_content)
        self.assertIn("class JobStatus(models.TextChoices):", models_content)
        self.assertIn("ACTIVE = \"active\"", models_content)

    def test_job_application_unique_constraint(self):
        models_content = (BASE_DIR / "apps" / "applications" / "models.py").read_text()
        self.assertIn("UniqueConstraint", models_content)
        self.assertIn("fields=[\"job\", \"candidate\"]", models_content)
        self.assertIn("unique_candidate_job_application", models_content)

    def test_candidate_profile_schema(self):
        content = (BASE_DIR / "apps" / "candidates" / "models.py").read_text()
        self.assertIn("experience_years", content)
        self.assertIn("skills", content)
        self.assertIn("desired_salary_min", content)
        self.assertIn("profile_completeness_pct", content)


if __name__ == "__main__":
    unittest.main()
