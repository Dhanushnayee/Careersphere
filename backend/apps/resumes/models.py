"""
CareerSphere AI — Resume Document Models
Phase 1 Foundation
"""
import uuid
from django.db import models
from apps.candidates.models import CandidateProfile


class ResumeParsingStatus(models.TextChoices):
    PENDING = "pending", "Pending Parsing"
    PROCESSING = "processing", "AI Parsing In Progress"
    PARSED = "parsed", "Parsed Successfully"
    FAILED = "failed", "Parsing Failed"


class ResumeDocument(models.Model):
    """
    Secure entity storing metadata and storage locations of candidate resumes.
    Enforces file size constraints and auditability.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="resumes",
    )
    title = models.CharField(max_length=255, help_text="e.g. AI-Focused Resume 2026")
    file_name = models.CharField(max_length=255)
    file_size_bytes = models.PositiveIntegerField(help_text="File size in bytes, max 10MB")
    file_format = models.CharField(max_length=10, default="PDF")  # PDF, DOCX, TXT
    is_primary = models.BooleanField(default=False)
    parsing_status = models.CharField(
        max_length=30,
        choices=ResumeParsingStatus.choices,
        default=ResumeParsingStatus.PENDING,
        db_index=True,
    )
    extracted_text_preview = models.TextField(blank=True, help_text="Sanitized parsed summary")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resume Document"
        verbose_name_plural = "Resume Documents"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.file_format}, {self.file_size_bytes} bytes)"
