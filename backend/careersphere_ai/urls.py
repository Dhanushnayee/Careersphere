"""
CareerSphere AI — Root URL Configuration
Phase 1 Foundation
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.common.views import RootHealthCheckView

urlpatterns = [
    # Infrastructure Health Check (Unauthenticated & Root)
    path("health/", RootHealthCheckView.as_view(), name="root-health"),

    # Django Administration
    path("admin/", admin.site.urls),

    # OpenAPI 3.0 Documentation Endpoints
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Versioned API Endpoints (v1)
    path("api/v1/", include("apps.common.urls")),
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.candidates.urls")),
    path("api/v1/", include("apps.recruiters.urls")),
    path("api/v1/", include("apps.jobs.urls")),
    path("api/v1/", include("apps.applications.urls")),
    path("api/v1/", include("apps.resumes.urls")),
    path("api/v1/", include("apps.ai_copilot.urls")),
    path("api/v1/", include("apps.automation.urls")),
    path("api/v1/", include("apps.notifications.urls")),
    path("api/v1/", include("apps.audit.urls")),
]
