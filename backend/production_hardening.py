import os

# 1. Update settings.py to be fully dynamic
settings_path = r'c:\Users\acer\Documents\kadai_connect\backend\kadai_backend\settings.py'
with open(settings_path, 'r', encoding='utf-8') as f:
    settings_content = f.read()

# Replace hardcoded DB password with env var
target_db = "'PASSWORD': os.environ.get('DB_PASSWORD', 'Revathi@04'),"
replace_db = "'PASSWORD': os.environ.get('DB_PASSWORD', ''),"
settings_content = settings_content.replace(target_db, replace_db)

with open(settings_path, 'w', encoding='utf-8') as f:
    f.write(settings_content)
print("Settings hardened.")

# 2. Update .env to include the password
env_path = r'c:\Users\acer\Documents\kadai_connect\backend\.env'
with open(env_path, 'a', encoding='utf-8') as f:
    # Check if already there
    with open(env_path, 'r', encoding='utf-8') as f2:
        if 'DB_PASSWORD' not in f2.read():
            f.write("\nDB_PASSWORD=Revathi@04\n")
print(".env updated.")

# 3. Cleanup sensitive logs in views
views_to_clean = [
    r'c:\Users\acer\Documents\kadai_connect\backend\stores\views.py'
]

for v_path in views_to_clean:
    with open(v_path, 'r', encoding='utf-8') as f:
        v_content = f.read()
    v_content = v_content.replace('print(f"UPDATING STORE', '# print(f"UPDATING STORE')
    v_content = v_content.replace('print(f"STORE UPDATED', '# print(f"STORE UPDATED')
    with open(v_path, 'w', encoding='utf-8') as f:
        f.write(v_content)
print("View logs cleaned.")

# 4. Remove temporary scripts
scripts_to_remove = [
    'add_dashboard_back.py', 'add_delivery_back.py', 'add_global_back.py',
    'check_auth.py', 'check_db_conn.py', 'check_delivery_status.py',
    'check_locks.py', 'check_products.py', 'check_user.py',
    'diagnose_500.py', 'diagnose_jwt_hang.py', 'diagnose_orders_500.py',
    'diagnose_token.py', 'final_mock_cleanup.py', 'fix_categories.py',
    'fix_orders_back.py', 'fix_profile_back.py', 'fix_services_and_login.py',
    'fix_stores.py', 'fix_syntax.py', 'list_db_tables.py',
    'manual_db_sync.py', 'remove_global_back.py', 'run_migrations.py',
    'seed_categories.py', 'test_auth_hit.py', 'test_jwt.py',
    'test_login_api.py', 'test_order_api.py', 'test_order_logic.py',
    'test_post.py', 'test_register.py', 'test_upload.py',
    'update_serializer.py', 'update_settings.py', 'fix_profile_back.py',
    'final_mock_cleanup.py', 'remove_global_back.py'
]

backend_dir = r'c:\Users\acer\Documents\kadai_connect\backend'
for s in scripts_to_remove:
    p = os.path.join(backend_dir, s)
    if os.path.exists(p):
        try:
            os.remove(p)
        except: pass
print("Temporary scripts purged.")
