import os
from django.core.wsgi import get_wsgi_application

try:
    from dotenv import load_dotenv
    from pathlib import Path
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kadai_backend.settings')
application = get_wsgi_application()
