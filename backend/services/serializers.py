from rest_framework import serializers
from .models import Service, Booking


class ServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'store', 'name', 'name_ta', 'description', 'description_ta',
            'price', 'duration_minutes', 'image', 'image_url', 'bookings_count', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'store', 'bookings_count']

    def get_bookings_count(self, obj):
        return obj.bookings.count()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class BookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_duration = serializers.IntegerField(source='service.duration_minutes', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'store', 'store_name', 'service', 'service_name', 'service_duration',
            'customer', 'customer_name', 'customer_phone', 'customer_email',
            'booking_date', 'booking_time', 'notes', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'customer']

    def create(self, validated_data):
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['customer'] = user
        return super().create(validated_data)
