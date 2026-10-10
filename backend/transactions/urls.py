from django.urls import path
from .views import (
    TransactionListCreateView,
    TransactionDetailView,
    TransactionVerifyByTokenView,
    TransactionRespondView,
    RecordPaymentView,
    LedgerSummaryView
)

urlpatterns = [
    path('', TransactionListCreateView.as_view(), name='transaction_list_create'),
    path('summary/', LedgerSummaryView.as_view(), name='ledger_summary'),
    path('<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
    path('<int:pk>/payments/', RecordPaymentView.as_view(), name='record_payment'),
    path('verify/<uuid:token>/', TransactionVerifyByTokenView.as_view(), name='transaction_verify'),
    path('verify/<uuid:token>/respond/', TransactionRespondView.as_view(), name='transaction_respond'),
]
