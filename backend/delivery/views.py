from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import DeliveryAssignment
from .serializers import DeliveryAssignmentSerializer

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = DeliveryAssignment.objects.all()
    serializer_class = DeliveryAssignmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
            
        if user.role == 'delivery':
            # See tasks assigned to me OR available tasks
            return self.queryset.filter(models.Q(partner=user) | models.Q(status='available'))
        
        if user.role == 'shopkeeper':
            # See deliveries related to my store (orders or bookings)
            return self.queryset.filter(
                models.Q(order__store__owner=user) | 
                models.Q(booking__store__owner=user)
            ).distinct()
            
        return self.queryset.none()

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        task = self.get_object()
        if task.status != 'available':
            return Response({'error': 'Task already claimed'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.partner = request.user
        task.status = 'assigned'
        task.save()
        
        # Sync back to the original object
        if task.order:
            task.order.status = 'assigned'
            task.order.save()
        if task.booking:
            task.booking.status = 'Assigned'
            task.booking.save()
            
        return Response(self.get_serializer(task).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status') # picked_up, delivered
        
        task.status = new_status
        task.save()
        
        # Sync back to the original object
        if task.order:
            if new_status == 'picked_up': task.order.status = 'picked_up'
            elif new_status == 'delivered': task.order.status = 'delivered'
            task.order.save()
        if task.booking:
            if new_status == 'picked_up': task.booking.status = 'PickedUp'
            elif new_status == 'delivered': task.booking.status = 'ArrivedAtStore' # For service pickup
            task.booking.save()
            
        return Response(self.get_serializer(task).data)
