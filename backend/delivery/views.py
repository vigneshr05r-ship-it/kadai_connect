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
            return self.queryset.filter(models.Q(partner=user) | models.Q(status='available')).order_by('-created_at')
        
        if user.role == 'shopkeeper':
            # See deliveries related to my store (orders or bookings)
            return self.queryset.filter(
                models.Q(order__store__owner=user) | 
                models.Q(booking__store__owner=user)
            ).distinct().order_by('-created_at')
            
        return self.queryset.none()

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        task = self.get_object()
        if task.status != 'available':
            return Response({'error': 'Task already claimed'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.partner = request.user
        task.status = 'assigned'
        task.save()
        
        from notifications.utils import create_notification
        # Notify Customer & Shopkeeper
        if task.order:
            task.order.status = 'assigned'
            task.order.save()
            create_notification(
                user=task.order.customer,
                title="Delivery Partner Assigned",
                message=f"{task.partner.username} is assigned to deliver your order #KC-{task.order.id}.",
                notification_type='delivery',
                link=f"/orders/{task.order.id}"
            )
            if task.order.store and task.order.store.owner:
                create_notification(
                    user=task.order.store.owner,
                    title="Delivery Partner Assigned",
                    message=f"{task.partner.username} has claimed order #KC-{task.order.id}.",
                    notification_type='delivery',
                    link=f"/shop/orders/{task.order.id}"
                )
        if task.booking:
            task.booking.status = 'Assigned'
            task.booking.save()
            create_notification(
                user=task.booking.customer,
                title="Delivery Partner Assigned",
                message=f"{task.partner.username} is assigned for your service booking #{task.booking.id}.",
                notification_type='delivery',
                link=f"/bookings/{task.booking.id}"
            )
            if task.booking.store and task.booking.store.owner:
                create_notification(
                    user=task.booking.store.owner,
                    title="Delivery Partner Assigned",
                    message=f"{task.partner.username} has claimed booking #{task.booking.id}.",
                    notification_type='delivery',
                    link=f"/shop/bookings/{task.booking.id}"
                )
            
        return Response(self.get_serializer(task).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status') 
        
        # available, assigned, heading_to_store, picked_up, out_for_delivery, delivered, returning_to_store, returned_to_store, cancelled
        valid_statuses = ['heading_to_store', 'picked_up', 'out_for_delivery', 'delivered', 'returning_to_store', 'returned_to_store', 'cancelled']
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=400)

        task.status = new_status
        task.save()
        
        from notifications.utils import create_notification
        status_labels = {
            'heading_to_store': 'Heading to Store',
            'picked_up': 'Item Picked Up',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'returning_to_store': 'Returning to Store',
            'returned_to_store': 'Returned to Store',
            'cancelled': 'Cancelled'
        }
        label = status_labels.get(new_status, new_status.replace('_', ' ').title())

        # Sync back to the original object (Order or Booking)
        if task.order:
            # Simple mapping for Order
            if new_status == 'picked_up': 
                task.order.status = 'picked_up'
            elif new_status == 'out_for_delivery': 
                task.order.status = 'out_for_delivery'
            elif new_status == 'delivered': 
                task.order.status = 'delivered'
            elif new_status == 'returning_to_store': 
                task.order.status = 'returning_to_store'
            elif new_status == 'returned_to_store': 
                task.order.status = 'returned_to_store'
            elif new_status == 'cancelled': 
                task.order.status = 'cancelled'
            task.order.save()

            # Notify Customer & Shopkeeper
            create_notification(
                user=task.order.customer,
                title=f"Delivery Update: {label}",
                message=f"Your order #KC-{task.order.id} is now {label}.",
                notification_type='delivery',
                link=f"/orders/{task.order.id}"
            )
            if task.order.store and task.order.store.owner:
                create_notification(
                    user=task.order.store.owner,
                    title=f"Delivery Update: {label}",
                    message=f"Order #KC-{task.order.id} status: {label}.",
                    notification_type='delivery',
                    link=f"/shop/orders/{task.order.id}"
                )

        if task.booking:
            # More complex mapping for Service Booking stages
            if task.task_type == 'service_pickup':
                if new_status == 'picked_up': 
                    task.booking.status = 'PickedUp'
                elif new_status == 'delivered': 
                    task.booking.status = 'ArrivedAtStore'
            elif task.task_type == 'service_return':
                if new_status == 'picked_up': 
                    task.booking.status = 'ReadyForReturn'
                elif new_status == 'out_for_delivery': 
                    # Note: No specific OutForReturn in model, keeping as ReadyForReturn or use similar
                    pass
                elif new_status == 'delivered': 
                    task.booking.status = 'Completed'
            
            task.booking.save()

            # Notify Customer & Shopkeeper
            create_notification(
                user=task.booking.customer,
                title=f"Service Update: {label}",
                message=f"Your service booking #{task.booking.id} is now {label}.",
                notification_type='delivery',
                link=f"/bookings/{task.booking.id}"
            )
            if task.booking.store and task.booking.store.owner:
                create_notification(
                    user=task.booking.store.owner,
                    title=f"Service Update: {label}",
                    message=f"Booking #{task.booking.id} status: {label}.",
                    notification_type='delivery',
                    link=f"/shop/bookings/{task.booking.id}"
                )
            
        return Response(self.get_serializer(task).data)

    @action(detail=False, methods=['post'])
    def update_location(self, request):
        try:
            lat = request.data.get('lat')
            lng = request.data.get('lng')
            
            if lat is None or lng is None:
                return Response({'error': 'Missing lat/lng'}, status=400)

            # Update all active assignments for this partner
            active_tasks = DeliveryAssignment.objects.filter(
                partner=request.user, 
                status__in=['assigned', 'heading_to_store', 'picked_up', 'out_for_delivery']
            )
            active_tasks.update(current_lat=lat, current_lng=lng)
            
            return Response({'status': 'Location updated'})
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"update_location error: {str(e)}")
            return Response({'error': str(e)}, status=500)
