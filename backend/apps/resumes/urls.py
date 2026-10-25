from django.urls import path
from apps.resumes.views import ResumeUploadPreviewView

urlpatterns = [
    path("resumes/upload-preview/", ResumeUploadPreviewView.as_view(), name="resume-upload-preview"),
]
