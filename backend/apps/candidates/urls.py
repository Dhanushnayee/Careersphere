from django.urls import path
from apps.candidates.views import CandidateBenchmarkView, CandidateProfileDetailView

urlpatterns = [
    path("candidates/benchmark/", CandidateBenchmarkView.as_view(), name="candidate-benchmark"),
    path("candidate/profile/", CandidateProfileDetailView.as_view(), name="candidate-profile-detail"),
]
