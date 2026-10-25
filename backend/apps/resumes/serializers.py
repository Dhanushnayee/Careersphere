"""
CareerSphere AI — Resume Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.resumes.models import ResumeDocument


class ResumeDocumentSerializer(serializers.ModelSerializer):
    parsing_status_display = serializers.CharField(source="get_parsing_status_display", read_only=True)

    class Meta:
        model = ResumeDocument
        fields = [
            "uuid",
            "title",
            "file_name",
            "file_size_bytes",
            "file_format",
            "is_primary",
            "parsing_status",
            "parsing_status_display",
            "created_at",
        ]
        read_only_fields = ["uuid", "parsing_status", "created_at"]
