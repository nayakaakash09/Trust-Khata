import io
import base64
import qrcode
from rest_framework import serializers
from .models import Transaction, PaymentRecord
from accounts.serializers import UserSerializer

def generate_qr_base64(data_string):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data_string)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


class PaymentRecordSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.name')

    class Meta:
        model = PaymentRecord
        fields = ['id', 'amount_paid', 'payment_mode', 'notes', 'payment_date', 'recorded_by', 'recorded_by_name']
        read_only_fields = ['id', 'payment_date', 'recorded_by']


class TransactionSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.name')
    vendor_phone = serializers.ReadOnlyField(source='vendor.phone')
    shop_name = serializers.SerializerMethodField()
    upi_id = serializers.SerializerMethodField()
    total_paid = serializers.ReadOnlyField()
    remaining_balance = serializers.ReadOnlyField()
    payments = PaymentRecordSerializer(many=True, read_only=True)
    qr_code = serializers.SerializerMethodField()
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id',
            'secure_token',
            'vendor',
            'vendor_name',
            'vendor_phone',
            'shop_name',
            'upi_id',
            'customer',
            'customer_name',
            'customer_phone',
            'amount',
            'description',
            'status',
            'dispute_reason',
            'total_paid',
            'remaining_balance',
            'payments',
            'qr_code',
            'verification_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'secure_token',
            'vendor',
            'vendor_name',
            'vendor_phone',
            'shop_name',
            'upi_id',
            'customer',
            'total_paid',
            'remaining_balance',
            'payments',
            'qr_code',
            'verification_url',
            'created_at',
            'updated_at',
        ]

    def get_shop_name(self, obj):
        if hasattr(obj.vendor, 'vendor_profile'):
            return obj.vendor.vendor_profile.shop_name
        return f"{obj.vendor.name or obj.vendor.username}'s Store"

    def get_upi_id(self, obj):
        if hasattr(obj.vendor, 'vendor_profile'):
            return obj.vendor.vendor_profile.upi_id
        return ''

    def get_verification_url(self, obj):
        request = self.context.get('request')
        # Standard frontend route for verification
        return f"/verify/{obj.secure_token}"

    def get_qr_code(self, obj):
        # We encode either the token or verification deep-link
        qr_payload = f"trustkhata:tx:{obj.secure_token}"
        try:
            return generate_qr_base64(qr_payload)
        except Exception:
            return None


class CreateTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['customer_name', 'customer_phone', 'amount', 'description']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transaction amount must be greater than zero.")
        return value
