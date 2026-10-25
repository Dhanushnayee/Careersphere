"""
CareerSphere AI — Automation Compliance Views
Phase 1 Foundation
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class AutomationGuaranteesView(APIView):
    """
    Exposes application orchestration security guidelines and non-bypass rules.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="Application Automation Compliance Contract")
    def get(self, request):
        return success_response(
            data={
                "module": "automation_orchestrator",
                "phase": "Phase 1 Foundation (Multi-portal automation scheduled for Phase 5)",
                "governing_principles": [
                    {
                        "rule": "OFFICIAL_API_ONLY",
                        "description": "Automatic dispatch only occurs over verified, officially supported partner APIs.",
                    },
                    {
                        "rule": "SAFE_MANUAL_HANDOFF",
                        "description": "For third-party portals without official APIs, a safe manual completion link directs the candidate to the official career portal.",
                    },
                    {
                        "rule": "NEVER_BYPASS_SECURITY",
                        "description": "Platform strictly prohibits bypassing OTP, MFA, CAPTCHA, access controls, or rate limits.",
                    },
                    {
                        "rule": "VERIFIABLE_SUBMISSION_CONFIRMATION",
                        "description": "An application is NEVER marked submitted unless the destination API confirms receipt with a valid transaction ID.",
                    },
                    {
                        "rule": "MANDATORY_EXPLICIT_CONSENT",
                        "description": "Every single job application requires candidate pre-review and cryptographic or digital consent.",
                    },
                ],
            },
            message="Automation safety guidelines active.",
        )
