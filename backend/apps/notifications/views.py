"""
CareerSphere AI — Notification Views
Phase 1 Foundation
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class NotificationStatusView(APIView):
    """
    Returns notification service infrastructure status.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="Notification Subsystem Status")
    def get(self, request):
        return success_response(
            data={
                "module": "notifications",
                "phase": "Phase 1 Foundation",
                "channels": ["In-App Realtime", "Transactional Email (SMTP/Console)", "Webhook Dispatches"],
            },
            message="Notification service schema ready.",
        )
