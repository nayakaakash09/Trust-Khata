from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_REMINDER = 'REMINDER'
    TYPE_STATUS_UPDATE = 'STATUS_UPDATE'
    TYPE_PAYMENT = 'PAYMENT'

    TYPE_CHOICES = (
        (TYPE_REMINDER, 'Payment Reminder'),
        (TYPE_STATUS_UPDATE, 'Transaction Status Update'),
        (TYPE_PAYMENT, 'Payment Acknowledgment'),
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='received_notifications'
    )
    recipient_phone = models.CharField(max_length=15, blank=True)
    transaction = models.ForeignKey(
        'transactions.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default=TYPE_REMINDER)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type}: {self.title}"
