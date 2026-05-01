from rest_framework import viewsets, permissions, serializers
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .utils import resolve_category
from stores.models import Store


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('store', 'category').order_by('-created_at')
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # SECURITY: Only show products from active stores
        qs = self.queryset.filter(store__is_active=True)
        
        # If logged in as shopkeeper, only show products for THEIR store
        if user.is_authenticated and getattr(user, 'role', '') == 'shopkeeper':
            return qs.filter(store__owner=user)

        store_id = self.request.query_params.get('store_id')
        if store_id:
            return qs.filter(store_id=store_id)
        return qs

    def _get_or_create_store(self, user):
        """Auto-create a store for the shopkeeper if one doesn't exist yet."""
        store = Store.objects.filter(owner=user).first()
        if not store:
            store = Store.objects.create(
                owner=user,
                name=getattr(user, 'username', 'My Store') + "'s Store",
                description='My local store',
                category='General',
                location='Tamil Nadu',
            )
        return store

    def perform_create(self, serializer):
        store = self._get_or_create_store(self.request.user)
        category = resolve_category(self.request.data, default_type='product')
        
        if not category:
            raise serializers.ValidationError({"category": "A valid category selection is mandatory."})
            
        desc = self.request.data.get('description') or self.request.data.get('desc') or ''
        serializer.save(store=store, category=category, description=desc)

    def perform_update(self, serializer):
        category = resolve_category(self.request.data, default_type='product')
        if category:
            serializer.save(category=category)
        else:
            serializer.save()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        qs = self.queryset
        type_param = self.request.query_params.get('type')
        if type_param:
            from django.db.models import Q
            qs = qs.filter(Q(type=type_param) | Q(type='both'))
        
        top_level = self.request.query_params.get('top_level')
        if top_level == 'true':
            qs = qs.filter(parent=None)
            
        return qs

    def list(self, request, *args, **kwargs):
        # Auto-seed if empty
        try:
            if not Category.objects.exists():
                self._seed_categories()
        except Exception as e:
            print(f"Seeding error: {e}")
        return super().list(request, *args, **kwargs)

    def _seed_categories(self):
        defaults = [
            {'name': 'Textiles', 'name_ta': 'துணிகள்', 'icon': '👗', 'type': 'product'},
            {'name': 'Groceries', 'name_ta': 'மளிகை', 'icon': '🫙', 'type': 'product'},
            {'name': 'Lamps & Decor', 'name_ta': 'விளக்குகள்', 'icon': '🪔', 'type': 'product'},
            {'name': 'Crackers', 'name_ta': 'பட்டாசுகள்', 'icon': '🎆', 'type': 'product'},
            {'name': 'Services', 'name_ta': 'சேவைகள்', 'icon': '✂️', 'type': 'service'},
        ]
        for d in defaults:
            Category.objects.get_or_create(name=d['name'], defaults=d)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

