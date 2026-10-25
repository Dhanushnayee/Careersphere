"""
CareerSphere AI — Audit Views
Phase 1 Foundation
"""
import time
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from apps.common.responses import success_response


class RecentAuditLogsView(APIView):
    """
    Returns recent system audit events for the Administrator dashboard.
    Demonstrates compliance monitoring, session security, and role activity.
    """
    permission_classes = [AllowAny]

    @extend_schema(summary="Recent Platform Audit Events (Admin Preview)")
    def get(self, request):
        now = int(time.time())
        sample_logs = [
            {
                "id": "aud_01",
                "action": "SYSTEM_BOOTSTRAP",
                "resource_type": "Infrastructure",
                "actor": "system.orchestrator@careersphere.internal",
                "ip_address": "127.0.0.1",
                "timestamp_seconds_ago": 120,
                "status": "SUCCESS",
                "summary": "Django REST v1 endpoints initialized with PostgreSQL and Redis connections.",
            },
            {
                "id": "aud_02",
                "action": "CONFIG_INSPECTION",
                "resource_type": "SecuritySettings",
                "actor": "admin@careersphere.ai",
                "ip_address": "192.168.1.10",
                "timestamp_seconds_ago": 360,
                "status": "SUCCESS",
                "summary": "Verified CORS origin whitelist, strict HTTPS headers, and 10MB upload limits.",
            },
            {
                "id": "aud_03",
                "action": "BENCHMARK_VALIDATION",
                "resource_type": "AiCopilotContract",
                "actor": "automated.test_runner@careersphere.internal",
                "ip_address": "10.0.4.22",
                "timestamp_seconds_ago": 720,
                "status": "SUCCESS",
                "summary": "Executed baseline health check and OpenAPI 3.1 schema consistency checks.",
            },
            {
                "id": "aud_04",
                "action": "COMPLIANCE_POLICY_CHECK",
                "resource_type": "AutomationOrchestrator",
                "actor": "security.compliance@careersphere.ai",
                "ip_address": "192.168.1.15",
                "timestamp_seconds_ago": 1440,
                "status": "SUCCESS",
                "summary": "Validated candidate consent gates and manual fallback requirements.",
            },
        ]
        return success_response(
            data={"logs": sample_logs, "count": len(sample_logs), "is_demo": True},
            message="Recent audit events retrieved.",
        )
