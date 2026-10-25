"""
CareerSphere AI — Accounts Models
Phase 1 Foundation
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    CANDIDATE = "candidate", "Candidate"
    RECRUITER = "recruiter", "Recruiter / Hiring Manager"
    ADMIN = "admin", "System Administrator"


class User(AbstractUser):
    """
    Primary custom user model for CareerSphere AI.
    Uses email as the unique identifier and supports role-based segregation.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CANDIDATE,
        db_index=True,
    )
    is_email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "User Account"
        verbose_name_plural = "User Accounts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
