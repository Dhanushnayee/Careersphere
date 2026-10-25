"""
CareerSphere AI — Common URLs
"""
from django.urls import path
from apps.common.views import RootHealthCheckView, DetailedHealthCheckView, SystemConfigView

urlpatterns = [
    path("health/", DetailedHealthCheckView.as_view(), name="api-health"),
    path("system/config/", SystemConfigView.as_view(), name="system-config"),
]
