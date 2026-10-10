from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, VendorProfile, CustomerProfile

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['shop_name', 'shop_category', 'address', 'upi_id', 'created_at']


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['address', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer(read_only=True)
    customer_profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'phone', 'email', 'role', 'vendor_profile', 'customer_profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    shop_name = serializers.CharField(required=False, allow_blank=True)
    shop_category = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    upi_id = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'name', 'phone', 'email', 'role', 'shop_name', 'shop_category', 'address', 'upi_id']

    def create(self, validated_data):
        role = validated_data.get('role', 'CUSTOMER')
        shop_name = validated_data.pop('shop_name', '')
        shop_category = validated_data.pop('shop_category', 'General Store')
        address = validated_data.pop('address', '')
        upi_id = validated_data.pop('upi_id', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        if role == 'VENDOR':
            VendorProfile.objects.create(
                user=user,
                shop_name=shop_name or f"{user.name or user.username}'s Store",
                shop_category=shop_category or 'General Store',
                address=address,
                upi_id=upi_id
            )
        else:
            CustomerProfile.objects.create(
                user=user,
                address=address
            )

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['name'] = user.name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
