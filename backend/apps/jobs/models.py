"""
CareerSphere AI — Job Listing Models
Phase 1 Foundation
"""
import uuid
from django.db import models
from apps.recruiters.models import Company, RecruiterProfile


class WorkplaceType(models.TextChoices):
    REMOTE = "remote", "Remote"
    HYBRID = "hybrid", "Hybrid"
    ON_SITE = "on_site", "On-site"


class EmploymentType(models.TextChoices):
    FULL_TIME = "full_time", "Full-time"
    CONTRACT = "contract", "Contract"
    PART_TIME = "part_time", "Part-time"
    INTERNSHIP = "internship", "Internship"


class JobStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    PAUSED = "paused", "Paused"
    CLOSED = "closed", "Closed"


class JobListing(models.Model):
    """
    Standardized job vacancy entity supporting AI resume matching.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="job_listings")
    recruiter = models.ForeignKey(
        RecruiterProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posted_jobs",
    )
    title = models.CharField(max_length=255, db_index=True)
    department = models.CharField(max_length=100, blank=True)
    workplace_type = models.CharField(
        max_length=20,
        choices=WorkplaceType.choices,
        default=WorkplaceType.REMOTE,
    )
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME,
    )
    location = models.CharField(max_length=200, help_text="e.g. San Francisco, CA or Anywhere (US)")
    description = models.TextField(help_text="Detailed job description and requirements")
    skills_required = models.JSONField(default=list, help_text="Target skill tags for AI matching")
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default="USD")
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.ACTIVE,
        db_index=True,
    )
    applications_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Job Listing"
        verbose_name_plural = "Job Listings"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} at {self.company.name}"
