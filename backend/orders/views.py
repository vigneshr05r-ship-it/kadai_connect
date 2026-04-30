from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Order
from .serializers import OrderSerializer
from delivery.models import DeliveryAssignment

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('customer', 'store').order_by('-created_at')
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
            
        if user.role == 'shopkeeper':
            return self.queryset.filter(
                models.Q(store__owner=user) | 
                models.Q(items__product__store__owner=user)
            ).distinct().order_by('-created_at')
        return self.queryset.filter(customer=user).order_by('-created_at')

    def perform_create(self, serializer):
        order = serializer.save()
        from notifications.utils import create_notification
        # Notify Shopkeeper
        if order.store and order.store.owner:
            create_notification(
                user=order.store.owner,
                title="New Order Received",
                message=f"You have a new order #KC-{order.id} from {order.customer.username}.",
                notification_type='order',
                link=f"/shop/orders/{order.id}"
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Reason is mandatory'}, status=400)
            
        from django.utils import timezone
        now = timezone.now()
        
        # Rule 1: Time-based restriction (15 minutes)
        time_diff = now - order.created_at
        if time_diff.total_seconds() > 900: # 15 minutes
             # If it's past 15 mins, we ONLY allow if not out for delivery
             if order.status in ['out_for_delivery', 'delivered']:
                 return Response({'error': 'Cancellation period has expired (15 min limit)'}, status=400)

        # Rule 2: Status-based restriction
        if order.status in ['out_for_delivery', 'delivered']:
            return Response({'error': 'Cannot cancel order after it has been dispatched'}, status=400)
            
        # Rule 3: Distance-based restriction (If partner < 1km)
        from delivery.models import DeliveryAssignment
        assignment = DeliveryAssignment.objects.filter(order=order).last()
        if assignment and assignment.status != 'available':
            # In a real app, calculate distance between partner lat/lng and customer lat/lng
            # For this logic, we assume partner is nearby if status is 'picked_up' or 'out_for_delivery'
            if order.status in ['picked_up', 'out_for_delivery']:
                 return Response({'error': 'Delivery partner is already nearby'}, status=400)

        order.status = 'cancelled'
        order.cancel_reason = reason
        order.cancelled_at = now
        order.cancelled_by = 'customer' if request.user.role == 'customer' else 'shopkeeper'
        
        # Handle Refund Initiation
        if order.payment_method != 'COD' and order.payment_status == 'paid':
            order.payment_status = 'refund_initiated'
            
        order.save()
        
        from notifications.utils import create_notification
        # Notify Customer
        create_notification(
            user=order.customer,
            title="Order Cancelled",
            message=f"Your order #KC-{order.id} has been cancelled. Reason: {reason}",
            notification_type='order',
            link=f"/orders/{order.id}"
        )
        # Notify Shopkeeper
        if order.store and order.store.owner:
            create_notification(
                user=order.store.owner,
                title="Order Cancelled",
                message=f"Order #KC-{order.id} from {order.customer.username} has been cancelled.",
                notification_type='order',
                link=f"/shop/orders/{order.id}"
            )

        from .models import OrderStatusHistory
        OrderStatusHistory.objects.create(order=order, status='cancelled', notes=f"Cancelled by {order.cancelled_by}. Reason: {reason}")
        
        return Response(OrderSerializer(order).data)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        
        # Log status change in history
        if new_status and new_status != order.status:
            from .models import OrderStatusHistory
            OrderStatusHistory.objects.create(order=order, status=new_status, notes=request.data.get('notes', 'Status updated by store/system'))
            
            from notifications.utils import create_notification
            # Notify Customer of status change
            status_labels = {
                'ready': 'Ready for Pickup',
                'picked_up': 'Picked Up',
                'out_for_delivery': 'Out for Delivery',
                'delivered': 'Successfully Delivered',
                'cancelled': 'Cancelled'
            }
            label = status_labels.get(new_status, new_status.replace('_', ' ').title())
            create_notification(
                user=order.customer,
                title=f"Order Update: {label}",
                message=f"Your order #KC-{order.id} is now {label}.",
                notification_type='order',
                link=f"/orders/{order.id}"
            )

        # If status is changing to 'ready', create a delivery task
        if new_status == 'ready' and order.status != 'ready':
            DeliveryAssignment.objects.get_or_create(
                order=order,
                task_type='order_delivery',
                defaults={'status': 'available'}
            )
        
        return super().partial_update(request, *args, **kwargs)
