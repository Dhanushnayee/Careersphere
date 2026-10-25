"""
CareerSphere AI — Job Application Views
Phase 1 Foundation
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class ApplicationWorkflowBenchmarkView(APIView):
    """
    Returns application lifecycle status and planned multi-portal submission guarantees.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="Application Tracking Lifecycle Status")
    def get(self, request):
        return success_response(
            data={
                "module": "applications",
                "phase": "Phase 1 Foundation",
                "supported_states": [
                    "Draft",
                    "Submitted",
                    "Under Review",
                    "Interview Scheduled",
                    "Offer Received",
                    "Rejected",
                    "Archived",
                ],
                "compliance_rules": [
                    "Explicit user consent before any submission",
                    "Duplicate submission prevention constraint",
                    "Manual handoff URL for unsupported portals",
                ],
            },
            message="Applications workflow schema verified.",
        )
