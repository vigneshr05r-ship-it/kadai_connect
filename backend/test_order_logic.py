import requests

BASE_URL = 'http://localhost:8005/api'

def test_order_creation():
    # 1. Login to get token (Customer)
    login_data = {
        'username': 'customer1', # Assuming this user exists from previous turns
        'password': 'password123'
    }
    # Wait, I don't know the password. I'll use the one I set in earlier turn.
    # Actually, I'll just check the DB to find a user.
    
    # Let's try to create an order with a known product ID.
    # I'll find a product first.
    resp = requests.get(f"{BASE_URL}/products/")
    products = resp.json()
    if not products:
        print("No products found")
        return
    
    product = products[0]
    product_id = product['id']
    print(f"Testing with Product ID: {product_id} from Store: {product['store_name']}")
    
    # Order data
    order_data = {
        'items': [
            {
                'product': product_id,
                'quantity': 2,
                'price': 10 # This should be ignored by my new security logic
            }
        ],
        'total_price': 20, # This might also be re-calculated or ignored
        'status': 'pending'
    }
    
    # We need authentication. I'll use the token from a login.
    # I'll create a user if needed, but let's assume 'customer' exists.
    # For this test, I'll just use a manually created token if I can find one or skip auth for a moment if I can (but I can't).
    
    print("Please ensure you have a valid token or user. Running as anonymous will fail.")
    # I'll stop here and just verify the serializer logic by running a management command shell.

if __name__ == "__main__":
    test_order_creation()
