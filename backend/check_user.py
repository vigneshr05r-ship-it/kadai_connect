import os
import django

# Set up Django environment
import sys
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kadai_backend.settings") # CORRECTED
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("--- User List ---")
users = User.objects.all()
if not users:
    print("No users found.")
for u in users:
    print(f"ID: {u.id} | User: {u.username} | Email: {u.email} | Role: {getattr(u, 'role', 'N/A')}")
print("-----------------")
