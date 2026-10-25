"""
CareerSphere AI — Notification Serializers
Phase 1 Foundation
"""
from rest_framework import serializers
from apps.notifications.models import NotificationEvent


class NotificationEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationEvent
        fields = [
            "uuid",
            "title",
            "message",
            "category",
            "is_read",
            "action_url",
            "created_at",
        ]
        read_only_fields = fields
