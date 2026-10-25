"""
CareerSphere AI — Job Listing Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.jobs.models import JobListing
from apps.recruiters.serializers import CompanySerializer


class JobListingSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    workplace_type_display = serializers.CharField(source="get_workplace_type_display", read_only=True)
    employment_type_display = serializers.CharField(source="get_employment_type_display", read_only=True)

    class Meta:
        model = JobListing
        fields = [
            "uuid",
            "company",
            "title",
            "department",
            "workplace_type",
            "workplace_type_display",
            "employment_type",
            "employment_type_display",
            "location",
            "description",
            "skills_required",
            "salary_min",
            "salary_max",
            "salary_currency",
            "status",
            "applications_count",
            "created_at",
        ]
        read_only_fields = ["uuid", "applications_count", "created_at"]
