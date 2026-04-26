from rest_framework import serializers
from .models import DeliveryAssignment

class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    # Helpful read-only fields for the UI
    pickup_address = serializers.SerializerMethodField()
    delivery_address = serializers.SerializerMethodField()
    customer_details = serializers.SerializerMethodField()
    store_details = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryAssignment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_pickup_address(self, obj):
        if obj.task_type == 'order_delivery':
            return obj.order.store.address if obj.order and obj.order.store else "Store"
        if obj.task_type == 'service_pickup':
            return obj.booking.customer_address if obj.booking and hasattr(obj.booking, 'customer_address') else "Customer Home"
        return "N/A"

    def get_delivery_address(self, obj):
        if obj.task_type == 'order_delivery':
            return obj.order.address if obj.order else "Customer"
        if obj.task_type == 'service_pickup':
            return obj.booking.store.address if obj.booking else "Store"
        return "N/A"

    def get_customer_details(self, obj):
        target = obj.order if obj.order else obj.booking
        if not target: return {}
        return {
            'name': getattr(target, 'customer_name', target.customer.username if hasattr(target, 'customer') and target.customer else 'Guest'),
            'phone': getattr(target, 'customer_phone', target.customer.phone if hasattr(target, 'customer') and hasattr(target.customer, 'phone') else '')
        }

    def get_store_details(self, obj):
        store = None
        if obj.order: store = obj.order.store
        elif obj.booking: store = obj.booking.store
        if not store: return {}
        return {
            'name': store.name,
            'phone': store.phone,
            'address': store.address
        }
