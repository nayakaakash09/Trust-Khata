from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, VendorProfile
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer
)

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['username'] = user.username
        refresh['name'] = user.name

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Account created successfully!'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data
        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        user.save()

        if user.role == 'VENDOR' and hasattr(user, 'vendor_profile'):
            vp = user.vendor_profile
            vp.shop_name = data.get('shop_name', vp.shop_name)
            vp.shop_category = data.get('shop_category', vp.shop_category)
            vp.address = data.get('address', vp.address)
            vp.upi_id = data.get('upi_id', vp.upi_id)
            vp.save()
        elif user.role == 'CUSTOMER' and hasattr(user, 'customer_profile'):
            cp = user.customer_profile
            cp.address = data.get('address', cp.address)
            cp.save()

        return Response(UserSerializer(user).data)


class CustomerListView(generics.ListAPIView):
    """List registered customers for vendor lookup"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('search', '')
        qs = User.objects.filter(role='CUSTOMER')
        if query:
            qs = qs.filter(name__icontains=query) | qs.filter(phone__icontains=query) | qs.filter(username__icontains=query)
        return qs[:20]


class VendorListView(generics.ListAPIView):
    """List vendors / shops"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return User.objects.filter(role='VENDOR')
