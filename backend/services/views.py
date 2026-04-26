from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Service, Booking
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
            return Service.objects.filter(store_id=store_id, is_active=True).order_by('-created_at')
        
        # If authenticated shopkeeper, show all their services (dashboard view)
        if self.request.user.is_authenticated:
            try:
                store = Store.objects.get(owner=self.request.user)
                return Service.objects.filter(store=store).order_by('-created_at')
            except Store.DoesNotExist:
                return Service.objects.none()
        
        # Otherwise show nothing or all active (depending on policy)
        return Service.objects.filter(is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        store = Store.objects.get(owner=self.request.user)
        serializer.save(store=store)


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
        if user.is_authenticated:
            try:
                store = Store.objects.get(owner=user)
                return Booking.objects.filter(store=store).order_by('-created_at')
            except Store.DoesNotExist:
                pass
        return Booking.objects.none()


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
