from rest_framework import serializers
from .models import Store


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
            'logo', 'logo_url', 'banner', 'banner_url',
            'contact_name', 'phone', 'pincode',
            'has_products', 'has_services',
            'product_count', 'service_count',   # ← metrics for summary
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
        return super().create(validated_data)
