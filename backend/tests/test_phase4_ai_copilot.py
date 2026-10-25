"""
Unit Tests — Phase 4 AI Resume Intelligence & Resume Copilot
CareerSphere AI
"""
import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from apps.resumes.parser import ResumeParserService, ResumeParsingError
from apps.ai_copilot.services import ResumeAnalyzerService


class TestPhase4AiCopilot(unittest.TestCase):
    """
    Validates AI Resume Copilot schema definitions, ATS bounds, keyword gap analysis,
    scanned OCR detection, job description matching, and bullet rewriters.
    """

    def test_resume_analysis_result_model_fields(self):
        content = (BASE_DIR / "apps" / "ai_copilot" / "models.py").read_text()
        self.assertIn("class ResumeAnalysisResult(models.Model):", content)
        self.assertIn("ats_score", content)
        self.assertIn("quantification_score", content)
        self.assertIn("bullet_relevance_score", content)
        self.assertIn("missing_skills", content)
        self.assertIn("matched_skills", content)
        self.assertIn("strengths", content)
        self.assertIn("improvements", content)

    def test_copilot_contract_view_contains_benchmarks(self):
        content = (BASE_DIR / "apps" / "ai_copilot" / "views.py").read_text()
        self.assertIn("ats_score", content)
        self.assertIn("quantification_score", content)
        self.assertIn("bullet_relevance_score", content)
        self.assertIn("matched_skills", content)
        self.assertIn("missing_skills", content)

    def test_server_gemini_integration_exists(self):
        server_content = (BASE_DIR.parent / "server.ts").read_text()
        self.assertIn("from '@google/genai'", server_content)
        self.assertIn("ai.models.generateContent", server_content)
        self.assertIn("gemini-3.8-flash", server_content)
        self.assertIn("/api/v1/ai/analyze-resume", server_content)
        self.assertIn("/api/v1/ai/copilot-rewrite", server_content)
        self.assertIn("/api/v1/ai/match-job", server_content)
        self.assertIn("/api/v1/ai/generate-summary", server_content)
        self.assertIn("/api/v1/candidate/resumes/:id/drafts", server_content)

    def test_resume_parser_file_validation(self):
        # Unsupported format check
        with self.assertRaises(ResumeParsingError):
            ResumeParserService.validate_file("malicious.exe", 1024)

        # File size limit check (> 10MB)
        with self.assertRaises(ResumeParsingError):
            ResumeParserService.validate_file("resume.pdf", 11 * 1024 * 1024)

        # Valid file
        try:
            ResumeParserService.validate_file("valid_resume.pdf", 250000)
        except ResumeParsingError:
            self.fail("ResumeParserService.validate_file raised ResumeParsingError unexpectedly!")

    def test_resume_parser_scanned_ocr_detection(self):
        # Text with < 40 chars should be flagged as NEEDS_OCR
        tiny_pdf_bytes = b"%PDF-1.4 header with no real text content"
        result = ResumeParserService.parse_document("scanned_receipt.pdf", tiny_pdf_bytes)
        self.assertEqual(result["status"], "NEEDS_OCR")
        self.assertTrue(result["is_scanned"])
        self.assertIn("Optical Character Recognition (OCR) is required", result["message"])

    def test_section_completeness_auditing(self):
        sample_resume = """
        Alex Chen | alex@example.com | +1 555-234-5678
        SUMMARY: Senior AI Systems Architect with 6+ years experience.
        EXPERIENCE: Lead Engineer at Cloud Systems. Built Django APIs.
        EDUCATION: B.S. in Computer Science from UC Berkeley.
        SKILLS: Python, Django, React, PostgreSQL.
        PROJECTS: CareerSphere AI platform.
        CERTIFICATIONS: AWS Certified Solutions Architect.
        """
        audit = ResumeAnalyzerService.audit_section_completeness(sample_resume)
        self.assertEqual(audit["contact"]["status"], "complete")
        self.assertEqual(audit["summary"]["status"], "complete")
        self.assertEqual(audit["experience"]["status"], "complete")
        self.assertEqual(audit["education"]["status"], "complete")
        self.assertEqual(audit["skills"]["status"], "complete")
        self.assertEqual(audit["projects"]["status"], "complete")
        self.assertEqual(audit["certifications"]["status"], "complete")

    def test_explainable_job_matching(self):
        sample_resume = "Expert in Python, Django REST Framework, Docker, and PostgreSQL. Senior Architect with 6 years experience."
        job_skills = ["Python", "Django REST Framework", "Docker", "Kubernetes", "PostgreSQL"]
        job_requirements = ["5+ years experience building distributed backends", "Experience with Docker containers"]

        result = ResumeAnalyzerService.match_job_description(
            resume_text=sample_resume,
            job_id="job_01",
            job_title="Senior AI Systems Architect",
            company_name="Synthetix Dynamics",
            required_skills=job_skills,
            requirements=job_requirements,
        )

        self.assertGreaterEqual(result["matchScore"], 70)
        self.assertIn("Python", result["matchedSkills"])
        self.assertIn("Kubernetes", result["missingSkills"])
        self.assertIn("requiredSkills", result["criteriaBreakdown"])
        self.assertIn("experience", result["criteriaBreakdown"])
        self.assertIn("education", result["criteriaBreakdown"])
        self.assertIn("keywords", result["criteriaBreakdown"])
        self.assertIn("disclaimer", result)

    def test_bullet_point_rewriter(self):
        original = "Helped build backend APIs with Django."
        res = ResumeAnalyzerService.rewrite_bullet(original)
        self.assertGreaterEqual(len(res["improvedBullets"]), 3)
        self.assertIn("Architected", res["powerVerbsUsed"])
        self.assertIn("targetedSkillAlignment", res)


if __name__ == "__main__":
    unittest.main()
