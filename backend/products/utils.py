from rest_framework import serializers
from .models import Category

def resolve_category(request_data, default_type='product'):
    """
    Shared logic for resolving categories (IDs or 'Others').
    Expected request_data: {'category': 123} OR {'category': 'others', 'new_category_name': 'My Cat', 'type': 'product', 'parent': 1}
    """
    category_id = request_data.get('category')
    
    if category_id == 'others':
        new_name = request_data.get('new_category_name', '').strip()
        if not new_name:
            raise serializers.ValidationError({"category": "Category name is required when 'Others' is selected."})
        
        # Normalize and check duplicate
        normalized_name = new_name.capitalize()
        parent_id = request_data.get('parent')
        
        existing = Category.objects.filter(name__iexact=normalized_name, parent_id=parent_id).first()
        if existing:
            return existing
        
        # Create new category
        return Category.objects.create(
            name=normalized_name,
            parent_id=parent_id,
            type=request_data.get('type', default_type),
            icon='📦'
        )
        
    if category_id and str(category_id).isdigit():
        return Category.objects.filter(id=category_id).first()
        
    return None
