"""
CareerSphere AI — Recruiter Views
Phase 1 Foundation
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class RecruiterPipelineBenchmarkView(APIView):
    """
    Returns pipeline architecture metadata for Recruiter workspace.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="Recruiter Pipeline Architecture Status")
    def get(self, request):
        return success_response(
            data={
                "workspace": "recruiter",
                "phase": "Phase 1 Foundation",
                "pipeline_stages": [
                    "Sourcing & Inbound",
                    "AI Resume Screening",
                    "Technical Interview",
                    "Final Decision",
                    "Offer Extended",
                ],
            },
            message="Recruiter workspace architecture verified.",
        )
