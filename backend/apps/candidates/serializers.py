"""
CareerSphere AI — Candidate Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.candidates.models import CandidateProfile
from apps.accounts.serializers import UserPublicSerializer


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "user",
            "headline",
            "target_role",
            "experience_years",
            "skills",
            "preferred_locations",
            "desired_salary_min",
            "desired_salary_currency",
            "github_url",
            "linkedin_url",
            "portfolio_url",
            "profile_completeness_pct",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
