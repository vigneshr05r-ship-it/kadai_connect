from rest_framework import generics, status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Service, Booking
from products.utils import resolve_category
from .serializers import ServiceSerializer, BookingSerializer
from stores.models import Store


# ── SERVICE VIEWS ────────────────────────────────────────────────────────────

class ServiceListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/services/?store=<store_id>  → list services for a store (public)
    POST /api/services/                   → create a service (owner only)
    """
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        # If store_id is provided, show only active services for that store (public view)
        store_id = self.request.query_params.get('store')
        if store_id:
            return Service.objects.filter(store_id=store_id, is_active=True).select_related('store', 'category').order_by('-created_at')
        
        # If authenticated shopkeeper, show all their services (dashboard view)
        user = self.request.user
        if user.is_authenticated and getattr(user, 'role', '') == 'shopkeeper':
            try:
                store = Store.objects.get(owner=user)
                return Service.objects.filter(store=store).select_related('store', 'category').order_by('-created_at')
            except Store.DoesNotExist:
                return Service.objects.none()
        
        # Otherwise show all active services (Customer view)
        return Service.objects.filter(is_active=True).select_related('store', 'category').order_by('-created_at')

    def perform_create(self, serializer):
        store = Store.objects.get(owner=self.request.user)
        category = resolve_category(self.request.data, default_type='service')
        
        if not category:
            raise serializers.ValidationError({"category": "A valid category selection is mandatory."})
            
        serializer.save(store=store, category=category)


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/services/<id>/
    """
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Service.objects.all()

    def perform_update(self, serializer):
        category = resolve_category(self.request.data, default_type='service')
        if category:
            serializer.save(category=category)
        else:
            serializer.save()


# ── BOOKING VIEWS ─────────────────────────────────────────────────────────────

class BookingListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/bookings/?store=<id>  → shopkeeper sees their bookings
    POST /api/bookings/             → customer creates a booking (public)
    """
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Booking.objects.none()
            
        if user.role == 'shopkeeper':
            try:
                store = Store.objects.get(owner=user)
                return Booking.objects.filter(store=store).order_by('-created_at')
            except Store.DoesNotExist:
                return Booking.objects.none()
        
        # Default: Customer sees their own bookings
        return Booking.objects.filter(customer=user).order_by('-created_at')


class BookingCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
            # Only customer or shopkeeper can cancel
            if booking.customer != request.user and booking.store.owner != request.user:
                return Response({'error': 'Unauthorized'}, status=403)
                
            reason = request.data.get('reason', 'Cancelled by customer')
            
            if booking.status in ['ServiceInProgress', 'Completed', 'Cancelled']:
                return Response({'error': 'Cannot cancel booking at this stage'}, status=400)
                
            booking.status = 'Cancelled'
            booking.cancel_reason = reason
            booking.cancelled_by = 'customer' if request.user == booking.customer else 'shopkeeper'
            from django.utils import timezone
            booking.cancelled_at = timezone.now()
            
            if booking.payment_method != 'COD' and booking.payment_status == 'paid':
                booking.payment_status = 'refund_initiated'
                
            booking.save()
            
            from orders.models import OrderStatusHistory
            OrderStatusHistory.objects.create(booking=booking, status='Cancelled', notes=f"Reason: {reason}")
            
            return Response(BookingSerializer(booking).data)
        except Booking.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/bookings/<id>/
    Shopkeeper can update the status (Confirmed, Completed, Cancelled).
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            store = Store.objects.get(owner=self.request.user)
            return Booking.objects.filter(store=store)
        except Store.DoesNotExist:
            return Booking.objects.none()


class BookingStatusUpdateView(APIView):
    """PATCH /api/bookings/<id>/status/ → update booking status only"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            from delivery.models import DeliveryAssignment
            store = Store.objects.get(owner=request.user)
            booking = Booking.objects.get(pk=pk, store=store)
            new_status = request.data.get('status')
            
            valid = [
                'Pending', 'Accepted', 'Confirmed', 'ReadyForPickup', 
                'Assigned', 'PickedUp', 'ArrivedAtStore', 
                'ServiceInProgress', 'ReadyForReturn', 'Completed', 'Cancelled'
            ]
            if new_status not in valid:
                return Response({'error': f'Status must be one of {valid}'}, status=400)
            
            # If status is changing to 'ReadyForPickup', create a delivery task
            if new_status == 'ReadyForPickup' and booking.status != 'ReadyForPickup':
                DeliveryAssignment.objects.get_or_create(
                    booking=booking,
                    task_type='service_pickup',
                    defaults={'status': 'available'}
                )
            
            booking.status = new_status
            booking.save()
            return Response(BookingSerializer(booking).data)
        except (Store.DoesNotExist, Booking.DoesNotExist):
            return Response({'error': 'Not found'}, status=404)
