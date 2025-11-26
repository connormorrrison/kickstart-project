"""
Test authentication endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_register():
    print("=" * 50)
    print("Testing Registration")
    print("=" * 50)

    user_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password": "password123"
    }

    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        print("✅ Registration successful!")
        return response.json()
    else:
        print("❌ Registration failed!")
        return None

def test_login(email, password):
    print("\n" + "=" * 50)
    print("Testing Login")
    print("=" * 50)

    login_data = {
        "email": email,
        "password": password
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("✅ Login successful!")
        return response.json()["access_token"]
    else:
        print("❌ Login failed!")
        return None

def test_get_me(token):
    print("\n" + "=" * 50)
    print("Testing Get Current User")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("✅ Get current user successful!")
        return response.json()
    else:
        print("❌ Get current user failed!")
        return None

if __name__ == "__main__":
    print("\n🚀 Starting Authentication Tests\n")

    # Test registration
    user = test_register()

    if user:
        # Test login
        token = test_login("test@example.com", "password123")

        if token:
            # Test get current user
            current_user = test_get_me(token)

            if current_user:
                print("\n" + "=" * 50)
                print("✅ ALL TESTS PASSED!")
                print("=" * 50)
            else:
                print("\n❌ Get current user test failed")
        else:
            print("\n❌ Login test failed")
    else:
        print("\n❌ Registration test failed")
        print("\nNote: User might already exist. Try testing login directly.")

        # Try login anyway in case user exists
        token = test_login("test@example.com", "password123")
        if token:
            test_get_me(token)
