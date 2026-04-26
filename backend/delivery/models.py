from django.db import models
from django.conf import settings
from orders.models import Order
from services.models import Booking

class DeliveryAssignment(models.Model):
    TASK_TYPES = (
        ('order_delivery', 'Product Order Delivery'),
        ('service_pickup', 'Service Item Pickup from Customer'),
        ('service_return', 'Service Item Return to Customer'),
    )
    
    task_type = models.CharField(max_length=20, choices=TASK_TYPES, default='order_delivery')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='deliveries', null=True, blank=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='deliveries', null=True, blank=True)
    
    partner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'delivery'}, null=True, blank=True)
    status = models.CharField(max_length=20, default='available') # available, assigned, picked_up, delivered
    
    # Tracking
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        obj_id = self.order.id if self.order else self.booking.id
        return f"{self.task_type} Task #{self.id} (Ref: {obj_id})"
