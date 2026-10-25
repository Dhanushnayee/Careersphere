"""
CareerSphere AI — Job Application Models
Phase 1 Foundation
"""
import uuid
from django.db import models
from apps.candidates.models import CandidateProfile
from apps.jobs.models import JobListing


class ApplicationStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SUBMITTED = "submitted", "Submitted"
    UNDER_REVIEW = "under_review", "Under Review"
    INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
    OFFER_RECEIVED = "offer_received", "Offer Received"
    REJECTED = "rejected", "Rejected"
    ARCHIVED = "archived", "Archived"


class JobApplication(models.Model):
    """
    Tracks application workflow, match scores at submission, and candidate progress.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name="applications")
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name="applications")
    status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.SUBMITTED,
        db_index=True,
    )
    match_score_snapshot = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text="Calculated match percentage at time of application submission",
    )
    notes = models.TextField(blank=True, help_text="Candidate or recruiter workflow notes")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["job", "candidate"],
                name="unique_candidate_job_application",
            )
        ]

    def __str__(self):
        return f"{self.candidate.user.email} -> {self.job.title} ({self.get_status_display()})"
