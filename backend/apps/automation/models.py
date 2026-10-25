"""
CareerSphere AI — Job Application Automation Models
Phase 1 Foundation
"""
import uuid
from django.db import models
from apps.candidates.models import CandidateProfile
from apps.jobs.models import JobListing


class AutomationTaskStatus(models.TextChoices):
    PENDING_CONSENT = "pending_consent", "Awaiting Candidate Consent"
    QUEUED = "queued", "Queued for Official API Submission"
    MANUAL_HANDOFF_REQUIRED = "manual_handoff", "Manual Completion Required (External Portal)"
    SUBMITTED = "submitted", "Confirmed Submitted by Official API"
    FAILED = "failed", "Submission Failed"
    CANCELLED = "cancelled", "Cancelled by Candidate"


class AutomationTask(models.Model):
    """
    Guarantees compliant multi-job application orchestration.
    Enforces candidate consent, duplicate prevention, idempotency, and safe manual handoff.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="automation_tasks",
    )
    job = models.ForeignKey(
        JobListing,
        on_delete=models.CASCADE,
        related_name="automation_tasks",
    )
    portal_name = models.CharField(max_length=100, help_text="e.g. Greenhouse, Lever, Workday, LinkedIn")
    portal_job_url = models.URLField(max_length=500)
    is_official_api_supported = models.BooleanField(
        default=False,
        help_text="True if submission is handled through a verified ATS partner API; False triggers manual handoff.",
    )
    candidate_consent_granted = models.BooleanField(
        default=False,
        help_text="Submission can never proceed without explicit true consent.",
    )
    status = models.CharField(
        max_length=30,
        choices=AutomationTaskStatus.choices,
        default=AutomationTaskStatus.PENDING_CONSENT,
        db_index=True,
    )
    idempotency_key = models.CharField(max_length=128, unique=True, db_index=True)
    retry_count = models.PositiveSmallIntegerField(default=0)
    max_retries = models.PositiveSmallIntegerField(default=3)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Automation Task"
        verbose_name_plural = "Automation Tasks"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["candidate", "job"],
                name="unique_candidate_job_automation_task",
            )
        ]

    def __str__(self):
        return f"Automation {self.portal_name} for {self.candidate.user.email} [{self.status}]"
