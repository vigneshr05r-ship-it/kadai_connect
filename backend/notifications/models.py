from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPES = (
        ('order', 'Order Update'),
        ('delivery', 'Delivery Update'),
        ('system', 'System Message'),
        ('promotion', 'Promotion'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional link to a specific object (e.g. Order ID)
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"
