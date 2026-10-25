"""
CareerSphere AI — Candidate Domain Models
Phase 1 Foundation
"""
from django.conf import settings
from django.db import models


class CandidateProfile(models.Model):
    """
    Rich profile entity for job seekers and students.
    Holds career objectives, skill inventories, and discovery preferences.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
    )
    headline = models.CharField(max_length=255, blank=True)
    target_role = models.CharField(max_length=150, blank=True, db_index=True)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    skills = models.JSONField(default=list, help_text="List of normalized skill keywords")
    preferred_locations = models.JSONField(default=list)
    desired_salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    desired_salary_currency = models.CharField(max_length=10, default="USD")
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    profile_completeness_pct = models.PositiveSmallIntegerField(default=25)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Candidate Profile"
        verbose_name_plural = "Candidate Profiles"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.headline or 'Candidate Profile'}"
