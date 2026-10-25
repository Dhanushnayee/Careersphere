"""
CareerSphere AI — Recruiter Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.recruiters.models import Company, RecruiterProfile
from apps.accounts.serializers import UserPublicSerializer


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "slug",
            "website",
            "industry",
            "size_range",
            "headquarters",
            "is_verified",
            "created_at",
        ]


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            "id",
            "user",
            "company",
            "title",
            "department",
            "is_admin",
            "created_at",
        ]
