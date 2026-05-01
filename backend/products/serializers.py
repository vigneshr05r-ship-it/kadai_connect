from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'name_ta', 'parent', 'parent_name', 'type', 'icon', 'subcategories']

    def get_subcategories(self, obj):
        # Only return subcategories if this is a top-level category
        if obj.parent is None:
            subs = obj.subcategories.all()
            return CategorySerializer(subs, many=True).data
        return []


class ProductSerializer(serializers.ModelSerializer):
    store_name = serializers.ReadOnlyField(source='store.name')
    store_name_ta = serializers.ReadOnlyField(source='store.name_ta')
    category_name = serializers.ReadOnlyField(source='category.name')
    category_name_ta = serializers.ReadOnlyField(source='category.name_ta')
    image_url = serializers.SerializerMethodField()

    # These are set automatically server-side; not required from frontend
    store = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(read_only=True, allow_null=True)
    description = serializers.CharField(required=False, default='', allow_blank=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

