from rest_framework import serializers
from .models import DeliveryAssignment

class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    # Helpful read-only fields for the UI
    pickup_address = serializers.SerializerMethodField()
    delivery_address = serializers.SerializerMethodField()
    pickup_coords = serializers.SerializerMethodField()
    delivery_coords = serializers.SerializerMethodField()
    customer_details = serializers.SerializerMethodField()
    store_details = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryAssignment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_pickup_address(self, obj):
        try:
            if obj.task_type == 'order_delivery':
                return obj.order.store.address if obj.order and obj.order.store else "Store"
            if obj.task_type == 'service_pickup':
                return obj.booking.customer_address if obj.booking and hasattr(obj.booking, 'customer_address') else "Customer Home"
            return "N/A"
        except: return "N/A"

    def get_delivery_address(self, obj):
        try:
            if obj.task_type == 'order_delivery':
                return obj.order.address if obj.order else "Customer"
            if obj.task_type == 'service_pickup':
                return obj.booking.store.address if obj.booking else "Store"
            return "N/A"
        except: return "N/A"

    def get_pickup_coords(self, obj):
        try:
            if obj.task_type == 'order_delivery':
                if obj.order and obj.order.store and obj.order.store.latitude:
                    return {'lat': float(obj.order.store.latitude), 'lng': float(obj.order.store.longitude)}
            elif obj.task_type == 'service_pickup':
                if obj.booking and hasattr(obj.booking, 'customer_lat') and obj.booking.customer_lat:
                    return {'lat': float(obj.booking.customer_lat), 'lng': float(obj.booking.customer_lng)}
            return None
        except: return None

    def get_delivery_coords(self, obj):
        try:
            if obj.task_type == 'order_delivery':
                if obj.order and obj.order.customer_lat:
                    return {'lat': float(obj.order.customer_lat), 'lng': float(obj.order.customer_lng)}
            elif obj.task_type == 'service_pickup':
                if obj.booking and obj.booking.store and obj.booking.store.latitude:
                    return {'lat': float(obj.booking.store.latitude), 'lng': float(obj.booking.store.longitude)}
            return None
        except: return None

    def get_customer_details(self, obj):
        try:
            target = obj.order if obj.order else obj.booking
            if not target: return {}
            return {
                'name': getattr(target, 'customer_name', target.customer.username if hasattr(target, 'customer') and target.customer else 'Guest'),
                'phone': getattr(target, 'customer_phone', target.customer.phone if hasattr(target, 'customer') and hasattr(target.customer, 'phone') else '')
            }
        except: return {}

    def get_store_details(self, obj):
        try:
            store = None
            if obj.order: store = obj.order.store
            elif obj.booking: store = obj.booking.store
            if not store: return {}
            return {
                'name': store.name,
                'phone': store.phone,
                'address': store.address
            }
        except: return {}
