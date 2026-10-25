from django.urls import path
from apps.recruiters.views import RecruiterPipelineBenchmarkView

urlpatterns = [
    path("recruiters/pipeline-status/", RecruiterPipelineBenchmarkView.as_view(), name="recruiter-pipeline-status"),
]
