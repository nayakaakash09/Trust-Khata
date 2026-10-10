from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, SendReminderView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('remind/', SendReminderView.as_view(), name='send_reminder'),
]
