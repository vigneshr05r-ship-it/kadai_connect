import os
import django
from django.core.management import call_command

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kadai_backend.settings")
django.setup()

try:
    print("Running makemigrations for stores...")
    call_command('makemigrations', 'stores')
    print("Running migrate...")
    call_command('migrate')
    print("Migrations complete!")
except Exception as e:
    print(f"Error during migrations: {e}")
