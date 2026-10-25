from django.urls import path
from apps.audit.views import RecentAuditLogsView

urlpatterns = [
    path("audit/logs/", RecentAuditLogsView.as_view(), name="recent-audit-logs"),
]
