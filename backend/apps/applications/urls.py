from django.urls import path
from apps.applications.views import ApplicationWorkflowBenchmarkView

urlpatterns = [
    path("applications/workflow-status/", ApplicationWorkflowBenchmarkView.as_view(), name="application-workflow-status"),
]
