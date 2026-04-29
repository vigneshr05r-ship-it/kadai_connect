from rest_framework import serializers
from .models import Store
from utils.geocoding import geocode_address


class StoreSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    banner_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    service_count = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = [
            'id', 'owner', 'name', 'name_ta', 'description', 'description_ta',
            'category', 'district', 'address', 'location', 'rating',
            'latitude', 'longitude',
            'logo', 'logo_url', 'banner', 'banner_url',
            'contact_name', 'phone', 'pincode',
            'has_products', 'has_services',
            'product_count', 'service_count',
            'first_order_free_enabled', 'max_free_delivery_cap',
            'created_at',
        ]
        read_only_fields = ('owner', 'rating', 'created_at', 'product_count', 'service_count')

    def get_product_count(self, obj):
        return obj.products.count()

    def get_service_count(self, obj):
        return obj.services.count()

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None

    def get_banner_url(self, obj):
        request = self.context.get('request')
        if obj.banner and request:
            return request.build_absolute_uri(obj.banner.url)
        return None

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        
        # Geocode if lat/lng missing
        if 'address' in validated_data and (not validated_data.get('latitude') or not validated_data.get('longitude')):
            lat, lng = geocode_address(validated_data['address'] + ', ' + validated_data.get('location', ''))
            if lat and lng:
                validated_data['latitude'] = lat
                validated_data['longitude'] = lng
                
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Geocode if address changed
        if 'address' in validated_data and validated_data['address'] != instance.address:
            lat, lng = geocode_address(validated_data['address'] + ', ' + validated_data.get('location', instance.location or ''))
            if lat and lng:
                validated_data['latitude'] = lat
                validated_data['longitude'] = lng
        return super().update(instance, validated_data)
