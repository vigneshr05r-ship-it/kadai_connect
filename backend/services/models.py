from django.db import models
from stores.models import Store
from django.conf import settings
from products.models import Category


class Service(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    name_ta = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True, default='')
    description_ta = models.TextField(blank=True, null=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(default=60)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    reviews_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} @ {self.store.name}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Confirmed', 'Confirmed'),
        ('ReadyForPickup', 'Ready for Pickup from Customer'),
        ('Assigned', 'Delivery Assigned'),
        ('PickedUp', 'Picked Up from Customer'),
        ('ArrivedAtStore', 'Arrived at Store'),
        ('ServiceInProgress', 'Service in Progress'),
        ('ReadyForReturn', 'Ready for Return to Customer'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_address = models.TextField(blank=True, null=True)
    customer_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    customer_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    booking_date = models.DateField()
    booking_time = models.TimeField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=10, default='COD') # COD, UPI, CARD
    payment_status = models.CharField(max_length=20, default='pending') # pending, paid, failed, refund_initiated, refund_completed
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Cancellation Info
    cancel_reason = models.TextField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancelled_by = models.CharField(max_length=20, blank=True, null=True) # customer, shopkeeper
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} – {self.service.name} by {self.customer_name}"
