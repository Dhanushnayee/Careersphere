"""
CareerSphere AI — Candidate Views
Phase 3 Candidate Workflow & Profile Engine
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response, error_response
from apps.candidates.models import CandidateProfile
from apps.candidates.serializers import CandidateProfileSerializer


class CandidateBenchmarkView(APIView):
    """Returns baseline demonstration data and schema benchmarks for Candidate workspace."""
    permission_classes = [AllowAny]

    @extend_schema(summary="Candidate Workspace Baseline Schema")
    def get(self, request):
        return success_response(
            data={
                "workspace": "candidate",
                "phase": "Phase 3 Candidate & Student Hub",
                "features_active": [
                    "Resume document storage schema",
                    "Skills inventory architecture",
                    "AI copilot payload definitions",
                    "Application tracking data model",
                ],
            },
            message="Candidate workspace architecture active.",
        )


class CandidateProfileDetailView(APIView):
    """Retrieves and updates the authenticated candidate's profile."""
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get Candidate Profile")
    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(
            user=request.user,
            defaults={
                "headline": "Software Engineer & AI Enthusiast",
                "target_role": "Full-Stack Engineer",
                "skills": ["Python", "Django", "React", "TypeScript", "PostgreSQL"],
                "profile_completeness_pct": 75,
            },
        )
        serializer = CandidateProfileSerializer(profile)
        return success_response(data={"profile": serializer.data}, message="Candidate profile retrieved.")

    @extend_schema(summary="Update Candidate Profile", request=CandidateProfileSerializer)
    def put(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(data={"profile": serializer.data}, message="Candidate profile updated successfully.")
        return error_response(code="VALIDATION_ERROR", message="Invalid profile payload.", details=serializer.errors)
