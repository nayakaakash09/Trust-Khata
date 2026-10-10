from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.name')
    recipient_name = serializers.ReadOnlyField(source='recipient.name')

    class Meta:
        model = Notification
        fields = [
            'id',
            'sender',
            'sender_name',
            'recipient',
            'recipient_name',
            'recipient_phone',
            'transaction',
            'title',
            'message',
            'notification_type',
            'is_read',
            'created_at'
        ]
        read_only_fields = ['id', 'sender', 'sender_name', 'recipient_name', 'created_at']
