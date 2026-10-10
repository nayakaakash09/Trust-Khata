from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Notification
from .serializers import NotificationSerializer
from transactions.models import Transaction

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        phone = user.phone
        cond = Q(recipient=user)
        if phone:
            cond |= Q(recipient_phone=phone)
        return Notification.objects.filter(cond).order_by('-created_at')[:30]


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        notification = get_object_or_404(Notification, pk=pk)
        if notification.recipient == user or notification.recipient_phone == user.phone:
            notification.is_read = True
            notification.save()
            return Response({"status": "marked as read"})
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)


class SendReminderView(APIView):
    """Vendor generates and logs a friendly credit reminder"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'VENDOR':
            return Response({"error": "Only vendors can send payment reminders."}, status=status.HTTP_403_FORBIDDEN)

        transaction_id = request.data.get('transaction_id')
        transaction = get_object_or_404(Transaction, id=transaction_id, vendor=user)

        shop_name = user.vendor_profile.shop_name if hasattr(user, 'vendor_profile') else user.name
        custom_note = request.data.get('message', '').strip()

        default_msg = (
            f"Namaste {transaction.customer_name}, this is a gentle reminder from {shop_name} "
            f"regarding outstanding credit of Rs. {transaction.remaining_balance} "
            f"(Tx #{transaction.id}: {transaction.description}). Kindly settle at your convenience. Thank you!"
        )
        msg_text = custom_note if custom_note else default_msg

        notification = Notification.objects.create(
            sender=user,
            recipient=transaction.customer,
            recipient_phone=transaction.customer_phone,
            transaction=transaction,
            title=f"Payment Reminder: Rs. {transaction.remaining_balance}",
            message=msg_text,
            notification_type=Notification.TYPE_REMINDER
        )

        # Formatted whatsapp share link url-ready
        return Response({
            'message': 'Reminder generated and logged successfully!',
            'notification': NotificationSerializer(notification).data,
            'preview_text': msg_text,
            'whatsapp_text': msg_text,
            'customer_phone': transaction.customer_phone,
        }, status=status.HTTP_201_CREATED)
