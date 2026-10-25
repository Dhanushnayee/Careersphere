from django.urls import path
from apps.automation.views import AutomationGuaranteesView

urlpatterns = [
    path("automation/compliance/", AutomationGuaranteesView.as_view(), name="automation-compliance"),
]
