"""
CareerSphere AI — Recruiter and Company Models
Phase 1 Foundation
"""
from django.conf import settings
from django.db import models


class Company(models.Model):
    """
    Hiring organization entity.
    """
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    size_range = models.CharField(max_length=50, blank=True)  # e.g., '51-200 employees'
    headquarters = models.CharField(max_length=200, blank=True)
    logo_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ["name"]

    def __str__(self):
        return self.name


class RecruiterProfile(models.Model):
    """
    Profile for talent acquisition professionals and hiring managers.
    """
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recruiter_profile",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recruiters",
    )
    title = models.CharField(max_length=150, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_admin = models.BooleanField(default=False, help_text="Can manage company seat licenses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Recruiter Profile"
        verbose_name_plural = "Recruiter Profiles"
        ordering = ["-created_at"]

    def __str__(self):
        comp = self.company.name if self.company else "Independent"
        return f"{self.user.email} ({self.title or 'Recruiter'} at {comp})"
