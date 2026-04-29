import firebase_admin
from firebase_admin import credentials, messaging
import os
from django.conf import settings
from .models import Notification

# Initialize firebase admin SDK
_firebase_app = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app:
        return _firebase_app

    try:
        # Production: credentials from env var (dict)
        if getattr(settings, 'FIREBASE_CREDENTIALS', None):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
            _firebase_app = firebase_admin.initialize_app(cred)
            return _firebase_app

        # Development: credentials from local file
        cert_path = getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_KEY', None)
        if cert_path and os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            return _firebase_app
    except Exception as e:
        print(f"Firebase Init Error: {e}")

    return None

def create_notification(user, title, message, notification_type='system', link=None, data=None):
    """
    Primary utility to create a notification.
    Saves to DB and attempts to send FCM push.
    """
    # 1. Create DB record
    notif = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link
    )

    # 2. Attempt FCM Push
    if user.fcm_token:
        app = get_firebase_app()
        if app:
            try:
                payload = data or {}
                if link:
                    payload['link'] = link
                payload['type'] = notification_type

                # FCM data values must be strings
                fcm_data = {k: str(v) for k, v in payload.items()}

                fcm_message = messaging.Message(
                    notification=messaging.Notification(
                        title=title,
                        body=message,
                    ),
                    data=fcm_data,
                    token=user.fcm_token,
                )
                messaging.send(fcm_message)
            except Exception as e:
                print(f"FCM Push Error: {e}")

    return notif

def send_push_notification(user, title, message, data=None):
    """Alias for backward compatibility"""
    return create_notification(user, title, message, data=data)
