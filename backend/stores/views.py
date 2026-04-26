from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Store
from .serializers import StoreSerializer

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get', 'patch', 'put'])
    def mine(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response({'detail': 'No store found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method in ['PATCH', 'PUT']:
            serializer = self.get_serializer(store, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        serializer = self.get_serializer(store)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Returns a high-density summary of store capabilities and metrics."""
        store = self.get_object()
        serializer = self.get_serializer(store)
        data = serializer.data
        return Response({
            'name': data['name'],
            'rating': data['rating'],
            'product_count': data['product_count'],
            'service_count': data['service_count'],
            'has_products': data['has_products'],
            'has_services': data['has_services'],
            'capabilities': [
                {'type': 'Products', 'active': data['has_products'], 'count': data['product_count']},
                {'type': 'Services', 'active': data['has_services'], 'count': data['service_count']}
            ]
        })

    @action(detail=False, methods=['delete'])
    def delete_account(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response({'detail': 'No store found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Soft delete the store
        store.is_active = False
        store.save()
        
        # Optionally, soft delete the user or mark inactive
        user = request.user
        user.is_active = False
        user.save()
        
        return Response({'detail': 'Account successfully deleted.'}, status=status.HTTP_200_OK)
