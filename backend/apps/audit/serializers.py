"""
CareerSphere AI — Audit Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.audit.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "uuid",
            "actor_email_snapshot",
            "action",
            "resource_type",
            "resource_id",
            "ip_address",
            "metadata",
            "timestamp",
        ]
        read_only_fields = fields
