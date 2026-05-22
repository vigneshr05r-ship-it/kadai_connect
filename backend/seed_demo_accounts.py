import os
import django
import uuid

# Set up Django environment
from pathlib import Path
env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line: continue
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip().strip("'").strip('"'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kadai_backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from users.models import User
from stores.models import Store
from products.models import Category

def run_seed():
    print("Seeding Demo Accounts...")

    # 1. Customer Demo
    customer, created = User.objects.get_or_create(
        email='demo_customer@mail.com',
        defaults={
            'username': 'demo_customer@mail.com',
            'password': make_password(uuid.uuid4().hex),
            'role': 'customer',
            'first_name': 'Eva',
            'last_name': 'Customer',
            'phone': '9876543210',
            'is_active': True,
        }
    )
    if created: print("Created Demo Customer")

    # 2. Delivery Demo
    delivery, created = User.objects.get_or_create(
        email='demo_delivery@mail.com',
        defaults={
            'username': 'demo_delivery@mail.com',
            'password': make_password(uuid.uuid4().hex),
            'role': 'delivery',
            'first_name': 'Dev',
            'last_name': 'Rider',
            'phone': '9876543211',
            'is_active': True,
            'district': 'Chennai'
        }
    )
    if created: print("Created Demo Delivery Partner")

    # 3. Shopkeeper Demo
    shopkeeper, created = User.objects.get_or_create(
        email='demo_shopkeeper@mail.com',
        defaults={
            'username': 'demo_shopkeeper@mail.com',
            'password': make_password(uuid.uuid4().hex),
            'role': 'shopkeeper',
            'first_name': 'Sam',
            'last_name': 'Merchant',
            'phone': '9876543212',
            'is_active': True,
            'district': 'Chennai'
        }
    )
    if created: print("Created Demo Shopkeeper")

    # Create Store for Shopkeeper if not exists
    store, s_created = Store.objects.get_or_create(
        owner=shopkeeper,
        defaults={
            'name': 'Demo Mega Mart',
            'address': '123 Tech Park, Taramani',
            'location': 'Chennai',
            'district': 'Chennai',
            'phone': '9876543212',
            'category': 'Supermarket',
            'is_active': True
        }
    )
    if s_created: print("Created Demo Store for Shopkeeper")

    # Ensure categories exist
    cat, _ = Category.objects.get_or_create(name='Groceries', defaults={'type': 'product'})
    
    # Add dummy product if store has none
    if store.products.count() == 0:
        from products.models import Product
        Product.objects.create(
            store=store,
            name='Premium Aashirvaad Atta 5kg',
            description='Demo product for evaluation.',
            price=245.00,
            stock=50,
            category=cat
        )
        print("Added sample product to Demo Store")

    print("Demo Seeding Complete!")

if __name__ == '__main__':
    run_seed()
