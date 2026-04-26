from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import models
from .models import Order
from .serializers import OrderSerializer
from delivery.models import DeliveryAssignment

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
            
        if user.role == 'shopkeeper':
            return self.queryset.filter(
                models.Q(store__owner=user) | 
                models.Q(items__product__store__owner=user)
            ).distinct()
        return self.queryset.filter(customer=user)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        
        # If status is changing to 'ready', create a delivery task
        if new_status == 'ready' and order.status != 'ready':
            DeliveryAssignment.objects.get_or_create(
                order=order,
                task_type='order_delivery',
                defaults={'status': 'available'}
            )
        
        return super().partial_update(request, *args, **kwargs)
