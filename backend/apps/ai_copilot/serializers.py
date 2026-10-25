"""
CareerSphere AI — AI Copilot Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.ai_copilot.models import ResumeAnalysisResult


class ResumeAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysisResult
        fields = [
            "uuid",
            "target_job_title",
            "ats_score",
            "quantification_score",
            "bullet_relevance_score",
            "strengths",
            "improvements",
            "missing_skills",
            "matched_skills",
            "model_version",
            "created_at",
        ]
        read_only_fields = fields
