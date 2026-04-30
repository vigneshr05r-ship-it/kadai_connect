from rest_framework import serializers
from .models import Service, Booking


class ServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'store', 'category', 'category_name', 'name', 'name_ta', 'description', 'description_ta',
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
    store_phone = serializers.CharField(source='store.phone', read_only=True)
    status_history = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'store', 'store_name', 'store_phone', 'service', 'service_name', 'service_duration',
            'customer', 'customer_name', 'customer_phone', 'customer_email',
            'booking_date', 'booking_time', 'notes', 'status', 
            'payment_method', 'payment_status', 'transaction_id',
            'cancel_reason', 'cancelled_at', 'cancelled_by', 'status_history', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'customer', 'status_history', 'cancelled_by']

    def get_status_history(self, obj):
        from orders.models import OrderStatusHistory
        history = OrderStatusHistory.objects.filter(booking=obj).order_by('created_at')
        return [
            {'status': h.status, 'notes': h.notes, 'created_at': h.created_at}
            for h in history
        ]

    def validate(self, data):
        """
        Check that the booking slot is not already taken.
        """
        store = data.get('store')
        booking_date = data.get('booking_date')
        booking_time = data.get('booking_time')

        if not store or not booking_date or not booking_time:
            return data

        existing_booking = Booking.objects.filter(
            store=store,
            booking_date=booking_date,
            booking_time=booking_time,
            status__in=['Confirmed', 'Pending', 'Accepted', 'ServiceInProgress']
        ).exists()

        if existing_booking:
            raise serializers.ValidationError("This time slot is already booked. Please choose another time.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['customer'] = user
        
        booking = super().create(validated_data)
        
        # Initialize History
        from orders.models import OrderStatusHistory
        OrderStatusHistory.objects.create(booking=booking, status='Pending', notes='Booking requested by customer')
        
        return booking
