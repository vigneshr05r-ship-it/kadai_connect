import requests
try:
    resp = requests.post("http://localhost:8000/api/users/", json={"username":"testuser2","email":"test2@test.com","password":"password","role":"shopkeeper"})
    print("User create:", resp.status_code, resp.text)
    
    resp2 = requests.post("http://localhost:8000/api/token/", json={"username":"testuser2","password":"password"})
    print("Token:", resp2.status_code)
    
    token = resp2.json().get('access')
    resp3 = requests.post("http://localhost:8000/api/products/", json={"name":"test","price":10,"description":"test"}, headers={"Authorization": f"Bearer {token}"})
    print("Product Create:", resp3.status_code, resp3.text)
except Exception as e:
    print(e)
