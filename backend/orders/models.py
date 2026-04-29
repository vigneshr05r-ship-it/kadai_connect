from django.db import models
from django.conf import settings
from products.models import Product
from stores.models import Store

class Order(models.Model):
    STATUS_CHOICES = (
        ('new', 'New'),
        ('payment_pending', 'Payment Pending'),
        ('confirmed', 'Confirmed'),
        ('packed', 'Packed'),
        ('ready', 'Ready for Pickup'),
        ('assigned', 'Delivery Assigned'),
        ('picked_up', 'Picked Up'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('returning_to_store', 'Returning to Store'),
        ('returned_to_store', 'Returned to Store'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_METHODS = (
        ('COD', 'Cash on Delivery'),
        ('UPI', 'UPI (GPay/PhonePe)'),
        ('CARD', 'Debit/Credit Card'),
        ('WALLET', 'Wallet'),
    )
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refund_initiated', 'Refund Initiated'),
        ('refund_completed', 'Refund Completed'),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    customer_paid_delivery = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    shopkeeper_paid_delivery = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    distance_km = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_first_order_deal = models.BooleanField(default=False)
    
    address = models.TextField()
    customer_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    customer_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Payment Info
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='COD')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Cancellation Info
    cancel_reason = models.TextField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancelled_by = models.CharField(max_length=20, blank=True, null=True) # customer, shopkeeper
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history', null=True, blank=True)
    booking = models.ForeignKey('services.Booking', on_delete=models.CASCADE, related_name='status_history', null=True, blank=True)
    status = models.CharField(max_length=50)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Order Status Histories"

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    booking = models.ForeignKey('services.Booking', on_delete=models.CASCADE, related_name='payments', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20)
    status = models.CharField(max_length=20) # pending, success, failed, refunded
    transaction_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
