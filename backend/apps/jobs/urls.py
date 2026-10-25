from django.urls import path
from apps.jobs.views import SampleJobsListView

urlpatterns = [
    path("jobs/sample/", SampleJobsListView.as_view(), name="sample-jobs-list"),
]
