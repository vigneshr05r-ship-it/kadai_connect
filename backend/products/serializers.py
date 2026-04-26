from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True, default='Unknown Store')
    store_name_ta = serializers.CharField(source='store.name_ta', read_only=True, default='')
    category_name = serializers.CharField(source='category.name', read_only=True, default='General')
    category_name_ta = serializers.CharField(source='category.name_ta', read_only=True, default='')

    # These are set automatically server-side; not required from frontend
    store = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(read_only=True, allow_null=True)
    description = serializers.CharField(required=False, default='', allow_blank=True)

    class Meta:
        model = Product
        fields = '__all__'

