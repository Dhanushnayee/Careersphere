"""
CareerSphere AI — Security Audit Models
Phase 1 Foundation
"""
import uuid
from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """
    Immutable audit trail for compliance, role actions, and platform governance.
    """
    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_records",
    )
    actor_email_snapshot = models.EmailField(blank=True)
    action = models.CharField(max_length=100, db_index=True)  # e.g. "USER_LOGIN", "RESUME_UPLOAD", "JOB_CREATED"
    resource_type = models.CharField(max_length=100, db_index=True)
    resource_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-timestamp"]

    def __str__(self):
        actor_str = self.actor_email_snapshot or (self.actor.email if self.actor else "Anonymous")
        return f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] {actor_str} -> {self.action} on {self.resource_type}"
