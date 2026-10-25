from django.urls import path
from apps.ai_copilot.views import AiCopilotContractView

urlpatterns = [
    path("ai-copilot/contract/", AiCopilotContractView.as_view(), name="ai-copilot-contract"),
]
