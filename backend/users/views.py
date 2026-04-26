from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import random
from django.db.models import Q
from .models import User
from .serializers import UserSerializer
from stores.models import Store
from django.db import transaction
import traceback

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        username = self.request.query_params.get('username', None)
        if username:
            queryset = queryset.filter(username=username)
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'forgot_password', 'verify_otp', 'reset_password']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            if user.role == 'shopkeeper':
                store_name = request.data.get('store_name') or (f"{user.first_name or user.username}'s Store")
                Store.objects.create(
                    owner=user,
                    name=store_name,
                    category=request.data.get('store_category', 'General'),
                    district=request.data.get('district', user.district),
                    address=request.data.get('address', user.address),
                    location=request.data.get('pincode', 'Tamil Nadu'),
                    contact_name=request.data.get('name', user.first_name),
                    phone=request.data.get('phone', user.phone),
                    logo=request.FILES.get('logo'),
                    banner=request.FILES.get('banner')
                )
                
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            if isinstance(e, serializers.ValidationError):
                raise e
            # SECURITY: Do not expose traceback to users
            return Response({
                "error": "Account creation failed", 
                "detail": "Please check your inputs or try again later."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='forgot-password', permission_classes=[permissions.AllowAny])
    def forgot_password(self, request):
        contact = request.data.get('email')
        if not contact:
            return Response({'error': 'Email or Phone is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(Q(email=contact) | Q(phone=contact) | Q(username=contact)).first()
        
        if user:
            otp = str(random.randint(100000, 999999))
            user.reset_otp = otp
            user.otp_expiry = timezone.now() + timedelta(minutes=5)
            user.save()
            
            # SECURITY: In production, send via email/SMS. Avoid printing to console.
            # print(f"OTP: {otp}") 
            
            return Response({
                'status': 'user_found',
                'detail': 'If an account exists, an OTP has been sent.'
            }, status=status.HTTP_200_OK)
        else:
            # SECURITY: Use generic message to prevent account enumeration
            return Response({
                'status': 'processed',
                'detail': 'If an account exists, an OTP has been sent.'
            }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='verify-otp', permission_classes=[permissions.AllowAny])
    def verify_otp(self, request):
        contact = request.data.get('email')
        otp = request.data.get('otp')
        
        user = User.objects.filter(Q(email=contact) | Q(phone=contact) | Q(username=contact)).first()
        if not user or not user.reset_otp:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
            
        if user.reset_otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
        if user.otp_expiry < timezone.now():
            return Response({'error': 'Expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'detail': 'OTP Verified'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='reset-password', permission_classes=[permissions.AllowAny])
    def reset_password(self, request):
        contact = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('password')

        if not new_password:
            return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(Q(email=contact) | Q(phone=contact) | Q(username=contact)).first()
        if not user or user.reset_otp != otp or not user.reset_otp:
            return Response({'error': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if user.otp_expiry < timezone.now():
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.reset_otp = None 
        user.otp_expiry = None
        user.save()
        
        return Response({'detail': 'Password reset successful!'}, status=status.HTTP_200_OK)
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='delete-account')
    def delete_account(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user.is_active = False
        user.save()
        
        # If user is a shopkeeper, also deactivate their store
        store = Store.objects.filter(owner=user).first()
        if store:
            store.is_active = False
            store.save()
            
        return Response({'detail': 'Account deleted successfully'}, status=status.HTTP_200_OK)
