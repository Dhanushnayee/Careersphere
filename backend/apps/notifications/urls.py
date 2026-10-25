from django.urls import path
from apps.notifications.views import NotificationStatusView

urlpatterns = [
    path("notifications/status/", NotificationStatusView.as_view(), name="notification-status"),
]
