import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings

class Transaction(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_ACCEPTED = 'ACCEPTED'
    STATUS_DISPUTED = 'DISPUTED'
    STATUS_REJECTED = 'REJECTED'
    STATUS_PAID = 'PAID'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending Verification'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_DISPUTED, 'Disputed'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_PAID, 'Paid'),
    )

    id = models.BigAutoField(primary_key=True)
    secure_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    
    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_transactions'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customer_transactions'
    )
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=15)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    dispute_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def total_paid(self):
        paid = self.payments.aggregate(total=models.Sum('amount_paid'))['total']
        return Decimal(str(paid)) if paid is not None else Decimal('0.00')

    @property
    def remaining_balance(self):
        if self.status in [self.STATUS_REJECTED, self.STATUS_DISPUTED]:
            return Decimal('0.00')
        if self.status == self.STATUS_PAID:
            return Decimal('0.00')
        balance = self.amount - self.total_paid
        return max(Decimal('0.00'), balance)

    def sync_paid_status(self):
        if self.status == self.STATUS_ACCEPTED and self.total_paid >= self.amount:
            self.status = self.STATUS_PAID
            self.save(update_fields=['status', 'updated_at'])

    def __str__(self):
        return f"Tx #{self.id} | Rs. {self.amount} | {self.status} | {self.customer_name}"


class PaymentRecord(models.Model):
    MODE_CASH = 'CASH'
    MODE_UPI = 'UPI'
    MODE_OTHER = 'OTHER'

    MODE_CHOICES = (
        (MODE_CASH, 'Cash'),
        (MODE_UPI, 'UPI'),
        (MODE_OTHER, 'Other / Bank'),
    )

    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=20, choices=MODE_CHOICES, default=MODE_CASH)
    notes = models.TextField(blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recorded_payments'
    )

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment Rs. {self.amount_paid} for Tx #{self.transaction.id}"
