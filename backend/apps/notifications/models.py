"""
CareerSphere AI — Notification Models
Phase 1 Foundation
"""
import uuid
from django.conf import settings
from django.db import models


class NotificationCategory(models.TextChoices):
    SYSTEM = "system", "System Update"
    JOB_MATCH = "job_match", "Job Match Alert"
    APPLICATION = "application", "Application Activity"
    RESUME_COPILOT = "resume_copilot", "Resume Copilot Report"
    SECURITY = "security", "Security & Audit"


class NotificationEvent(models.Model):
    """
    In-app and transactional notification logs.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(
        max_length=30,
        choices=NotificationCategory.choices,
        default=NotificationCategory.SYSTEM,
        db_index=True,
    )
    is_read = models.BooleanField(default=False, db_index=True)
    action_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification Event"
        verbose_name_plural = "Notification Events"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.category}] {self.title} to {self.user.email}"
