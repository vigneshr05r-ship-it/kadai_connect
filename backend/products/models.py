from django.db import models
from stores.models import Store

class Category(models.Model):
    TYPE_CHOICES = (
        ('product', 'Product'),
        ('service', 'Service'),
        ('both', 'Both'),
    )
    name = models.CharField(max_length=100)
    name_ta = models.CharField(max_length=100, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='product')
    icon = models.CharField(max_length=50, default='📦')
    
    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return f"{self.name} ({self.type})"

class Product(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=255)
    name_ta = models.CharField(max_length=255, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True, default='')
    description_ta = models.TextField(blank=True, null=True, default='')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    stock = models.IntegerField(default=10, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Detailed fields
    color = models.CharField(max_length=100, blank=True, null=True)
    size = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)

    # AI generated fields
    marketing_caption = models.TextField(blank=True, null=True)
    suggested_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.name
