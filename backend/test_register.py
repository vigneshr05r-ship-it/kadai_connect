import os
import requests

# This is a scratch script to test registration API
url = "http://localhost:8000/api/users/"
data = {
    "username": "testuser_unique_124",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer",
    "phone": "1234567890",
    "name": "Test User"
}

try:
    # Try without files first
    response = requests.post(url, data=data)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")

    # Try as shopkeeper with files
    files = {
        "logo": ("logo.png", b"fake binary content", "image/png"),
        "banner": ("banner.png", b"fake binary content", "image/png")
    }
    data_sk = {
        "username": "shopkeeper_unique_124",
        "email": "shop@example.com",
        "password": "password123",
        "role": "shopkeeper",
        "store_name": "My Cool Store",
        "store_category": "Textiles",
        "pincode": "600001"
    }
    response_sk = requests.post(url, data=data_sk, files=files)
    print(f"SK Status: {response_sk.status_code}")
    print(f"SK Body: {response_sk.text}")
except Exception as e:
    print(f"Error: {e}")
