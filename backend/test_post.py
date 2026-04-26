import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kadai_backend.settings")
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

user, _ = User.objects.get_or_create(username='test_user1', email='test1@test.com', role='shopkeeper')
user.set_password('password')
user.save()

from stores.models import Store
store, _ = Store.objects.get_or_create(owner=user, name='test_store1')

from rest_framework_simplejwt.tokens import RefreshToken
refresh = RefreshToken.for_user(user)
token = str(refresh.access_token)

print("Testing authenticated POST...")
client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
resp2 = client.post('/api/products/', {'name': 'test', 'price': 100, 'description': 'desc'}, format='json')
print("Auth Status:", resp2.status_code)
print("Auth Content:", resp2.content.decode('utf-8'))
