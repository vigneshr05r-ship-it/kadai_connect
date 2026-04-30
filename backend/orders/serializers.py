from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from products.models import Product
from utils.geocoding import geocode_address

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_name_ta = serializers.ReadOnlyField(source='product.name_ta')
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ('order',)


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['status', 'notes', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    # Use different fields for reading and writing to handle mock IDs safely
    items = OrderItemSerializer(many=True, read_only=True)
    input_items = serializers.JSONField(write_only=True, required=False)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    
    customer_name = serializers.ReadOnlyField(source='customer.first_name')
    customer_phone = serializers.ReadOnlyField(source='customer.phone')
    customer_email = serializers.ReadOnlyField(source='customer.email')
    
    store_lat = serializers.SerializerMethodField()
    store_lng = serializers.SerializerMethodField()
    
    delivery_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('customer', 'created_at', 'items', 'status_history', 'cancelled_by', 'store_lat', 'store_lng')

    def get_store_lat(self, obj):
        if obj.store and obj.store.latitude is not None:
            return float(obj.store.latitude)
        return None

    def get_store_lng(self, obj):
        if obj.store and obj.store.longitude is not None:
            return float(obj.store.longitude)
        return None

    def get_delivery_info(self, obj):
        try:
            from delivery.models import DeliveryAssignment
            assignment = DeliveryAssignment.objects.filter(order=obj).last()
            if not assignment:
                return None
                
            p = assignment.partner
            p_name = "Unassigned"
            if p:
                p_name = (f"{p.first_name or ''} {p.last_name or ''}").strip() or p.username
            
            # Helper to safely convert coordinates to float
            def safe_float(val):
                if val is None: return None
                try:
                    return float(val)
                except (ValueError, TypeError):
                    return None

            return {
                'partner_name': p_name,
                'partner_phone': p.phone if p else '',
                'status': assignment.status,
                'lat': safe_float(assignment.current_lat),
                'lng': safe_float(assignment.current_lng),
                'updated_at': assignment.updated_at
            }
        except Exception as e:
            print(f"Error in OrderSerializer.get_delivery_info: {str(e)}")
            return None

    def create(self, validated_data):
        # Get items from input_items (JSON) or fallback to items
        items_data = validated_data.pop('input_items', [])
        if not items_data:
            items_data = self.context.get('request').data.get('items', [])
        
        user = self.context['request'].user
        validated_data['customer'] = user
        
        # Geocode customer address
        if 'address' in validated_data and (not validated_data.get('customer_lat') or not validated_data.get('customer_lng')):
            lat, lng = geocode_address(validated_data['address'])
            if lat and lng:
                validated_data['customer_lat'] = lat
                validated_data['customer_lng'] = lng
        
        # 1. Calculate Delivery Fee (Production logic)
        distance = float(validated_data.get('distance_km', 2.0)) # Default 2km if not provided
        base_fee = 20
        rate_per_km = 8
        total_delivery_fee = base_fee + (distance * rate_per_km)
        
        validated_data['delivery_charge'] = total_delivery_fee
        validated_data['distance_km'] = distance
        
        # 2. Apply First Order Discount Split
        customer_pay = total_delivery_fee
        shopkeeper_pay = 0
        
        # Check if store exists to get subsidy rules
        try:
            first_pid = items_data[0].get('product') if items_data else None
            if first_pid:
                product = Product.objects.get(id=first_pid)
                store = product.store
                validated_data['store'] = store
                
                if user.is_first_order and store.first_order_free_enabled:
                    max_cap = float(store.max_free_delivery_cap)
                    shopkeeper_pay = min(total_delivery_fee, max_cap)
                    customer_pay = max(0, total_delivery_fee - shopkeeper_pay)
                    
                    validated_data['is_first_order_deal'] = True
                    # Reset user first order status
                    user.is_first_order = False
                    user.save()
        except Exception:
            pass

        validated_data['customer_paid_delivery'] = customer_pay
        validated_data['shopkeeper_paid_delivery'] = shopkeeper_pay

        order = Order.objects.create(**validated_data)
        
        # Initialize History
        from .models import OrderStatusHistory
        OrderStatusHistory.objects.create(order=order, status='new', notes='Order placed by customer')
        
        for item_data in items_data:
            try:
                product_id = item_data.get('product')
                if not product_id or not str(product_id).isdigit():
                    continue # Skip mock IDs like 'mock-1'
                
                product = Product.objects.get(id=product_id)
                quantity = max(1, int(item_data.get('quantity', 1)))
                
                # PRODUCTION: Check Stock
                if product.stock < quantity:
                    raise serializers.ValidationError(f"Low stock for {product.name}. Available: {product.stock}")
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price # SECURITY: Use actual product price from DB
                )
                
                # PRODUCTION: Decrement Stock
                product.stock -= quantity
                product.save()
                
            except (Product.DoesNotExist, ValueError, TypeError):
                continue
        return order
