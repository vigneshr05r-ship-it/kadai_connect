from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_name_ta = serializers.ReadOnlyField(source='product.name_ta')
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ('order',)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('customer', 'created_at')

    def create(self, validated_data):
        items_data = self.context.get('request').data.get('items', [])
        # Pop items if it exists in validated_data to avoid 'Order() got an unexpected keyword argument' error
        validated_data.pop('items', None)
        
        validated_data['customer'] = self.context['request'].user
        
        # Determine store from the first product
        if items_data:
            try:
                first_product = Product.objects.get(id=items_data[0].get('product'))
                validated_data['store'] = first_product.store
            except Product.DoesNotExist:
                pass

        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            product = Product.objects.get(id=item_data.get('product'))
            quantity = max(1, int(item_data.get('quantity', 1)))
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price # SECURITY: Use actual product price from DB
            )
        return order
