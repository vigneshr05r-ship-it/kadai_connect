from django.db import models
from django.conf import settings

class Store(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stores')
    name = models.CharField(max_length=255)
    name_ta = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True, default='Local shop')
    description_ta = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True, default='General')
    district = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True, default='Tamil Nadu')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    banner = models.ImageField(upload_to='banners/', blank=True, null=True)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    has_products = models.BooleanField(default=True)
    has_services = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Delivery Subsidy Controls
    first_order_free_enabled = models.BooleanField(default=True)
    max_free_delivery_cap = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
