import os
import django
from django.db import connection

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kadai_backend.settings")
django.setup()

def execute_sql(sql, description):
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            print(f"✅ {description}")
    except Exception as e:
        print(f"⚠️  Note on {description}: {e}")

# Manual creation of core Django system tables to stop the "catch-22" crashes
tables = [
    ("""
    CREATE TABLE IF NOT EXISTS `django_content_type` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `app_label` varchar(100) NOT NULL,
        `model` varchar(100) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """, "django_content_type"),

    ("""
    CREATE TABLE IF NOT EXISTS `django_migrations` (
        `id` bigint(20) NOT NULL AUTO_INCREMENT,
        `app` varchar(255) NOT NULL,
        `name` varchar(255) NOT NULL,
        `applied` datetime(6) NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """, "django_migrations"),

    ("""
    CREATE TABLE IF NOT EXISTS `auth_permission` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `name` varchar(255) NOT NULL,
        `content_type_id` int(11) NOT NULL,
        `codename` varchar(100) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
        KEY `auth_permission_content_type_id_2f476e4b` (`content_type_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """, "auth_permission"),

    ("""
    CREATE TABLE IF NOT EXISTS `django_session` (
        `session_key` varchar(40) NOT NULL,
        `session_data` longtext NOT NULL,
        `expire_date` datetime(6) NOT NULL,
        PRIMARY KEY (`session_key`),
        KEY `django_session_expire_date_a5c62663` (`expire_date`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """, "django_session")
]

print("Starting manual database synchronization...")
for sql, desc in tables:
    execute_sql(sql, f"Ensuring {desc} exists")

# Also ensure logo/banner columns
try:
    with connection.cursor() as cursor:
        cursor.execute("SHOW COLUMNS FROM stores_store LIKE 'logo'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE stores_store ADD COLUMN logo varchar(100) DEFAULT NULL")
            print("✅ Added 'logo' to stores_store")
        
        cursor.execute("SHOW COLUMNS FROM stores_store LIKE 'banner'")
        if not cursor.fetchone():
            cursor.execute("ALTER TABLE stores_store ADD COLUMN banner varchar(100) DEFAULT NULL")
            print("✅ Added 'banner' to stores_store")
except Exception as e:
    print(f"⚠️  Note on stores_store update: {e}")

print("\nDatabase sync complete! Now run: py manage.py migrate --fake-initial")
