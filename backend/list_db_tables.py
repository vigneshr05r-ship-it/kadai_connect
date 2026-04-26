import os
import django
from django.db import connection

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kadai_backend.settings")
django.setup()

def list_tables():
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("--- Tables in Database ---")
        for t in tables:
            print(f"- {t[0]}")
        print("--------------------------")

try:
    list_tables()
except Exception as e:
    print(f"Error listing tables: {e}")
