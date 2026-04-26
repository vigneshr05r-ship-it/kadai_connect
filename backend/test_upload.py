import os
import django
import requests

# Assuming the server is running at localhost:8000
# We need a token. Let's try to get one if we have credentials.

BASE_URL = "http://localhost:8000/api"

def test_upload():
    # 1. Login
    login_resp = requests.post(f"{BASE_URL}/token/", json={"username": "test_user1", "password": "password"})
    if login_resp.status_code != 200:
        print("Login failed:", login_resp.text)
        return
    token = login_resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload with image
    # We need a dummy image file
    with open("dummy.png", "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

    with open("dummy.png", "rb") as f:
        files = {'image': f}
        data = {
            'name': 'Test Gallery Product',
            'price': '999.00',
            'description': 'A product uploaded with a real image file.',
            'category_name': 'Textiles'
        }
        resp = requests.post(f"{BASE_URL}/products/", headers=headers, data=data, files=files)
        print("Upload Status:", resp.status_code)
        if resp.status_code == 201:
            product = resp.json()
            print("Product Image URL:", product.get('image'))
        else:
            print("Upload Error:", resp.text)

if __name__ == "__main__":
    test_upload()
