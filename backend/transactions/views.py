from decimal import Decimal
from django.db import models
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from notifications.models import Notification
from .models import Transaction, PaymentRecord
from .serializers import (
    TransactionSerializer,
    CreateTransactionSerializer,
    PaymentRecordSerializer
)

class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateTransactionSerializer
        return TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if user.role == 'VENDOR':
            qs = Transaction.objects.filter(vendor=user).prefetch_related('payments')
        else:
            # Customer can see transactions linked to their account OR matching their phone
            phone = user.phone
            cond = Q(customer=user)
            if phone:
                cond |= Q(customer_phone=phone)
            qs = Transaction.objects.filter(cond).prefetch_related('payments')

        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        if search:
            qs = qs.filter(
                Q(customer_name__icontains=search) |
                Q(customer_phone__icontains=search) |
                Q(description__icontains=search)
            )

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'VENDOR':
            raise permissions.PermissionDenied("Only vendors can record new credit transactions.")

        customer_phone = serializer.validated_data.get('customer_phone', '').strip()
        customer_user = None
        if customer_phone:
            customer_user = User.objects.filter(phone=customer_phone, role='CUSTOMER').first()

        transaction = serializer.save(
            vendor=user,
            customer=customer_user,
            status=Transaction.STATUS_PENDING
        )

        # Create notification for customer if registered
        if customer_user:
            Notification.objects.create(
                sender=user,
                recipient=customer_user,
                recipient_phone=customer_phone,
                transaction=transaction,
                title="New Credit Request",
                message=f"Shop '{user.vendor_profile.shop_name if hasattr(user, 'vendor_profile') else user.name}' requested Rs. {transaction.amount} credit for '{transaction.description}'. Please verify.",
                notification_type=Notification.TYPE_STATUS_UPDATE
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full transaction details with QR code
        instance = Transaction.objects.get(id=serializer.instance.id)
        out_serializer = TransactionSerializer(instance, context={'request': request})
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class TransactionDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all().prefetch_related('payments')

    def get_queryset(self):
        user = self.request.user
        if user.role == 'VENDOR':
            return Transaction.objects.filter(vendor=user).prefetch_related('payments')
        else:
            phone = user.phone
            cond = Q(customer=user)
            if phone:
                cond |= Q(customer_phone=phone)
            return Transaction.objects.filter(cond).prefetch_related('payments')


class TransactionVerifyByTokenView(APIView):
    """View transaction details using secure unguessable token"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        transaction = get_object_or_404(
            Transaction.objects.prefetch_related('payments'),
            secure_token=token
        )
        serializer = TransactionSerializer(transaction, context={'request': request})
        return Response(serializer.data)


class TransactionRespondView(APIView):
    """Customer accepts, disputes, or rejects a pending transaction"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, token):
        user = request.user
        transaction = get_object_or_404(Transaction, secure_token=token)

        # Only allow response if currently PENDING
        if transaction.status != Transaction.STATUS_PENDING:
            return Response(
                {"error": f"Cannot respond to this transaction. Current status is {transaction.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get('action', '').upper()
        reason = request.data.get('dispute_reason', '').strip()

        # Link customer to current user if unlinked
        if not transaction.customer:
            transaction.customer = user
            if not transaction.customer_name:
                transaction.customer_name = user.name or user.username

        if action == 'ACCEPT':
            transaction.status = Transaction.STATUS_ACCEPTED
            transaction.dispute_reason = ''
            transaction.save()

            # Notify vendor
            Notification.objects.create(
                sender=user,
                recipient=transaction.vendor,
                transaction=transaction,
                title="Credit Confirmed!",
                message=f"Customer {user.name or user.username} accepted credit entry of Rs. {transaction.amount}.",
                notification_type=Notification.TYPE_STATUS_UPDATE
            )
            msg = "Credit entry accepted successfully!"

        elif action == 'DISPUTE':
            if not reason:
                return Response(
                    {"error": "Please provide a reason for disputing this transaction."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            transaction.status = Transaction.STATUS_DISPUTED
            transaction.dispute_reason = reason
            transaction.save()

            # Notify vendor
            Notification.objects.create(
                sender=user,
                recipient=transaction.vendor,
                transaction=transaction,
                title="Credit Disputed",
                message=f"Customer {user.name or user.username} disputed Rs. {transaction.amount}. Reason: {reason}",
                notification_type=Notification.TYPE_STATUS_UPDATE
            )
            msg = "Transaction flagged as disputed. Vendor has been alerted."

        elif action == 'REJECT':
            transaction.status = Transaction.STATUS_REJECTED
            transaction.dispute_reason = reason or "Declined by customer"
            transaction.save()

            Notification.objects.create(
                sender=user,
                recipient=transaction.vendor,
                transaction=transaction,
                title="Credit Rejected",
                message=f"Customer {user.name or user.username} rejected credit entry of Rs. {transaction.amount}.",
                notification_type=Notification.TYPE_STATUS_UPDATE
            )
            msg = "Transaction rejected."

        else:
            return Response(
                {"error": "Invalid action. Supported actions are ACCEPT, DISPUTE, REJECT."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TransactionSerializer(transaction, context={'request': request})
        return Response({
            'message': msg,
            'transaction': serializer.data
        })


class RecordPaymentView(APIView):
    """Vendor records a full or partial payment against an ACCEPTED transaction"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        transaction = get_object_or_404(Transaction, pk=pk, vendor=user)

        if transaction.status not in [Transaction.STATUS_ACCEPTED, Transaction.STATUS_PAID]:
            return Response(
                {"error": "Payments can only be recorded against accepted transactions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = Decimal(str(request.data.get('amount_paid', '0')))
        except Exception:
            return Response({"error": "Invalid payment amount."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({"error": "Payment amount must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)

        rem = transaction.remaining_balance
        if amount > rem:
            return Response(
                {"error": f"Payment of Rs. {amount} exceeds remaining balance Rs. {rem}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_mode = request.data.get('payment_mode', PaymentRecord.MODE_CASH)
        notes = request.data.get('notes', '')

        payment = PaymentRecord.objects.create(
            transaction=transaction,
            amount_paid=amount,
            payment_mode=payment_mode,
            notes=notes,
            recorded_by=user
        )

        # Recalculate status
        transaction.sync_paid_status()

        # Send notification to customer if linked
        if transaction.customer:
            Notification.objects.create(
                sender=user,
                recipient=transaction.customer,
                recipient_phone=transaction.customer_phone,
                transaction=transaction,
                title="Payment Received",
                message=f"Received Rs. {amount} via {payment_mode} for Tx #{transaction.id}. Outstanding: Rs. {transaction.remaining_balance}.",
                notification_type=Notification.TYPE_PAYMENT
            )

        serializer = TransactionSerializer(transaction, context={'request': request})
        return Response({
            'message': f"Recorded Rs. {amount} payment successfully!",
            'payment': PaymentRecordSerializer(payment).data,
            'transaction': serializer.data
        }, status=status.HTTP_201_CREATED)


class LedgerSummaryView(APIView):
    """Server-side computed ledger balances and totals"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'VENDOR':
            tx_qs = Transaction.objects.filter(vendor=user).prefetch_related('payments')

            pending_count = tx_qs.filter(status=Transaction.STATUS_PENDING).count()
            accepted_count = tx_qs.filter(status=Transaction.STATUS_ACCEPTED).count()
            disputed_count = tx_qs.filter(status=Transaction.STATUS_DISPUTED).count()
            paid_count = tx_qs.filter(status=Transaction.STATUS_PAID).count()

            # Dynamic balance calculations
            total_outstanding = sum(tx.remaining_balance for tx in tx_qs if tx.status == Transaction.STATUS_ACCEPTED)
            
            # Total paid across all vendor transactions
            total_collected_res = PaymentRecord.objects.filter(transaction__vendor=user).aggregate(total=Sum('amount_paid'))['total']
            total_collected = Decimal(str(total_collected_res)) if total_collected_res is not None else Decimal('0.00')

            # Total credit ever accepted or settled
            total_credit_extended = sum(tx.amount for tx in tx_qs if tx.status in [Transaction.STATUS_ACCEPTED, Transaction.STATUS_PAID])

            # Group customers with balances
            customers_map = {}
            for tx in tx_qs:
                key = tx.customer_phone or tx.customer_name
                if key not in customers_map:
                    customers_map[key] = {
                        'name': tx.customer_name,
                        'phone': tx.customer_phone,
                        'customer_id': tx.customer_id,
                        'total_transactions': 0,
                        'outstanding_balance': Decimal('0.00'),
                        'last_activity': tx.created_at
                    }
                customers_map[key]['total_transactions'] += 1
                if tx.status == Transaction.STATUS_ACCEPTED:
                    customers_map[key]['outstanding_balance'] += tx.remaining_balance

            customer_list = sorted(list(customers_map.values()), key=lambda c: c['outstanding_balance'], reverse=True)

            return Response({
                'role': 'VENDOR',
                'total_outstanding': total_outstanding,
                'total_collected': total_collected,
                'total_credit_extended': total_credit_extended,
                'counts': {
                    'pending': pending_count,
                    'accepted': accepted_count,
                    'disputed': disputed_count,
                    'paid': paid_count,
                    'total': tx_qs.count()
                },
                'customers': customer_list
            })

        else:
            # Customer view
            phone = user.phone
            cond = Q(customer=user)
            if phone:
                cond |= Q(customer_phone=phone)

            tx_qs = Transaction.objects.filter(cond).prefetch_related('payments', 'vendor__vendor_profile')

            pending_count = tx_qs.filter(status=Transaction.STATUS_PENDING).count()
            accepted_count = tx_qs.filter(status=Transaction.STATUS_ACCEPTED).count()
            disputed_count = tx_qs.filter(status=Transaction.STATUS_DISPUTED).count()
            paid_count = tx_qs.filter(status=Transaction.STATUS_PAID).count()

            total_debt_outstanding = sum(tx.remaining_balance for tx in tx_qs if tx.status == Transaction.STATUS_ACCEPTED)
            
            # Total payments made by customer
            total_paid_res = PaymentRecord.objects.filter(transaction__in=tx_qs).aggregate(total=Sum('amount_paid'))['total']
            total_paid = Decimal(str(total_paid_res)) if total_paid_res is not None else Decimal('0.00')

            # Linked shops breakdown
            shops_map = {}
            for tx in tx_qs:
                v_id = tx.vendor.id
                if v_id not in shops_map:
                    shop_name = tx.vendor.vendor_profile.shop_name if hasattr(tx.vendor, 'vendor_profile') else tx.vendor.name
                    shops_map[v_id] = {
                        'vendor_id': v_id,
                        'vendor_name': tx.vendor.name,
                        'shop_name': shop_name,
                        'vendor_phone': tx.vendor.phone,
                        'outstanding_balance': Decimal('0.00'),
                        'total_transactions': 0
                    }
                shops_map[v_id]['total_transactions'] += 1
                if tx.status == Transaction.STATUS_ACCEPTED:
                    shops_map[v_id]['outstanding_balance'] += tx.remaining_balance

            return Response({
                'role': 'CUSTOMER',
                'total_debt_outstanding': total_debt_outstanding,
                'total_paid': total_paid,
                'counts': {
                    'pending': pending_count,
                    'accepted': accepted_count,
                    'disputed': disputed_count,
                    'paid': paid_count,
                    'total': tx_qs.count()
                },
                'linked_shops': list(shops_map.values())
            })
