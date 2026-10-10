from django.contrib import admin
from .models import Transaction, PaymentRecord

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'customer_name', 'customer_phone', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer_name', 'customer_phone', 'description', 'secure_token')
    readonly_fields = ('secure_token', 'created_at', 'updated_at')

@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction', 'amount_paid', 'payment_mode', 'payment_date', 'recorded_by')
    list_filter = ('payment_mode', 'payment_date')
