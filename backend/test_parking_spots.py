"""
Test parking spots endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Store token and spot_id globally for reuse
token = None
created_spot_id = None

def test_login():
    """Login first to get auth token"""
    print("=" * 50)
    print("Logging in to get auth token")
    print("=" * 50)

    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        global token
        token = response.json()["access_token"]
        print("✅ Login successful!")
        print(f"Token: {token[:50]}...")
        return token
    else:
        print("❌ Login failed!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return None

def test_create_spot(auth_token):
    """Test creating a new parking spot"""
    print("\n" + "=" * 50)
    print("Testing Create Parking Spot")
    print("=" * 50)

    spot_data = {
        "street": "123 Main Street",
        "city": "Vancouver",
        "province": "BC",
        "postal_code": "V6B 1A1",
        "country": "Canada",
        "lat": 49.2827,
        "lng": -123.1207,
        "price_per_hour": 5.50,
        "availability_intervals": [
            {
                "day": "Monday",
                "start_time": "09:00",
                "end_time": "17:00"
            },
            {
                "day": "Tuesday",
                "start_time": "09:00",
                "end_time": "17:00"
            },
            {
                "day": "Wednesday",
                "start_time": "09:00",
                "end_time": "17:00"
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.post(f"{BASE_URL}/spots", json=spot_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        print("✅ Parking spot created successfully!")
        global created_spot_id
        created_spot_id = response.json()["id"]
        return created_spot_id
    else:
        print("❌ Failed to create parking spot!")
        return None

def test_list_spots():
    """Test listing all parking spots"""
    print("\n" + "=" * 50)
    print("Testing List Parking Spots")
    print("=" * 50)

    response = requests.get(f"{BASE_URL}/spots")
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        spots = response.json()
        print(f"Found {len(spots)} parking spots")
        for spot in spots:
            print(f"\n  Spot ID: {spot['id']}")
            print(f"  Address: {spot['street']}, {spot['city']}, {spot['province']}")
            print(f"  Price: ${spot['price_per_hour']}/hour")
            print(f"  Availability: {len(spot.get('availability_intervals', []))} intervals")
        print("\n✅ Successfully listed parking spots!")
        return spots
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("❌ Failed to list parking spots!")
        return None

def test_list_spots_with_filters():
    """Test listing parking spots with filters"""
    print("\n" + "=" * 50)
    print("Testing List Parking Spots with Filters (city=Vancouver)")
    print("=" * 50)

    response = requests.get(f"{BASE_URL}/spots?city=Vancouver&min_price=3&max_price=10")
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        spots = response.json()
        print(f"Found {len(spots)} parking spots matching filters")
        print("✅ Successfully listed filtered parking spots!")
        return spots
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("❌ Failed to list filtered parking spots!")
        return None

def test_get_spot(spot_id):
    """Test getting a specific parking spot"""
    print("\n" + "=" * 50)
    print(f"Testing Get Parking Spot (ID: {spot_id})")
    print("=" * 50)

    response = requests.get(f"{BASE_URL}/spots/{spot_id}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("✅ Successfully retrieved parking spot!")
        return response.json()
    else:
        print("❌ Failed to retrieve parking spot!")
        return None

def test_get_nonexistent_spot():
    """Test getting a non-existent parking spot"""
    print("\n" + "=" * 50)
    print("Testing Get Non-Existent Parking Spot")
    print("=" * 50)

    fake_id = "00000000-0000-0000-0000-000000000000"
    response = requests.get(f"{BASE_URL}/spots/{fake_id}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 404:
        print("✅ Correctly returned 404 for non-existent spot!")
        return True
    else:
        print("❌ Expected 404 status code!")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting Parking Spots Tests\n")

    # Step 1: Login to get auth token
    auth_token = test_login()
    if not auth_token:
        print("\n❌ Cannot proceed without authentication")
        exit(1)

    # Step 2: Create a parking spot
    spot_id = test_create_spot(auth_token)

    # Step 3: List all parking spots
    test_list_spots()

    # Step 4: List with filters
    test_list_spots_with_filters()

    # Step 5: Get specific spot
    if spot_id:
        test_get_spot(spot_id)

    # Step 6: Test non-existent spot
    test_get_nonexistent_spot()

    print("\n" + "=" * 50)
    print("✅ ALL PARKING SPOTS TESTS COMPLETED!")
    print("=" * 50)
