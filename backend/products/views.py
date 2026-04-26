from rest_framework import viewsets, permissions
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
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

    def _resolve_category(self, name):
        """Resolve category by name string, creating it if needed."""
        if not name or name in ('', 'Other', 'General'):
            name = 'General'
        category, _ = Category.objects.get_or_create(name=name)
        return category

    def perform_create(self, serializer):
        store = self._get_or_create_store(self.request.user)
        category_name = self.request.data.get('category') or self.request.data.get('category_name', '')
        category = self._resolve_category(category_name)
        # Frontend sends 'desc'; model expects 'description'
        desc = (
            self.request.data.get('description')
            or self.request.data.get('desc')
            or ''
        )
        serializer.save(store=store, category=category, description=desc)

    def perform_update(self, serializer):
        category_name = self.request.data.get('category') or self.request.data.get('category_name', '')
        if category_name:
            category = self._resolve_category(category_name)
            serializer.save(category=category)
        else:
            serializer.save()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

