"""
CareerSphere AI — Job Application Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.applications.models import JobApplication
from apps.jobs.serializers import JobListingSerializer


class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobListingSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "uuid",
            "job",
            "status",
            "status_display",
            "match_score_snapshot",
            "notes",
            "applied_at",
            "updated_at",
        ]
        read_only_fields = ["uuid", "applied_at", "updated_at"]
