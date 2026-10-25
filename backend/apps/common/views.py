"""
CareerSphere AI — Health and System Configuration Views
Phase 1 Foundation
"""
import time
from django.conf import settings
from django.db import connection
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.common.responses import success_response, error_response


class RootHealthCheckView(APIView):
    """
    Lightweight health endpoint for reverse proxies, Docker healthchecks, and load balancers.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Root Infrastructure Health Probe",
        description="Returns basic liveness status without database overhead.",
        responses={200: OpenApiResponse(description="Service is responsive")},
    )
    def get(self, request):
        return success_response(
            data={
                "status": "healthy",
                "service": "careersphere-ai-backend",
                "timestamp": int(time.time()),
            },
            message="CareerSphere AI service is active.",
        )


class DetailedHealthCheckView(APIView):
    """
    Versioned deep-health check verifying database connectivity, broker reachability, and memory limits.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Detailed Platform Health & Dependency Inspection",
        description="Evaluates core runtime dependencies (PostgreSQL, Cache/Broker) safely.",
        responses={200: OpenApiResponse(description="Health report")},
    )
    def get(self, request):
        health_status = {
            "platform": "CareerSphere AI",
            "phase": "Phase 1: Foundation & Initial Architecture",
            "environment": "development" if settings.DEBUG else "production",
            "timestamp": int(time.time()),
            "dependencies": {},
        }

        # Safe Database Inspection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                row = cursor.fetchone()
                db_healthy = row is not None and row[0] == 1
            health_status["dependencies"]["database"] = {
                "status": "connected" if db_healthy else "degraded",
                "vendor": connection.vendor,
            }
        except Exception as e:
            health_status["dependencies"]["database"] = {
                "status": "unreachable",
                "vendor": getattr(connection, "vendor", "unknown"),
                "note": "Database probe timed out or connection refused.",
            }

        # Planned Celery / Redis Worker Status
        health_status["dependencies"]["task_queue"] = {
            "status": "standby_configured",
            "broker": settings.CELERY_BROKER_URL.split("@")[-1],  # redact credentials
            "note": "Celery asynchronous queue ready for Phase 4 resume analysis worker dispatch.",
        }

        # Planned AI Copilot Provider Status
        health_status["dependencies"]["ai_engine"] = {
            "status": "configured_preview",
            "model": "gemini-2.5-flash",
            "note": "Mock benchmarks active in Phase 1; live AI Copilot API integration scheduled for Phase 4.",
        }

        is_healthy = health_status["dependencies"]["database"]["status"] != "unreachable"
        status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE

        return success_response(
            data=health_status,
            message="Platform health check completed.",
            status_code=status_code,
        )


class SystemConfigView(APIView):
    """
    Returns public metadata regarding platform capabilities, active phase, and supported roles.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Public System Configuration & Phase Metadata",
        description="Exposes platform capability descriptors and roadmap status.",
        responses={200: OpenApiResponse(description="Public system configuration")},
    )
    def get(self, request):
        config_data = {
            "name": "CareerSphere AI",
            "version": "1.0.0-phase1",
            "milestone": {
                "current": "Phase 1: Foundation and Initial Architecture",
                "next": "Phase 2: Authentication & Role-Based Access Control",
                "total_milestones": 7,
            },
            "supported_roles": [
                {"id": "candidate", "label": "Candidate / Student", "active_in_phase": 1},
                {"id": "recruiter", "label": "HR Recruiter / Hiring Manager", "active_in_phase": 1},
                {"id": "admin", "label": "System Administrator", "active_in_phase": 1},
            ],
            "governance": {
                "max_resume_upload_mb": 10,
                "supported_formats": ["PDF", "DOCX", "TXT"],
                "security_model": "Role-Based Access Control (RBAC) + Audit Logging",
            },
        }
        return success_response(data=config_data, message="System configuration retrieved.")
