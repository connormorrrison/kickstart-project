"""
Test bookings endpoints
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

# Store token, spot_id, and booking_id globally for reuse
token = None
spot_id = None
booking_id = None

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
        return token
    else:
        print("❌ Login failed!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return None

def test_get_existing_spot():
    """Get an existing parking spot to use for booking"""
    print("\n" + "=" * 50)
    print("Getting existing parking spot")
    print("=" * 50)

    response = requests.get(f"{BASE_URL}/spots")
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        spots = response.json()
        if spots and len(spots) > 0:
            global spot_id
            spot_id = spots[0]["id"]
            print(f"✅ Found parking spot: {spot_id}")
            print(f"   Address: {spots[0]['street']}, {spots[0]['city']}")
            print(f"   Price: ${spots[0]['price_per_hour']}/hour")
            return spot_id
        else:
            print("❌ No parking spots found!")
            return None
    else:
        print("❌ Failed to get parking spots!")
        return None

def test_create_booking(auth_token, spot_id):
    """Test creating a new booking"""
    print("\n" + "=" * 50)
    print("Testing Create Booking")
    print("=" * 50)

    # Use tomorrow's date
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    booking_data = {
        "spot_id": spot_id,
        "booking_date": tomorrow,
        "start_time": "10:00",
        "end_time": "12:00"
    }

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        print("✅ Booking created successfully!")
        global booking_id
        booking_id = response.json()["id"]
        return booking_id
    else:
        print("❌ Failed to create booking!")
        return None

def test_create_conflicting_booking(auth_token, spot_id):
    """Test creating a conflicting booking (should fail)"""
    print("\n" + "=" * 50)
    print("Testing Create Conflicting Booking (should fail)")
    print("=" * 50)

    # Use tomorrow's date with overlapping time
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    booking_data = {
        "spot_id": spot_id,
        "booking_date": tomorrow,
        "start_time": "11:00",  # Overlaps with 10:00-12:00
        "end_time": "13:00"
    }

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 400:
        print("✅ Correctly rejected conflicting booking!")
        return True
    else:
        print("❌ Should have rejected conflicting booking!")
        return False

def test_list_bookings(auth_token):
    """Test listing user bookings"""
    print("\n" + "=" * 50)
    print("Testing List User Bookings")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.get(f"{BASE_URL}/bookings", headers=headers)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        bookings = response.json()
        print(f"Found {len(bookings)} bookings")
        for booking in bookings:
            print(f"\n  Booking ID: {booking['id']}")
            print(f"  Spot ID: {booking['spot_id']}")
            print(f"  Date: {booking['booking_date']}")
            print(f"  Time: {booking['start_time']} - {booking['end_time']}")
            print(f"  Total Price: ${booking['total_price']}")
            print(f"  Status: {booking['status']}")
        print("\n✅ Successfully listed bookings!")
        return bookings
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("❌ Failed to list bookings!")
        return None

def test_list_bookings_with_filter(auth_token):
    """Test listing bookings with status filter"""
    print("\n" + "=" * 50)
    print("Testing List Bookings with Status Filter (confirmed)")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.get(f"{BASE_URL}/bookings?status_filter=confirmed", headers=headers)
    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        bookings = response.json()
        print(f"Found {len(bookings)} confirmed bookings")
        print("✅ Successfully listed filtered bookings!")
        return bookings
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("❌ Failed to list filtered bookings!")
        return None

def test_get_booking(auth_token, booking_id):
    """Test getting a specific booking"""
    print("\n" + "=" * 50)
    print(f"Testing Get Booking (ID: {booking_id})")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.get(f"{BASE_URL}/bookings/{booking_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("✅ Successfully retrieved booking!")
        return response.json()
    else:
        print("❌ Failed to retrieve booking!")
        return None

def test_cancel_booking(auth_token, booking_id):
    """Test cancelling a booking"""
    print("\n" + "=" * 50)
    print(f"Testing Cancel Booking (ID: {booking_id})")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.delete(f"{BASE_URL}/bookings/{booking_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("✅ Successfully cancelled booking!")
        return True
    else:
        print("❌ Failed to cancel booking!")
        return False

def test_cancel_already_cancelled(auth_token, booking_id):
    """Test cancelling an already cancelled booking (should fail)"""
    print("\n" + "=" * 50)
    print("Testing Cancel Already Cancelled Booking (should fail)")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    response = requests.delete(f"{BASE_URL}/bookings/{booking_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 400:
        print("✅ Correctly rejected cancelling already cancelled booking!")
        return True
    else:
        print("❌ Should have rejected cancelling already cancelled booking!")
        return False

def test_get_nonexistent_booking(auth_token):
    """Test getting a non-existent booking"""
    print("\n" + "=" * 50)
    print("Testing Get Non-Existent Booking")
    print("=" * 50)

    headers = {
        "Authorization": f"Bearer {auth_token}"
    }

    fake_id = "00000000-0000-0000-0000-000000000000"
    response = requests.get(f"{BASE_URL}/bookings/{fake_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 404:
        print("✅ Correctly returned 404 for non-existent booking!")
        return True
    else:
        print("❌ Expected 404 status code!")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting Bookings Tests\n")

    # Step 1: Login to get auth token
    auth_token = test_login()
    if not auth_token:
        print("\n❌ Cannot proceed without authentication")
        exit(1)

    # Step 2: Get an existing parking spot
    spot_id = test_get_existing_spot()
    if not spot_id:
        print("\n❌ Cannot proceed without a parking spot")
        print("Run test_parking_spots.py first to create a parking spot")
        exit(1)

    # Step 3: Create a booking
    booking_id = test_create_booking(auth_token, spot_id)
    if not booking_id:
        print("\n❌ Failed to create booking")
        exit(1)

    # Step 4: Try to create a conflicting booking
    test_create_conflicting_booking(auth_token, spot_id)

    # Step 5: List all bookings
    test_list_bookings(auth_token)

    # Step 6: List bookings with filter
    test_list_bookings_with_filter(auth_token)

    # Step 7: Get specific booking
    test_get_booking(auth_token, booking_id)

    # Step 8: Cancel the booking
    test_cancel_booking(auth_token, booking_id)

    # Step 9: Try to cancel already cancelled booking
    test_cancel_already_cancelled(auth_token, booking_id)

    # Step 10: Test non-existent booking
    test_get_nonexistent_booking(auth_token)

    print("\n" + "=" * 50)
    print("✅ ALL BOOKINGS TESTS COMPLETED!")
    print("=" * 50)
