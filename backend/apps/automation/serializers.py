"""
CareerSphere AI — Automation Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.automation.models import AutomationTask
from apps.jobs.serializers import JobListingSerializer


class AutomationTaskSerializer(serializers.ModelSerializer):
    job = JobListingSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = AutomationTask
        fields = [
            "uuid",
            "job",
            "portal_name",
            "portal_job_url",
            "is_official_api_supported",
            "candidate_consent_granted",
            "status",
            "status_display",
            "idempotency_key",
            "retry_count",
            "created_at",
        ]
        read_only_fields = ["uuid", "idempotency_key", "retry_count", "created_at"]
